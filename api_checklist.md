# API Implementation & Testing Workflow Checklist

This checklist is structured based on a realistic user workflow—from initial system setup all the way to a customer paying their bill and closing a table. Implementing and testing the APIs in this exact order ensures that you always have the necessary prerequisite data (like a logged-in user, a created restaurant, an active menu) for the next step.

## Phase 1: System Admin & Unified Auth

_The foundation. The Super User creates the first tenant._(done)

- [x] **POST `/api/v1/auth/system/login`**: Authenticate as `SUPER_USER` (from seed).
- [x] **POST `/api/v1/restaurants`**: Create a new Restaurant and its root `OWNER`. Requires `SUPER_USER` token.
- [x] **GET `/api/v1/restaurants`**: List all restaurants.
- [x] **GET `/api/v1/restaurants/:id`**: Get details of a specific restaurant.
- [x] **PATCH `/api/v1/restaurants/:id`**: Update restaurant details. Requires `SUPER_USER` token.
- [x] **DELETE `/api/v1/restaurants/:id`**: Delete a restaurant. Requires `SUPER_USER` token.
- [x] **GET `/api/v1/auth/system/me`**: Get Platform Admin profile.

- [x] **POST `/api/v1/auth/login/user`**: Authenticate as the Restaurant `OWNER`.
- [x] **GET `/api/v1/auth/user/me`**: Get Restaurant Staff profile.

- [x] **GET `/api/v1/restaurant/me`**: Access by all stuff member
- [x] **PATCH `/api/v1/restaurant/me`**: Update the restaurant info. `OWNER` and `MANAGER` role required.

_User Management(System)_

- [x] **POST `/api/v1/users/system`**: Create a new System User. Requires `SUPER_USER` token.
- [x] **GET `/api/v1/users/system`**: List all System User.
- [x] **GET `/api/v1/users/system/:id`**: Get details of a specific System Admin.
- [x] **PATCH `/api/v1/users/system/:id`**: Update System Admin details. Requires `SUPER_USER` token.
- [x] **DELETE `/api/v1/users/system/:id`**: Delete a System Admin. Requires `SUPER_USER` token.
- [x] **GET `/api/v1/users/tenant`**: List all users of tenant (accept filter by `RestuarantId`)

## Phase 2: Restaurant Configuration

_The newly created Owner logs in and sets up their restaurant._

_User Management(Tenant_)

- [x] **GET `/api/v1/users/me`**: List all staff of own restaurant. `OWNER``MANAGER` role required
- [x] **GET `/api/v1/users/me/:id`**: Get details of a specific Staff.
- [x] **PATCH `/api/v1/users/me/:id`**: Update a specific staff
- [x] **DELETE `/api/v1/users/me/:id`**: Delete a staff
- [x] **POST `/api/v1/users/me`**: Create a new Staff member.

## Phase 3: Menu Building

_You need a menu before you can take orders._

_Category Management_

- [x] **POST `/api/v1/category`**: Create menu categories (e.g., "Starters", "Mains", "Drinks").
- [x] **GET `/api/v1/category`**: Fetch all categories (needed for dropdowns when creating items).
- [x] **GET `/api/v1/category/:id`**: Fetch a specific category.
- [x] **PATCH `/api/v1/category/:id`**: Update a category's name.
- [x] **DELETE `/api/v1/category/:id`**: Delete a category.

_Item Management_

- [ ] **POST `/api/v1/menu`**: Create a `MenuItem` (requires a valid `categoryId`).
- [ ] **GET `/api/v1/menu`**: List all menu items. Should support filtering by category.
- [ ] **GET `/api/v1/menu/:id`**: Get an single Item
- [ ] **PATCH `/api/v1/menu/:id`**: Update price, availability, or image of an item.
- [ ] **DELETE `/api/v1/menu/:id`**: Delete an item.

## Phase 4: Table Setup

_You need physical tables mapped out for QR codes._

- [ ] **POST `/api/v1/table`**: Create a Table (e.g., Table "T-01").
- [ ] **GET `/api/v1/table`**: List all tables and their current statuses.
- [ ] **GET `/api/v1/table/:id/qr`**: Generate/Retrieve the unique QR code URL for the table.

## Phase 5: The Core Workflow (Sessions & Orders)

_The heart of the application. Handles both QR ordering and Staff POS ordering._

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

_The customer finishes their meal and pays._

- [ ] **GET `/api/v1/session/:id/bill`**: Calculates the `subtotal` of all orders in the session.
- [ ] **PATCH `/api/v1/session/:id/discount`**: Manager applies a discount to the session if needed.
- [ ] **POST `/api/v1/session/:id/close`**: Marks session as `COMPLETED`, calculates `finalAmount`, and frees the table (marks table as `CLEANING` or `FREE`).
- [ ] **PATCH `/api/v1/table/:id/status`**: Waiter marks a `CLEANING` table back to `FREE`.

## Phase 7: Analytics & Back-Office

_End-of-day operations._

- [ ] **POST `/api/v1/expense`**: Owner/Manager adds a daily expense (e.g., groceries).
- [ ] **GET `/api/v1/expense`**: List expenses.
- [ ] **GET `/api/v1/report/dashboard`**: Returns high-level metrics (Today's Sales, Active Orders, Top Selling Items) for the dashboard UI.
