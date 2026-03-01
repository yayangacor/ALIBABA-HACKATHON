# Context & Role
You are an Expert Full-Stack Developer (React + Node.js) and an AI Integration Specialist working on a Hackathon Project called "FinLabs" (Zero-Effort AI Financial Assistant). Your goal is to implement two killer features to give the app a "Wow Factor" for the judges, without creating overly complex architectures.

I will provide you with an `implementation_plan.md` which contains the architectural decisions and a `MEMORY.md` which contains the current state of the codebase and project structure.

# Objectives
Implement the following two features based on the provided implementation plan:

## 1. Dynamic Subscription Icons (Clearbit API + Qwen)
**Goal:** Display accurate, premium-looking logos for subscriptions (e.g., Netflix, Spotify) in the UI without generating them from scratch, to avoid latency and hallucination.
**Mechanism:** 
- Instruct the backend Qwen LLM to always output the official domain of a subscription service (e.g., `netflix.com`) inside its Action payload.
- On the frontend, use the Clearbit Logo API (`https://logo.clearbit.com/{domain}`) as the `src` for the `<img>` tag to instantly render the logo.

## 2. Receipt Vision (Qwen-VL Integration)
**Goal:** Allow users to upload a photo of a payment receipt, let the AI read it, and automatically record the transaction.
**Mechanism:**
- **Frontend (`src/pages/Chat.jsx`)**: 
  - Add a Camera icon next to the chat input (using `lucide-react`).
  - Implement a hidden file input (`<input type="file" accept="image/*" />`).
  - Read the selected image file as a Base64 string (compress if necessary using a canvas utility to avoid payload size limit issues).
  - Show a small image preview above the input field.
  - Send the `imageBase64` along with the text message in the `POST /api/chat` request payload.
- **Backend (`server/server.js`)**: 
  - Update `POST /api/chat` to accept `imageBase64` from the request body.
  - If `imageBase64` is present, dynamically switch the model from `qwen-plus` to `qwen-vl-plus` or `qwen-vl-max` (vision-language models).
  - Format the messages array for the DashScope API to support multimodal content (an array of dicts containing `image` and `text`).
  - Update the System Prompt to instruct the VL model to extract the transaction details (Merchant, Amount, Category) from the image and return the existing `[ACTION:ADD_TRANSACTION:<merchant>:<amount>:<category>]` format.

# Instructions for Implementation
1. **Read `MEMORY.md`:** Understand the current state, routing, and how the `appStore.js` and `server.js` are currently wired up. Pay close attention to how `[ACTION:...]` tokens work.
2. **Review `implementation_plan.md`:** (I have attached this). Follow the proposed changes strictly.
3. **Frontend Changes:** Give me the exact code modifications needed for `src/pages/Chat.jsx`. Focus on adding state for the image attachment, the UI for the camera button and preview, the Base64 conversion logic, and the updated `handleSend` payload.
4. **Backend Changes:** Give me the exact code modifications needed for `server/server.js`. Focus on the logic to switch to `qwen-vl-max`, the formatting of the `messages` array for multimodal input according to Alibaba DashScope docs, and the updated System Prompt.
5. **Subscription UI:** Provide the code snippet or component update needed to display the Clearbit logo image based on the AI's domain extraction. (You may need to update the `buildSystemPrompt` to instruct the AI to include the domain in the `ACTION` format, e.g., `[ACTION:REVIEW_SUBSCRIPTIONS:<domain>]` or similar, and handle the parsing).

# Constraints & Style
- **No TypeScript.** Keep it pure React + Vite (JSX/JS).
- **Tailwind CSS v3.** Match the dark, premium fintech aesthetic described in the project.
- **Provide full code blocks** replacing existing functions or components where necessary, so I can copy-paste them directly into my files. Use placeholder comments like `// ...existing code...` only if the file is extremely long.

Please confirm you understand these requirements and proceed to generate the code for the Frontend and Backend changes.
