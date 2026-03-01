# Delete Subscription Page & Implement Insight Features

This plan outlines the steps to remove the Subscriptions page, rename the Timeline to Transaction, and introduce a new Insight page with budgeting capabilities.

## User Review Required
None of the changes are breaking, but please review the proposed backend endpoints for managing categories and budgets, and let me know if the Net Income calculation (Income - Spend) aligns with your expectations.

## Proposed Changes

### Frontend Components

#### [MODIFY] [src/App.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/App.jsx)
- Remove [Subscriptions](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#307-311) import and route.
- Rename `Timeline` import to [Transaction](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#289-306).
- Add `Insight` import and add it to the `PAGES` mapping.

#### [MODIFY] [src/components/BottomNav.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/components/BottomNav.jsx)
- Change tabs to: `Home`, [Transaction](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#289-306), [Chat](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#230-231), `Insight`.
- Update icons: Use a list/receipt icon for [Transaction](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#289-306) and a chart/pie icon for `Insight`.

#### [MODIFY] [src/store/appStore.js](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js)
- Rename [getGroupedTransactions](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#289-306) to be used by `Transaction.jsx`.
- Add `addCategory(categoryData)` and `rebalanceBudgets(updatedBudgets)` actions to call the new backend endpoints.
- Ensure `monthly_income` is stored in the `user` object when fetched from `/api/data`.

#### [DELETE] [src/pages/Subscriptions.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Subscriptions.jsx)
- Remove this file entirely as requested.

#### [NEW] `src/pages/Transaction.jsx`
- Rename from [src/pages/Timeline.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Timeline.jsx). Update title and internal component name to "Transaction" or "Transactions".

#### [NEW] `src/pages/Insight.jsx`
- **Net Income & Spend**: Display `user.monthly_income` and calculated spend ([getTotalMonthlySpending()](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#284-288)).
- **Progress Tracking**: Visualize [(Income - Spend) / Goal](file:///d:/WORK/HACKATHON/AliBaba2/src/App.jsx#18-47) (or similar metric) using a line/pie chart to show track towards financial goal (`totalMonthlyGoal`).
- **Categories List**: Render active budgets with spend vs limit progress bars.
- **Modals**: 
  - "Add a Category" (calls `POST /api/categories`).
  - "Rebalance Budgets" (calls `PUT /api/budgets` to adjust limits).

---

### Backend Components

#### [MODIFY] [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
- **`GET /api/data`**: Update the query for users to also `LEFT JOIN user_profiles` and extract `monthly_income`.
- **`POST /api/categories`** [NEW]: Endpoint to insert a new row in the `budgets` table for the user.
- **`PUT /api/budgets`** [NEW]: Endpoint to update the `limit` of existing rows in the `budgets` table for the user.
- *(Optional)* Remove `DELETE /api/subscriptions` if subscriptions are fully deprecated.

---

## Verification Plan

### Automated Tests
- Server starts successfully and all queries in `GET /api/data` execute without errors.

### Manual Verification
1. Run `npm run dev` and `node server.js`.
2. Open the app on `localhost:5173`.
3. Verify that the bottom nav shows "Home", "Transaction", "AI Chat", and "Insight".
4. Navigate to "Insight". Verify that Net Income and Spend values displayed are correct.
5. In "Insight", click "Add Category", fill the form, and verify that the category appears in the list and persists after refresh.
6. In "Insight", click "Rebalance Budgets", change a limit, save, and verify the progress bar updates and persists after refresh.
