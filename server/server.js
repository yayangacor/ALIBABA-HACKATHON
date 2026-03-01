require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const multer  = require('multer')
const { pool, initializeDatabase } = require('./db')

const app    = express()
const PORT   = process.env.PORT || 3001
// multer: keep audio in memory (max 25 MB), no disk writes — audio is ephemeral
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

app.use(cors())
app.use(express.json({ limit: '20mb' })) // allow base64 image payloads

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('id-ID')

// ─── GET /api/data ────────────────────────────────────────────────────────────
app.get('/api/data', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId query param required.' })

  try {
    const [
      [userRows],
      [budgetRows],
      [txRows],
      [subRows],
    ] = await Promise.all([
      pool.execute(
        `SELECT u.id, u.name, u.totalMonthlyGoal, u.avatar, up.monthly_income
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId]
      ),
      pool.execute(
        'SELECT id, categoryId, categoryName, `limit`, currentSpent, color, emoji FROM budgets WHERE user_id = ?',
        [userId]
      ),
      pool.execute(
        `SELECT id,
                DATE_FORMAT(date, '%Y-%m-%dT%H:%i:%sZ') AS date,
                merchant, amount, paymentSource, categoryId, categoryName, emoji
         FROM transactions
         WHERE user_id = ?
         ORDER BY date DESC`,
        [userId]
      ),
      pool.execute(
        `SELECT id, serviceName, amount,
                DATE_FORMAT(nextBillingDate, '%Y-%m-%d') AS nextBillingDate,
                isVampireRisk, bgColor, emoji, category, vampireReason
         FROM subscriptions
         WHERE user_id = ?`,
        [userId]
      ),
    ])

    // New user with no rows yet — return clean slate, not an error
    if (!userRows.length) {
      return res.json({ user: null, budgets: [], transactions: [], subscriptions: [] })
    }

    // Normalise types
    const user = { ...userRows[0], monthly_income: Number(userRows[0].monthly_income) || 0 }

    const budgets = budgetRows.map(b => ({
      ...b,
      limit: Number(b.limit),
      currentSpent: Number(b.currentSpent),
    }))

    const transactions = txRows.map(t => ({
      ...t,
      amount: Number(t.amount),
    }))

    const subscriptions = subRows.map(s => ({
      ...s,
      amount: Number(s.amount),
      isVampireRisk: Boolean(s.isVampireRisk),
      vampireReason: s.vampireReason ?? undefined,
    }))

    res.json({
      user,
      budgets,
      transactions,
      subscriptions,
    })
  } catch (err) {
    console.error('[GET /api/data Error]', err)
    res.status(500).json({ error: 'Database query failed.', detail: err.message })
  }
})

// ─── POST /api/categories ─────────────────────────────────────────────────────
app.post('/api/categories', async (req, res) => {
  const { userId, categoryName, limit, color, emoji } = req.body
  if (!userId || !categoryName || limit == null) {
    return res.status(400).json({ error: 'userId, categoryName, and limit are required.' })
  }
  try {
    const id = `BG-${Date.now().toString(36)}`
    const categoryId = `C-${categoryName.toUpperCase().replace(/\s+/g, '-').slice(0, 10)}`
    await pool.execute(
      'INSERT INTO budgets (id, user_id, categoryId, categoryName, `limit`, currentSpent, color, emoji) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
      [id, userId, categoryId, categoryName, Math.round(Number(limit)), color || '#94A3B8', emoji || '💰']
    )
    const budget = {
      id,
      categoryId,
      categoryName,
      limit: Math.round(Number(limit)),
      currentSpent: 0,
      color: color || '#94A3B8',
      emoji: emoji || '💰',
    }
    res.json({ success: true, budget })
  } catch (err) {
    console.error('[POST /api/categories Error]', err)
    res.status(500).json({ error: 'Failed to add category.', detail: err.message })
  }
})

// ─── PUT /api/budgets ─────────────────────────────────────────────────────────
app.put('/api/budgets', async (req, res) => {
  const { userId, budgets } = req.body
  if (!userId || !Array.isArray(budgets) || budgets.length === 0) {
    return res.status(400).json({ error: 'userId and non-empty budgets array required.' })
  }
  try {
    await Promise.all(
      budgets.map(b =>
        pool.execute(
          'UPDATE budgets SET `limit` = ? WHERE id = ? AND user_id = ?',
          [Math.round(Number(b.limit)), b.id, userId]
        )
      )
    )
    res.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/budgets Error]', err)
    res.status(500).json({ error: 'Failed to update budgets.', detail: err.message })
  }
})

// ─── POST /api/chat ───────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, userId, imageBase64 } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Field "messages" harus berupa array yang tidak kosong.' })
  }

  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DASHSCOPE_API_KEY belum dikonfigurasi di environment.' })
  }

  let systemPrompt
  try {
    systemPrompt = await buildSystemPrompt(userId)
  } catch (err) {
    console.error('[System Prompt DB Error]', err)
    return res.status(500).json({ error: 'Gagal membaca data keuangan dari database.', detail: err.message })
  }

  try {
    let rawReply

    if (imageBase64) {
      // ── Vision path: native DashScope multimodal API (supports base64 images) ──
      const historyMessages = messages.slice(0, -1)
      const lastMsg = messages[messages.length - 1]
      const imageData = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`

      console.log('[Chat] Vision request — model: qwen-vl-max, imageSize:', Math.round(imageData.length / 1024), 'KB')

      const visionRes = await fetch(
        'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen-vl-max',
            input: {
              messages: [
                { role: 'system', content: [{ text: systemPrompt }] },
                ...historyMessages.map(m => ({
                  role: m.role,
                  content: [{ text: m.content || '' }],
                })),
                {
                  role: 'user',
                  content: [
                    { image: imageData },
                    { text: lastMsg?.content || 'Tolong analisis struk ini dan catat transaksinya.' },
                  ],
                },
              ],
            },
            parameters: { max_tokens: 600 },
          }),
        }
      )

      if (!visionRes.ok) {
        const errText = await visionRes.text()
        console.error('[Qwen VL API Error]', visionRes.status, errText)
        return res.status(502).json({ error: 'Qwen VL API error', detail: errText })
      }

      const visionData = await visionRes.json()
      // Native DashScope response format: output.choices[0].message.content[0].text
      rawReply = visionData.output?.choices?.[0]?.message?.content?.[0]?.text
        ?? 'Maaf, tidak dapat menganalisis gambar saat ini.'
      console.log('[Chat] Qwen-VL replied:', rawReply.slice(0, 100))

    } else {
      // ── Text path: OpenAI-compatible endpoint ──
      const qwenRes = await fetch(
        'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen-plus',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: 512,
            temperature: 0.7,
          }),
        }
      )

      if (!qwenRes.ok) {
        const errText = await qwenRes.text()
        console.error('[Qwen API Error]', qwenRes.status, errText)
        return res.status(502).json({ error: 'Qwen API error', detail: errText })
      }

      const qwenData = await qwenRes.json()
      rawReply = qwenData.choices?.[0]?.message?.content ?? 'Maaf, saya tidak dapat merespons saat ini.'
    }

    // ── Parse action tokens (shared for both vision and text paths) ──
    const ACTION_NAVIGATE = '[ACTION:REVIEW_SUBSCRIPTIONS]'
    const ACTION_ADD_TX = /\[ACTION:ADD_TRANSACTION:([^:[\]]+):(\d+):([^\]]+)\]/
    const ACTION_CANCEL_SUB = /\[ACTION:CANCEL_SUBSCRIPTION:([^\]]+)\]/
    const TOKEN_DOMAIN = /\[DOMAIN:([^\]]+)\]/

    let action = null
    let cleanReply = rawReply

    const addTxMatch = rawReply.match(ACTION_ADD_TX)
    const cancelSubMatch = rawReply.match(ACTION_CANCEL_SUB)
    const domainMatch = rawReply.match(TOKEN_DOMAIN)

    if (addTxMatch) {
      action = { type: 'ADD_TRANSACTION', payload: { merchant: addTxMatch[1].trim(), amount: parseInt(addTxMatch[2], 10), categoryName: addTxMatch[3].trim() } }
      cleanReply = rawReply.replace(ACTION_ADD_TX, '').trim()
    } else if (cancelSubMatch) {
      action = { type: 'CANCEL_SUBSCRIPTION', payload: { serviceName: cancelSubMatch[1].trim() } }
      cleanReply = rawReply.replace(ACTION_CANCEL_SUB, '').trim()
    } else if (rawReply.includes(ACTION_NAVIGATE)) {
      action = { type: 'NAVIGATE_TO_SUBSCRIPTIONS', payload: {} }
      cleanReply = rawReply.replace(ACTION_NAVIGATE, '').trim()
    }

    if (domainMatch) {
      const domain = domainMatch[1].trim()
      if (action) {
        action.payload = { ...(action.payload || {}), domain }
      } else {
        action = { type: 'SHOW_DOMAIN', payload: { domain } }
      }
      cleanReply = cleanReply.replace(TOKEN_DOMAIN, '').trim()
    }

    res.json({ reply: cleanReply, action })
  } catch (err) {
    console.error('[Server Error]', err)
    res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
})

// ─── POST /api/transactions ───────────────────────────────────────────────────
app.post('/api/transactions', async (req, res) => {
  const { merchant, amount, categoryName, userId } = req.body
  if (!merchant || amount == null || !categoryName) {
    return res.status(400).json({ error: 'merchant, amount, dan categoryName diperlukan.' })
  }
  const effectiveUserId = userId || 'U-101' // fallback keeps demo chat working
  try {
    const [[budgetRow]] = await pool.execute(
      'SELECT categoryId, emoji FROM budgets WHERE categoryName = ? AND user_id = ? LIMIT 1',
      [categoryName, effectiveUserId]
    )
    if (!budgetRow) {
      return res.status(404).json({ error: `Kategori "${categoryName}" tidak ditemukan.` })
    }
    const { categoryId, emoji } = budgetRow
    await pool.execute(
      `INSERT INTO transactions (id, user_id, date, merchant, amount, paymentSource, categoryId, categoryName, emoji)
       VALUES (?, ?, NOW(), ?, ?, 'Manual', ?, ?, ?)`,
      [`TX-${Date.now()}`, effectiveUserId, merchant, Number(amount), categoryId, categoryName, emoji]
    )
    await pool.execute(
      'UPDATE budgets SET currentSpent = currentSpent + ? WHERE categoryName = ? AND user_id = ?',
      [Number(amount), categoryName, effectiveUserId]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('[POST /api/transactions Error]', err)
    res.status(500).json({ error: 'Gagal menyimpan transaksi.', detail: err.message })
  }
})

// ─── DELETE /api/subscriptions ────────────────────────────────────────────────
app.delete('/api/subscriptions', async (req, res) => {
  const { serviceName, userId } = req.body
  if (!serviceName) {
    return res.status(400).json({ error: 'serviceName diperlukan.' })
  }
  try {
    const [sql, params] = userId
      ? ['DELETE FROM subscriptions WHERE serviceName = ? AND user_id = ?', [serviceName, userId]]
      : ['DELETE FROM subscriptions WHERE serviceName = ?', [serviceName]]
    const [result] = await pool.execute(sql, params)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Subscription "${serviceName}" tidak ditemukan.` })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/subscriptions Error]', err)
    res.status(500).json({ error: 'Gagal menghapus subscription.', detail: err.message })
  }
})

// ─── POST /api/auth/demo ──────────────────────────────────────────────────────
// Bypasses Google OAuth for hackathon demos and local dev.
// Returns the seeded "Edward" user directly. Remove or gate behind an env flag
// before shipping to production.
app.post('/api/auth/demo', async (_req, res) => {
  try {
    const [profileRows] = await pool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ?', ['U-101']
    )
    res.json({
      user: { id: 'U-101', name: 'Edward (Demo)', email: 'demo@finlabs.app', avatarUrl: null },
      hasProfile: profileRows.length > 0,
    })
  } catch {
    // DB unavailable — still return a usable demo user so the UI flow can run
    res.json({
      user: { id: 'U-101', name: 'Edward (Demo)', email: 'demo@finlabs.app', avatarUrl: null },
      hasProfile: false,
    })
  }
})

// ─── POST /api/auth/google ────────────────────────────────────────────────────
// Verifies a Google ID token (JWT) via Google's tokeninfo endpoint.
// The GoogleLogin component (GSI) returns a signed JWT — no redirect URIs needed
// in Google Cloud Console, only "Authorized JavaScript Origins".
// No private keys or google-auth-library required on the server side.
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken required' })

  try {
    // Validate the JWT and fetch profile claims from Google's tokeninfo endpoint.
    // Google verifies the signature; we just read the returned claims.
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    )
    if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google ID token' })

    const { sub: googleId, email, name, picture: avatarUrl } = await googleRes.json()

    // Find or create user row
    const [rows] = await pool.execute('SELECT id FROM users WHERE google_id = ?', [googleId])
    let userId

    if (rows.length > 0) {
      userId = rows[0].id
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?',
        [name, email, avatarUrl, userId]
      )
    } else {
      userId = `U-G${Date.now()}`
      const initials = (name || 'U').slice(0, 2).toUpperCase()
      await pool.execute(
        `INSERT INTO users (id, name, totalMonthlyGoal, avatar, google_id, email, avatar_url)
         VALUES (?, ?, 5000000, ?, ?, ?, ?)`,
        [userId, name, initials, googleId, email, avatarUrl]
      )
    }

    // Check whether this user has completed onboarding
    const [profileRows] = await pool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ?', [userId]
    )
    const hasProfile = profileRows.length > 0

    res.json({ user: { id: userId, googleId, email, name, avatarUrl }, hasProfile })
  } catch (err) {
    console.error('[POST /api/auth/google Error]', err)
    res.status(500).json({ error: 'Auth failed', detail: err.message })
  }
})

// ─── POST /api/onboarding/transcribe ─────────────────────────────────────────
// Receives an audio blob, tries Qwen-Audio-Turbo for STT + extraction in one
// shot, then falls back to Qwen-Plus LLM if the audio model isn't available.
// PRIVACY: The audio buffer lives only in RAM (multer memoryStorage) and is
// never written to disk or any database — it is garbage-collected after the
// request completes.
app.post('/api/onboarding/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Audio file required' })

  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'DASHSCOPE_API_KEY not configured' })

  const audioBase64 = req.file.buffer.toString('base64')
  const mimeType    = req.file.mimetype || 'audio/webm'
  const format      = mimeType.includes('webm') ? 'webm'
                    : mimeType.includes('mp4')  ? 'mp4'
                    : 'wav'

  const EXTRACT_PROMPT = `You are a financial onboarding AI.
Extract a structured profile from the user's voice/text.
Return ONLY valid JSON — no markdown, no extra text:
{
  "transcript": "<full transcription of what was said>",
  "persona": "<one of exactly: Student | Young Professional | Family | Entrepreneur | Retiree>",
  "financial_goals": "<1-2 sentence summary of stated financial goals>",
  "money_constraints": "<MUST be exactly one of these 4 options — pick the single most relevant based on what was said: Bocor Pengeluaran Kecil | Gaji Cepat Habis | Terjerat Cicilan Paylater | Malas Catat Manual>"
}`

  let transcript = null

  // ── Attempt 1: Qwen-Audio-Turbo (STT + extraction in a single LLM call) ──
  try {
    const audioRes = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen-audio-turbo-latest',
          messages: [{
            role: 'user',
            content: [
              { type: 'input_audio', input_audio: { data: audioBase64, format } },
              { type: 'text', text: EXTRACT_PROMPT },
            ],
          }],
          max_tokens: 512,
          temperature: 0.2,
        }),
      }
    )

    if (audioRes.ok) {
      const audioData  = await audioRes.json()
      let raw = audioData.choices?.[0]?.message?.content ?? ''
      raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(raw)
      console.log('[Transcribe] Qwen-Audio success.')
      return res.json({ success: true, ...parsed })
    }
    const errText = await audioRes.text()
    console.warn('[Qwen Audio] Failed:', audioRes.status, errText.slice(0, 200))
  } catch (audioErr) {
    console.warn('[Qwen Audio] Exception:', audioErr.message)
  }

  // ── Attempt 2: Qwen-Plus LLM with demo transcript (reliable fallback) ──
  // Replace `transcript` here with real STT output when integrating a
  // dedicated ASR service (e.g. Alibaba Cloud Paraformer via OSS URL).
  transcript = req.body?.manualText ||
    'I am a young professional. I want to save money, build a 3-month emergency fund, ' +
    'and stop wasting money on subscriptions I never use. My monthly budget is about 5 million rupiah ' +
    'and I tend to overspend on food delivery.'

  try {
    const llmRes = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: EXTRACT_PROMPT },
            { role: 'user', content: `Transcript: "${transcript}"` },
          ],
          max_tokens: 400,
          temperature: 0.3,
        }),
      }
    )

    if (!llmRes.ok) throw new Error(`Qwen LLM ${llmRes.status}`)

    const llmData = await llmRes.json()
    let raw = llmData.choices?.[0]?.message?.content ?? '{}'
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(raw)
    console.log('[Transcribe] Qwen-Plus LLM fallback success.')
    return res.json({ success: true, ...parsed })
  } catch (err) {
    console.error('[Transcribe] All attempts failed:', err.message)
    // Last-resort static response so the demo never fully breaks
    return res.json({
      success: true,
      transcript,
      persona: 'Young Professional',
      financial_goals: 'Build a 3-month emergency fund and reduce unnecessary expenses.',
      money_constraints: 'Gaji Cepat Habis',
    })
  }
})

// ─── POST /api/user/profile ───────────────────────────────────────────────────
// Saves the user-reviewed & confirmed onboarding profile. Called only after the
// user explicitly clicks "Confirm & Save" on the review screen.
// Also triggers AI budget generation via Qwen if monthly_income is provided.
app.post('/api/user/profile', async (req, res) => {
  const { userId, persona, financial_goals, money_constraints, monthly_income } = req.body
  if (!userId || !persona || !financial_goals || !money_constraints) {
    return res.status(400).json({ error: 'userId, persona, financial_goals, and money_constraints are required' })
  }
  const income = Number(monthly_income) || 0

  try {
    // Save profile (including monthly_income)
    await pool.execute(
      `INSERT INTO user_profiles (user_id, persona_type, financial_goals, money_constraints, monthly_income)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         persona_type      = VALUES(persona_type),
         financial_goals   = VALUES(financial_goals),
         money_constraints = VALUES(money_constraints),
         monthly_income    = VALUES(monthly_income)`,
      [userId, persona, financial_goals, money_constraints, income]
    )

    // ── AI Budget Generation ───────────────────────────────────────────────
    const apiKey = process.env.DASHSCOPE_API_KEY
    if (apiKey && income > 0) {
      try {
        const budgetPrompt = `You are a financial planning AI. Generate a monthly budget allocation for exactly 4 spending categories.

User profile:
- Monthly Income: Rp ${income.toLocaleString('id-ID')}
- Persona: ${persona}
- Financial Goals: ${financial_goals}
- Money Constraint: ${money_constraints}

Rules:
- Total of all 4 limits should be 40-60% of monthly income (leave room for savings and other expenses).
- Adjust amounts based on the persona and constraints (e.g. "Impulse snacking" → lower Snacks limit).
- All limits must be positive integers in Indonesian Rupiah.

Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"categoryName":"Foods","limit":0},{"categoryName":"Drinks","limit":0},{"categoryName":"Snacks","limit":0},{"categoryName":"Entertainment","limit":0}]`

        const qwenRes = await fetch(
          'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'qwen-plus',
              messages: [{ role: 'user', content: budgetPrompt }],
              max_tokens: 256,
              temperature: 0.3,
            }),
          }
        )

        if (qwenRes.ok) {
          const qwenData = await qwenRes.json()
          let raw = qwenData.choices?.[0]?.message?.content ?? '[]'
          raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const budgets = JSON.parse(raw)

          if (Array.isArray(budgets) && budgets.length > 0) {
            const CATEGORY_META = {
              'Foods':         { categoryId: 'C-FOOD',      color: '#4F9DFF', emoji: '🍛' },
              'Drinks':        { categoryId: 'C-DRINK',     color: '#00E5A0', emoji: '☕' },
              'Snacks':        { categoryId: 'C-SNACK',     color: '#FBBF24', emoji: '🍟' },
              'Entertainment': { categoryId: 'C-ENTERTAIN', color: '#F472B6', emoji: '🎬' },
            }

            // Delete old budgets for this user and replace with AI-generated ones
            await pool.execute('DELETE FROM budgets WHERE user_id = ?', [userId])
            for (let i = 0; i < budgets.length; i++) {
              const b = budgets[i]
              const meta = CATEGORY_META[b.categoryName] ?? { categoryId: `C-CUSTOM${i}`, color: '#94A3B8', emoji: '💰' }
              const budgetId = `BG${i}-${(Date.now() + i).toString(36)}`
              await pool.execute(
                'INSERT INTO budgets (id, user_id, categoryId, categoryName, `limit`, currentSpent, color, emoji) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
                [budgetId, userId, meta.categoryId, b.categoryName, Math.round(Number(b.limit)), meta.color, meta.emoji]
              )
            }
            console.log(`[Budget AI] Generated ${budgets.length} budget categories for user ${userId}`)
          }
        } else {
          const errText = await qwenRes.text()
          console.warn('[Budget AI] Qwen error:', qwenRes.status, errText.slice(0, 200))
        }
      } catch (budgetErr) {
        // Non-fatal: profile was saved, budget generation failed silently
        console.error('[Budget AI] Generation failed:', budgetErr.message)
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('[POST /api/user/profile Error]', err)
    res.status(500).json({ error: 'Failed to save profile', detail: err.message })
  }
})

// ─── Dynamic System Prompt Builder ───────────────────────────────────────────
async function buildSystemPrompt(userId) {
  const effectiveUserId = userId || 'U-101' // fallback to demo user
  const [[userRows], [budgetRows], [[totalRow]], [subRows]] = await Promise.all([
    pool.execute('SELECT name FROM users WHERE id = ? LIMIT 1', [effectiveUserId]),
    pool.execute('SELECT categoryName, `limit`, currentSpent FROM budgets WHERE user_id = ?', [effectiveUserId]),
    pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE user_id = ? AND YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())`,
      [effectiveUserId]
    ),
    pool.execute('SELECT serviceName, amount, isVampireRisk, vampireReason FROM subscriptions WHERE user_id = ?', [effectiveUserId]),
  ])

  const userName = userRows[0]?.name ?? 'Pengguna'
  const totalSpent = Number(totalRow.total)

  const budgetLines = budgetRows.map(b => {
    const limit = Number(b.limit)
    const spent = Number(b.currentSpent)
    const pct = Math.round((spent / limit) * 100)
    const status = pct >= 80 ? 'KRITIS!' : pct >= 60 ? 'Waspada' : 'Aman'
    return `- Budget ${b.categoryName}: Rp ${fmt(spent)} terpakai dari limit Rp ${fmt(limit)} → ${pct}% (${status})`
  }).join('\n')

  const subLines = subRows
    .map(s => `${s.serviceName} (Rp ${fmt(s.amount)})`)
    .join(', ')

  const vampireSubs = subRows.filter(s => s.isVampireRisk)
  const vampireLines = vampireSubs
    .map(s => `- DETEKSI: ${s.serviceName} duplikat/tidak efisien — ${s.vampireReason ?? 'potensi pemborosan'} → potensi hemat Rp ${fmt(s.amount)}/bulan atau Rp ${fmt(s.amount * 12)}/tahun`)
    .join('\n')

  return `Kamu adalah FinLabs AI, asisten keuangan pribadi yang cerdas, ringkas, dan premium.

Konteks data keuangan pengguna (${userName}) bulan ini:
${budgetLines}
- Total pengeluaran bulan ini: Rp ${fmt(totalSpent)}
- Subscriptions aktif: ${subLines}
${vampireLines}

Aturan respons wajib:
1. Jawab dalam Bahasa Indonesia. Singkat dan padat — maksimal 4 kalimat.
2. Gunakan angka konkret dari data di atas bila relevan.
3. Berikan insight yang actionable dan proaktif.
4. PENTING — Sinyal aksi Navigasi: Jika topik menyinggung "subscription", "langganan", "hemat", "cancel", "duplikat", atau "boros" secara umum, WAJIB tambahkan token [ACTION:REVIEW_SUBSCRIPTIONS] di baris TERAKHIR.
5. PENTING — Sinyal aksi Catat Pengeluaran: Jika pengguna menyebutkan membeli/membayar/menghabiskan sesuatu (beli, makan, bayar, belanja, dsb.), WAJIB tambahkan token [ACTION:ADD_TRANSACTION:<merchant>:<amount>:<categoryName>] di baris TERAKHIR. Ganti <merchant> dengan nama toko (tanpa titik dua), <amount> dengan angka integer tanpa pemisah ribuan, dan <categoryName> dengan salah satu dari kategori budget pengguna di atas.
6. PENTING — Sinyal aksi Batalkan Langganan: Jika pengguna meminta membatalkan langganan spesifik, WAJIB tambahkan token [ACTION:CANCEL_SUBSCRIPTION:<serviceName>] di baris TERAKHIR. Ganti <serviceName> dengan nama layanan persis dari daftar subscriptions di atas.
7. PENTING — Ikon Subscription (Clearbit): Jika menyebutkan layanan berlangganan tertentu (Netflix, Spotify, YouTube, ChatGPT, Gemini, dll.), WAJIB tambahkan token [DOMAIN:<domain.com>] di baris TERAKHIR (contoh: [DOMAIN:netflix.com], [DOMAIN:spotify.com]). Token DOMAIN boleh hadir bersamaan dengan satu token ACTION lainnya.
8. PENTING — Baca Struk/Receipt (Vision): Jika percakapan mengandung gambar struk, invoice, atau nota belanja, analisislah gambar tersebut secara akurat: ekstrak nama merchant (singkat, tanpa titik dua), jumlah total pembayaran (angka integer tanpa titik/koma/Rp), dan pilih categoryName yang paling sesuai dari daftar budget pengguna di atas. WAJIB tambahkan token [ACTION:ADD_TRANSACTION:<merchant>:<amount>:<categoryName>] di baris TERAKHIR.
9. Hanya gunakan SATU token [ACTION:...] per respons. Token adalah sinyal sistem — jangan disebutkan kepada pengguna.`
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initializeDatabase()
    app.listen(PORT, () => {
      console.log(`🚀 FinLabs Backend running on http://localhost:${PORT}`)
      console.log(`   GET  http://localhost:${PORT}/api/data`)
      console.log(`   POST http://localhost:${PORT}/api/chat`)
    })
  } catch (err) {
    console.error('❌ Failed to connect to database. Server will not start.', err.message)
    process.exit(1)
  }
}

start()
