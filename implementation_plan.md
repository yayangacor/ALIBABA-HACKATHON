# Goal Description

The objective is to update the FinLabs application to dynamically integrate data. Currently, the app loads mock data seeded in ApsaraDB, but the AI assistant ([Chat.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx)) can only "navigate" to the subscriptions tab (`NAVIGATE_TO_SUBSCRIPTIONS`). We want the AI to be able to actually trigger database changes (CRUD operations) such as adding a new transaction or canceling a subscription, making the app truly dynamic.

## Proposed Changes

### Backend

#### [MODIFY] server.js
- **Dynamic System Prompt ([buildSystemPrompt](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js#139-187))**:
  - Add instructions for two new Qwen ACTION tokens:
    - `[ACTION:ADD_TRANSACTION:<merchant>:<amount>:<categoryName>]` for when user logs a new expense.
    - `[ACTION:CANCEL_SUBSCRIPTION:<serviceName>]` for when user agrees to cancel a subscription.
- **Chat Endpoint (`POST /api/chat`)**:
  - Update action parser to parse these new tokens.
  - Return `{ type: 'ADD_TRANSACTION', payload: { merchant, amount, categoryName } }` or `{ type: 'CANCEL_SUBSCRIPTION', payload: { serviceName } }` or `{ type: 'NAVIGATE_TO_SUBSCRIPTIONS' }`.
- **New CRUD Endpoints**:
  - `POST /api/transactions`
    - Expected body: `{ merchant, amount, categoryName }`
    - Action: Lookup `categoryId` and `emoji` from `budgets` based on `categoryName`. Insert new record into `transactions` (with generated ID and `NOW()` date). Update `currentSpent` in `budgets`.
  - `DELETE /api/subscriptions`
    - Expected body: `{ serviceName }`
    - Action: Delete the record from `subscriptions` where `serviceName` matches.

### Frontend

#### [MODIFY] src/pages/Chat.jsx
- **Action Handling in [AITextBubble](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx#206-230)**:
  - Update UI to handle the new [action](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#210-227) objects instead of a simple boolean/string.
  - If `action.type === 'NAVIGATE_TO_SUBSCRIPTIONS'`, show "Review Subscriptions →" button.
  - If `action.type === 'ADD_TRANSACTION'`, show "Catat Pengeluaran Rp X di Y" button.
  - If `action.type === 'CANCEL_SUBSCRIPTION'`, show "Batalkan Langganan X" button.
- **API Call Handling**:
  - Implement functions `handleAddTransaction(payload)` and `handleCancelSubscription(payload)` inside [Chat.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx).
  - These functions will call the new backend endpoints (`POST /api/transactions` and `DELETE /api/subscriptions`).
  - Upon success, call `useAppStore.getState().fetchAppData()` to dynamically refresh the app state.

## Verification Plan

### Manual Verification
1. Start the backend (`node server.js`) and frontend (`npm run dev`).
2. Go to the Chat tab.
3. Chat: "Baru aja beli kopi di Starbucks harga 50000"
   - Expected: AI responds and shows an action button to "Catat Pengeluaran Rp 50.000 di Starbucks".
   - Click Button: Verify that the total monthly spending in the Home tab increases by 50,000, and the timeline shows the new transaction.
4. Chat: "Tolong batalkan langganan ChatGPT Go"
   - Expected: AI responds and shows an action button to "Batalkan Langganan ChatGPT Go".
   - Click Button: Verify that the subscription is removed from the Subscriptions tab.
