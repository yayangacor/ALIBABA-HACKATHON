# FinLabs – Chatbot & Budgeting AI Implementation Plan

## Goal Description
1. Fix the bug where transactions added via chatbot aren't immediately reflected for the logged-in user.
2. Fix the dummy context and Quick Insight navigation issues.
3. Add a "Monthly Income" field to the onboarding personalization.
4. Implement an AI automated budgeting feature that dynamically generates a personalized budget breakdown based on income, goals, and constraints.
5. Provide a smooth loading experience ("Analyzing Budgeting") on the UI.

## Proposed Changes

### Frontend Fixes (App & Store)
#### [MODIFY] [src/pages/Home.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx)
- Update [handleQuickInsightTap](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#244-248) to only perform navigation ([setTab('chat')](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#226-227)) and **not** set `chatTriggered(true)`. This prevents the chatbot from launching the hardcoded dummy auto-play sequence when clicked, satisfying the requirement to just navigate.

#### [MODIFY] [src/pages/Chat.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx)
- Fix the bug where adding transactions/cancelling subscriptions don't reflect. The issue is [Chat.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx) isn't sending `userId` to the backend. We will update [handleAddTransaction](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx#271-288) and [handleCancelSubscription](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx#289-306) to include `userId: useAppStore.getState().user.id`.
- Update [handleSend](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx#343-386) to include `userId` in the payload to `/api/chat` so the backend can fetch the correct real-time data instead of falling back to default dummy users.

### Backend Infrastructure
#### [MODIFY] [server/db.js](file:///d:/WORK/HACKATHON/AliBaba2/server/db.js)
- Update the live migration logic to add `monthly_income INT` to the `user_profiles` table automatically on startup if it doesn't exist.

#### [MODIFY] [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
- **POST `/api/chat`**: Accept `userId` from the request body and pass it to [buildSystemPrompt(userId)](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js#435-485). 
- **[buildSystemPrompt(userId)](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js#435-485)**: Update the queries to filter by `WHERE user_id = ?` instead of defaulting to the first user found or ignoring the user. This ensures the AI context is 100% accurate for the current user.
- **POST `/api/user/profile`**: 
  - Accept `monthly_income` from the request body and save it to `user_profiles`.
  - Introduce a new integration with Qwen AI right after saving the profile: prompt the AI to generate a realistic budget for 4 categories (Foods, Drinks, Snacks, Entertainment) based on the submitted income, constraints, and goals.
  - Delete old budgets for the user and insert the new AI-generated budgets to the `budgets` table before returning success.

### Frontend Onboarding (Income & AI Budgeting)
#### [MODIFY] [src/pages/OnboardingPage.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/OnboardingPage.jsx)
- Add a new input field for "Monthly Income" (Pendapatan Bulanan) in [PhaseReview](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/OnboardingPage.jsx#247-377) and [PhaseManual](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/OnboardingPage.jsx#378-461).
- Add a new `budget_processing` loading state (Phase). After the user clicks "Confirm & Save", show a cinematic loading screen ("✨ AI is analyzing your income and constraints to create the perfect budget...") while waiting for `/api/user/profile` to return.
- Once saved, fetch the latest user data (`useAppStore.getState().fetchAppData()`), show a brief summary of the generated budgets, and finally navigate to the Home dashboard.

## Verification Plan

### Automated Tests
_No formal automated tests exist in this simple Vite/Express MVP setup._

### Manual Verification
1. **Onboarding & AI Budgeting**: 
   - Start the app, log out, and log in with Google.
   - Proceed to Onboarding (text or voice), fill in all fields including the new "Monthly Income" (e.g., `8000000`).
   - Click "Save". Verify the UI transitions to a shiny loading screen.
   - Wait for completion. Verify the Home dashboard budget sections display numbers that add up logically against the inputted income.
2. **Chat & Transactions**:
   - Go to Chat tab. Talk to the bot (e.g. "Saya baru saja makan di McDonald's habis 50000").
   - Click the "Catat Pengeluaran" action bubble.
   - Verify the Home tab now shows the spending reflected in both the top total and the breakdown.
3. **Quick Insight Navigation**:
   - On the Home tab, tap the Quick Insight card.
   - Verify it navigates to Chat *without* auto-playing the dummy demo conversation.
