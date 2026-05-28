# restoQ

restoQ is a comprehensive, multi-tenant restaurant management API designed to streamline operations from system administration to customer ordering. It provides a robust backend solution for managing restaurants, staff, menus, and tables, with a focus on QR-based ordering systems.

## Key Features

- **Multi-Tenant Architecture**: Securely isolates data and operations for each restaurant, managed by a central system administration level.
- **Role-Based Access Control (RBAC)**:
    - **System Level**: `SUPER_USER` and `SYSTEM_STAFF` roles for platform management.
    - **Tenant (Restaurant) Level**: `OWNER`, `MANAGER`, `CHEF`, and `STAFF` roles for restaurant-specific permissions.
- **Restaurant Management**: System administrators can perform full CRUD operations on restaurants and their associated owner accounts.
- **Staff Management**: Restaurant owners and managers can create, manage, and assign roles to their staff members.
- **Menu & Category Management**: Easily create and organize menu items into categories (e.g., Starters, Mains, Drinks).
- **Table Management**: Define restaurant tables and generate unique QR codes for each.
- **Dynamic QR Code Generation**: An endpoint generates a custom, beautifully designed PNG image for each table's QR code, pointing to the ordering interface.
- **Unified Authentication**: Secure JWT-based authentication for both system and restaurant users.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **ORM**: Prisma with PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod
- **Real-time Communication**: Socket.IO
- **Development**: `tsx` for live-reloading

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/icerahi/restoQ.git
    cd restoq
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your database connection string and a JWT secret:
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/restoq_db"
    JWT_SECRET="your-super-secret-jwt-key"
    PORT=5000
    NODE_ENV="development"
    SUPERUSER_EMAIL="admin@quicktable.com"
    SUPERUSER_PASSWORD="password123"
    ```

4.  **Run database migrations:**
    This command will create the database schema based on `prisma/schema.prisma`.
    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database:**
    This command will create the initial `SUPER_USER` account using the credentials from your `.env` file.
    ```bash
    npx prisma db seed
    ```

6.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

## API Usage

An extensive Postman collection is included to help you test and interact with the API.

### Import Postman Collection

Import the `RestroQ_Postman_Collection.json` file into your Postman client. The collection is pre-configured with environment variables like `baseUrl`.

### Authentication and Workflow

The API uses a multi-tenant approach that distinguishes between system-level actions and tenant-level (restaurant-specific) actions.

1.  **System Admin Login**:
    - Use the **`Authentication & Profile > Login (Super User)`** request.
    - The credentials are `admin@quicktable.com` and `password123` (or as set in your `.env`).
    - This will return a JWT token, which is automatically saved to the `token` collection variable.

2.  **Create a Restaurant**:
    - Use the **`Restaurant Management (Admins) > Create Restaurant`** request.
    - This requires the `SUPER_USER` token in the `Authorization` header.
    - The request creates a new restaurant and an `OWNER` user account for it. The `restaurantId` is saved automatically.

3.  **Restaurant User Login**:
    - Use the **`Authentication & Profile > Login (Restaurant Owner)`** request with the owner's credentials.
    - This returns a token for the restaurant user.

4.  **Tenant-Specific Actions**:
    - For all requests related to a specific restaurant (e.g., managing menus, tables, staff), use the restaurant user's token.
    - The middleware automatically infers the `restaurantId` from the JWT payload, ensuring data isolation. You do not need to send `x-tenant-id` when logged in as a restaurant user.

## Project Structure

The project follows a modular architecture to ensure separation of concerns and scalability.

```
.
├── prisma/               # Prisma schema, migrations, and seed script
├── src/
│   ├── app.ts            # Express app configuration and middlewares
│   ├── server.ts         # Server and Socket.IO initialization
│   ├── config/           # Database, environment variables
│   ├── middlewares/      # Custom middlewares e.g., auth, error handling
│   ├── modules/          # Core feature modules
│   │   ├── auth/         # Authentication logic
│   │   ├── restaurant/   # Restaurant management (System level)
│   │   ├── user/         # User management (System and Tenant level)
│   │   ├── category/     # Menu categories
│   │   ├── menu/         # Menu items
│   │   └── table/        # Table and QR code management
│   ├── routes/           # API route definitions
│   └── utils/            # Shared helper functions
├── .env.example          # Example environment variables
└── package.json          # Project dependencies and scripts
