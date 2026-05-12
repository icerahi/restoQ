# API Implementation & Testing Workflow Checklist

This checklist is structured based on a realistic user workflow—from initial system setup all the way to a customer paying their bill and closing a table. Implementing and testing the APIs in this exact order ensures that you always have the necessary prerequisite data (like a logged-in user, a created restaurant, an active menu) for the next step.

## Phase 1: System Admin & Unified Auth
*The foundation. The Super User creates the first tenant.*

- [x] **POST `/api/v1/auth/login`**: Authenticate as `SUPER_USER` (from seed).
- [x] **POST `/api/v1/system/restaurants`**: Create a new Restaurant and its root `OWNER`. Requires `SUPER_USER` token.
- [x] **GET `/api/v1/system/restaurants`**: List all restaurants.

## Phase 2: Restaurant Configuration
*The newly created Owner logs in and sets up their restaurant.*

- [ ] **POST `/api/v1/auth/login`**: Authenticate as the Restaurant `OWNER`. All subsequent requests in phases 2-7 use this token.
- [ ] **PATCH `/api/v1/restaurant/info`**: Update the restaurant's logo, address, or phone number.
- [ ] **POST `/api/v1/restaurant/users`**: (Optional) Add a `MANAGER`, `WAITER`, or `KITCHEN` staff member.
- [ ] **GET `/api/v1/restaurant/users`**: List all staff for the restaurant.

## Phase 3: Menu Building
*You need a menu before you can take orders.*

- [ ] **POST `/api/v1/category`**: Create menu categories (e.g., "Starters", "Mains", "Drinks").
- [ ] **GET `/api/v1/category`**: Fetch all categories (needed for dropdowns when creating items).
- [ ] **POST `/api/v1/menu`**: Create a `MenuItem` (requires a valid `categoryId`).
- [ ] **GET `/api/v1/menu`**: List all menu items. Should support filtering by category.
- [ ] **PATCH `/api/v1/menu/:id`**: Update price, availability, or image of an item.

## Phase 4: Table Setup
*You need physical tables mapped out for QR codes.*

- [ ] **POST `/api/v1/table`**: Create a Table (e.g., Table "T-01").
- [ ] **GET `/api/v1/table`**: List all tables and their current statuses.
- [ ] **GET `/api/v1/table/:id/qr`**: Generate/Retrieve the unique QR code URL for the table.

## Phase 5: The Core Workflow (Sessions & Orders)
*The heart of the application. Handles both QR ordering and Staff POS ordering.*

**Customer / QR Flow:**
- [ ] **GET `/api/v1/public/menu/:restaurantSlug`**: Public route to fetch the menu without auth.
- [ ] **POST `/api/v1/session/start`**: Public route (triggered by scanning QR). Validates table, creates a `TableSession`, and marks the Table as `OCCUPIED`. Returns a `sessionId` (stored in local storage/cookie for the customer).
- [ ] **POST `/api/v1/order/qr`**: Customer submits an order. Requires `sessionId` and an array of `menuItemId` + `quantity`. Order status starts as `PENDING`.
- [ ] **GET `/api/v1/order/session/:sessionId`**: Customer checks the real-time status of their orders.

**Staff / POS Flow:**
- [ ] **GET `/api/v1/session/active`**: Staff views all currently occupied tables.
- [ ] **POST `/api/v1/order/pos`**: Staff creates an order on behalf of the customer. Requires `sessionId`. Automatically marks `createdById`.

**Kitchen Flow:**
- [ ] **GET `/api/v1/order/pending`**: Kitchen views orders that need preparation.
- [ ] **PATCH `/api/v1/order/:id/status`**: Staff updates order state (`PENDING` -> `APPROVED` -> `PREPARING` -> `READY` -> `SERVED`).

## Phase 6: Billing & Session Close
*The customer finishes their meal and pays.*

- [ ] **GET `/api/v1/session/:id/bill`**: Calculates the `subtotal` of all orders in the session.
- [ ] **PATCH `/api/v1/session/:id/discount`**: Manager applies a discount to the session if needed.
- [ ] **POST `/api/v1/session/:id/close`**: Marks session as `COMPLETED`, calculates `finalAmount`, and frees the table (marks table as `CLEANING` or `FREE`).
- [ ] **PATCH `/api/v1/table/:id/status`**: Waiter marks a `CLEANING` table back to `FREE`.

## Phase 7: Analytics & Back-Office
*End-of-day operations.*

- [ ] **POST `/api/v1/expense`**: Owner/Manager adds a daily expense (e.g., groceries).
- [ ] **GET `/api/v1/expense`**: List expenses.
- [ ] **GET `/api/v1/report/dashboard`**: Returns high-level metrics (Today's Sales, Active Orders, Top Selling Items) for the dashboard UI.
