# Reality Loops Backend API

Production-grade backend API for Reality Loops restaurant management platform with role-based authentication and authorization.

## 🎯 Features

### Authentication System

- **Restaurant/Seller Authentication**: Complete signup, login, email verification with OTP
- **Admin Authentication**: Platform administrator auth with email verification
- **Staff Authentication**: Restaurant staff login system (Kitchen & Waiter/Desk staff)
- **OTP Verification**: Email-based OTP for signup and password reset
- **JWT-based Authentication**: Secure token-based auth with refresh tokens
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for different user types

### User Roles

1. **Restaurant (Seller)**: Main account that can manage restaurant and add staff
2. **Admin**: Platform administrator with full system access
3. **Staff**: Restaurant employees (max 2 per restaurant)
   - Kitchen Staff
   - Waiter/Desk Staff
4. **Customer**: No authentication needed for browsing (future feature)

### Production Features

- ✅ Object-Oriented Programming (OOP) architecture
- ✅ Service layer pattern for business logic
- ✅ Comprehensive input validation with Zod
- ✅ Production-grade logging system
- ✅ Error handling middleware
- ✅ Email templates for all notifications
- ✅ Secure password hashing with bcrypt
- ✅ MongoDB with Mongoose ODM
- ✅ TypeScript for type safety
- ✅ HTTP request logging with Morgan

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/skyricksarkar/arProdBackend.git
cd arProdBackend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Configure Email (Important)**
   For Gmail, you need to:

- Enable 2-factor authentication
- Generate an App Password
- Use the App Password in `EMAIL_PASS`

5. **Start development server**

```bash
npm run dev
```

6. **Build for production**

```bash
npm run build
npm start
```

## 📚 API Documentation

### Quick Reference - All API Endpoints

| #                     | Method | Endpoint                                  | Auth          | Description                  |
| --------------------- | ------ | ----------------------------------------- | ------------- | ---------------------------- |
| **Restaurant Routes** |
| 1                     | POST   | `/api/v1/restaurant/auth/signup`          | Public        | Register restaurant          |
| 2                     | POST   | `/api/v1/restaurant/auth/verify-email`    | Public        | Verify email with OTP        |
| 3                     | POST   | `/api/v1/restaurant/auth/login`           | Public        | Restaurant login             |
| 4                     | POST   | `/api/v1/restaurant/auth/resend-otp`      | Public        | Resend verification OTP      |
| 5                     | POST   | `/api/v1/restaurant/auth/forgot-password` | Public        | Request password reset       |
| 6                     | POST   | `/api/v1/restaurant/auth/reset-password`  | Public        | Reset password with OTP      |
| 7                     | POST   | `/api/v1/restaurant/staff/add`            | 🔒 Restaurant | Add staff member             |
| **Admin Routes**      |
| 8                     | POST   | `/api/v1/admin/auth/signup`               | Public        | Register admin               |
| 9                     | POST   | `/api/v1/admin/auth/verify-email`         | Public        | Verify admin email           |
| 10                    | POST   | `/api/v1/admin/auth/login`                | Public        | Admin login                  |
| 11                    | POST   | `/api/v1/admin/auth/resend-otp`           | Public        | Resend admin OTP             |
| 12                    | POST   | `/api/v1/admin/auth/forgot-password`      | Public        | Admin password reset request |
| 13                    | POST   | `/api/v1/admin/auth/reset-password`       | Public        | Reset admin password         |
| 14                    | POST   | `/api/v1/admin/upload/3d-model`           | 🔒 Admin      | Upload 3D model file         |
| 15                    | DELETE | `/api/v1/admin/upload/3d-model/:filename` | 🔒 Admin      | Delete 3D model file         |
| **Staff Routes**      |
| 16                    | POST   | `/api/v1/staff/auth/login`                | Public        | Staff login                  |
| 17                    | POST   | `/api/v1/staff/auth/change-password`      | 🔒 Staff      | Change staff password        |
| **Order Management**  |
| 18                    | POST   | `/api/v1/staff/orders`                    | 🔒 Staff      | Create new order             |
| 19                    | GET    | `/api/v1/staff/orders`                    | 🔒 Staff      | Get all orders (with filters)|
| 20                    | GET    | `/api/v1/staff/orders/:id`                | 🔒 Staff      | Get order by ID              |
| 21                    | GET    | `/api/v1/staff/orders/my/assigned`        | 🔒 Staff      | Get my assigned orders       |
| 22                    | PATCH  | `/api/v1/staff/orders/:id/accept`         | 🔒 Waiter     | Accept order (IDLE→PREPARING)|
| 23                    | PATCH  | `/api/v1/staff/orders/:id/status`         | 🔒 Staff      | Update order status          |
| 24                    | PATCH  | `/api/v1/staff/orders/:id/payment`        | 🔒 Waiter     | Mark order as paid           |

**Total: 24 API Endpoints**

---

### Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### 🏪 Restaurant/Seller Routes

All restaurant routes are prefixed with `/api/v1/restaurant`

#### Authentication Routes (`/api/v1/restaurant/auth`)

##### 1. Register Restaurant

```http
POST /api/v1/restaurant/auth/signup
Content-Type: application/json

Request Body:
{
  "restaurantName": "My Restaurant",
  "ownerName": "John Doe",
  "email": "restaurant@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "address": "123 Main St, City" // optional
}

Response (201):
{
  "success": true,
  "message": "Restaurant registered successfully. Please verify your email.",
  "data": {
    "restaurant": {
      "id": "...",
      "restaurantName": "My Restaurant",
      "email": "restaurant@example.com",
      "isEmailVerified": false
    }
  }
}
```

##### 2. Verify Email (OTP)

```http
POST /api/v1/restaurant/auth/verify-email
Content-Type: application/json

Request Body:
{
  "email": "restaurant@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "restaurant": { /* restaurant details */ }
  }
}
```

##### 3. Login

```http
POST /api/v1/restaurant/auth/login
Content-Type: application/json

Request Body:
{
  "email": "restaurant@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "restaurant": { /* restaurant details */ },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

##### 4. Resend OTP

```http
POST /api/v1/restaurant/auth/resend-otp
Content-Type: application/json

Request Body:
{
  "email": "restaurant@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

##### 5. Forgot Password

```http
POST /api/v1/restaurant/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "restaurant@example.com"
}

Response (200):
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

##### 6. Reset Password

```http
POST /api/v1/restaurant/auth/reset-password
Content-Type: application/json

Request Body:
{
  "email": "restaurant@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Staff Management Routes (🔒 Protected - Restaurant Only)

##### 7. Add Staff Member

```http
POST /api/v1/restaurant/staff/add
Authorization: Bearer <restaurant_access_token>
Content-Type: application/json

Request Body:
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "staffRole": "kitchen_staff", // or "waiter_desk_staff"
  "phone": "1234567890" // optional
}

Response (201):
{
  "success": true,
  "message": "Staff added successfully. Login credentials sent via email.",
  "data": {
    "staff": {
      "id": "...",
      "name": "Staff Name",
      "email": "staff@example.com",
      "staffRole": "kitchen_staff"
    }
  }
}

Note: Maximum 2 staff members per restaurant (1 kitchen, 1 waiter/desk)
```

---

### 👨‍💼 Admin Routes

All admin routes are prefixed with `/api/v1/admin`

#### Authentication Routes (`/api/v1/admin/auth`)

##### 1. Register Admin

```http
POST /api/v1/admin/auth/signup
Content-Type: application/json

Request Body:
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "phone": "1234567890", // optional
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

Response (201):
{
  "success": true,
  "message": "Admin registered successfully. Please verify your email.",
  "data": {
    "admin": {
      "id": "...",
      "name": "Admin Name",
      "email": "admin@example.com",
      "isEmailVerified": false
    }
  }
}
```

##### 2. Verify Email (OTP)

```http
POST /api/v1/admin/auth/verify-email
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

##### 3. Login

```http
POST /api/v1/admin/auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": { /* admin details */ },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

##### 4. Resend OTP

```http
POST /api/v1/admin/auth/resend-otp
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent successfully"
}
```

##### 5. Forgot Password

```http
POST /api/v1/admin/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com"
}

Response (200):
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

##### 6. Reset Password

```http
POST /api/v1/admin/auth/reset-password
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful"
}
```

#### File Upload Routes (🔒 Protected - Admin Only)

##### 7. Upload 3D Model

```http
POST /api/v1/admin/upload/3d-model
Authorization: Bearer <admin_access_token>
Content-Type: multipart/form-data

Request Body (form-data):
{
  "model": <file> // 3D model file (.glb, .gltf, or .usdz)
}

Response (201):
{
  "success": true,
  "message": "3D model uploaded successfully",
  "data": {
    "url": "http://localhost:5000/uploads/3d-models/3d-model-1234567890-123456789.glb",
    "filename": "3d-model-1234567890-123456789.glb"
  }
}

Notes:
- Maximum file size: 100MB
- Allowed formats: .glb, .gltf, .usdz
- Files are stored in public/uploads/3d-models/
- URL can be used directly in products (arModelPath field)
```

##### 8. Delete 3D Model

```http
DELETE /api/v1/admin/upload/3d-model/:filename
Authorization: Bearer <admin_access_token>

Response (200):
{
  "success": true,
  "message": "3D model deleted successfully"
}
```

---

### 👥 Staff Routes

All staff routes are prefixed with `/api/v1/staff`

#### Authentication Routes (`/api/v1/staff/auth`)

##### 1. Staff Login

```http
POST /api/v1/staff/auth/login
Content-Type: application/json

Request Body:
{
  "email": "staff@example.com",
  "password": "temp-password-from-email"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "staff": {
      "id": "...",
      "name": "Staff Name",
      "email": "staff@example.com",
      "staffRole": "kitchen_staff",
      "restaurantId": "..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

Note: Staff accounts are created by restaurants. First login requires password change.
```

##### 2. Change Password (🔒 Protected)

```http
POST /api/v1/staff/auth/change-password
Authorization: Bearer <staff_access_token>
Content-Type: application/json

Request Body:
{
  "currentPassword": "old-password",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Order Management Routes (`/api/v1/staff/orders`)

##### 3. Create Order (🔒 Protected - Staff or Restaurant)

```http
POST /api/v1/staff/orders
Authorization: Bearer <staff_or_restaurant_access_token>
Content-Type: application/json

Request Body:
{
  "tableNumber": "T5",
  "items": [
    {
      "productId": "product_id_1",
      "productName": "Margherita Pizza",
      "quantity": 2,
      "unitPrice": 450,
      "subtotal": 900
    },
    {
      "productId": "product_id_2",
      "productName": "Garlic Bread",
      "quantity": 1,
      "unitPrice": 150,
      "subtotal": 150
    }
  ],
  "totalAmount": 1050,
  "paymentAmount": 1050,
  "customerNotes": "Extra cheese, no onions" // optional
}

Response (201):
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "restaurantId": "...",
      "tableNumber": "T5",
      "items": [...],
      "totalAmount": 1050,
      "paymentAmount": 1050,
      "status": "IDLE",
      "isPaid": false,
      "customerNotes": "Extra cheese, no onions",
      "createdAt": "2023-12-21T10:30:00.000Z"
    }
  }
}
```

##### 4. Get All Orders (🔒 Protected - Staff or Restaurant)

```http
GET /api/v1/staff/orders?status=PREPARING&isPaid=false&page=1&limit=20
Authorization: Bearer <staff_or_restaurant_access_token>

Query Parameters:
- status: IDLE | PREPARING | PREPARED | DELIVERED (optional)
- isPaid: true | false (optional)
- tableNumber: string (optional)
- startDate: YYYY-MM-DD or ISO datetime (optional)
- endDate: YYYY-MM-DD or ISO datetime (optional)
- page: number (default: 1)
- limit: number (default: 20, max: 100)

Response (200):
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

##### 5. Get Order by ID (🔒 Protected - Staff or Restaurant)

```http
GET /api/v1/staff/orders/:id
Authorization: Bearer <staff_or_restaurant_access_token>

Response (200):
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "restaurantId": "...",
      "tableNumber": "T5",
      "items": [...],
      "totalAmount": 1050,
      "status": "PREPARING",
      "isPaid": false,
      "waiterStaffId": { "name": "John", "email": "..." },
      "kitchenStaffId": null,
      "orderAcceptedAt": "2023-12-21T10:32:00.000Z",
      "preparingStartedAt": "2023-12-21T10:32:00.000Z"
    }
  }
}
```

##### 6. Get My Assigned Orders (🔒 Protected - Staff only)

```http
GET /api/v1/staff/orders/my/assigned?status=PREPARING
Authorization: Bearer <staff_access_token>

Query Parameters:
- status: IDLE | PREPARING | PREPARED | DELIVERED (optional)
- page: number (default: 1)
- limit: number (default: 20)

Response (200):
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [...], // Orders assigned to this staff member
    "pagination": { ... }
  }
}
```

##### 7. Accept Order (🔒 Protected - Waiter Staff only)

```http
PATCH /api/v1/staff/orders/:id/accept
Authorization: Bearer <waiter_staff_access_token>
Content-Type: application/json

Request Body:
{
  "kitchenNotes": "Rush order" // optional
}

Response (200):
{
  "success": true,
  "message": "Order accepted and sent to kitchen",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "status": "PREPARING",
      "waiterStaffId": "...",
      "orderAcceptedAt": "2023-12-21T10:32:00.000Z",
      "preparingStartedAt": "2023-12-21T10:32:00.000Z"
    }
  }
}

Notes:
- Only waiter/desk staff can accept orders
- Order must be in IDLE status
- Status changes from IDLE → PREPARING
```

##### 8. Update Order Status (🔒 Protected - Kitchen or Waiter Staff)

```http
PATCH /api/v1/staff/orders/:id/status
Authorization: Bearer <staff_access_token>
Content-Type: application/json

Request Body:
{
  "status": "PREPARED",  // or "DELIVERED"
  "kitchenNotes": "Extra spicy" // optional
}

Response (200):
{
  "success": true,
  "message": "Order status updated to PREPARED",
  "data": {
    "order": { ... }
  }
}

Status Transition Rules:
- Kitchen Staff: PREPARING → PREPARED
- Waiter Staff: PREPARED → DELIVERED
- Invalid transitions are rejected
```

##### 9. Mark Order as Paid (🔒 Protected - Waiter Staff only)

```http
PATCH /api/v1/staff/orders/:id/payment
Authorization: Bearer <waiter_staff_access_token>

Response (200):
{
  "success": true,
  "message": "Order marked as paid successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "isPaid": true,
      "paidAt": "2023-12-21T11:00:00.000Z",
      "status": "DELIVERED"
    }
  }
}

Notes:
- Only waiter/desk staff can mark orders as paid
- Order must be in DELIVERED status
- Cannot mark already paid orders
```

---

## 📋 Complete API Routes Summary

### Public Routes (No Authentication Required)

| Method | Endpoint                                  | Description                           |
| ------ | ----------------------------------------- | ------------------------------------- |
| POST   | `/api/v1/restaurant/auth/signup`          | Register new restaurant               |
| POST   | `/api/v1/restaurant/auth/verify-email`    | Verify restaurant email with OTP      |
| POST   | `/api/v1/restaurant/auth/login`           | Restaurant login                      |
| POST   | `/api/v1/restaurant/auth/resend-otp`      | Resend OTP to restaurant              |
| POST   | `/api/v1/restaurant/auth/forgot-password` | Request password reset for restaurant |
| POST   | `/api/v1/restaurant/auth/reset-password`  | Reset restaurant password with OTP    |
| POST   | `/api/v1/admin/auth/signup`               | Register new admin                    |
| POST   | `/api/v1/admin/auth/verify-email`         | Verify admin email with OTP           |
| POST   | `/api/v1/admin/auth/login`                | Admin login                           |
| POST   | `/api/v1/admin/auth/resend-otp`           | Resend OTP to admin                   |
| POST   | `/api/v1/admin/auth/forgot-password`      | Request password reset for admin      |
| POST   | `/api/v1/admin/auth/reset-password`       | Reset admin password with OTP         |
| POST   | `/api/v1/staff/auth/login`                | Staff login                           |

### Protected Routes (Authentication Required)

| Method | Endpoint                             | Required Role | Description              |
| ------ | ------------------------------------ | ------------- | ------------------------ |
| POST   | `/api/v1/restaurant/staff/add`       | Restaurant    | Add staff member (max 2) |
| POST   | `/api/v1/staff/auth/change-password` | Staff         | Change staff password    |

---

## 🔐 Authentication

All protected routes require a JWT access token in the Authorization header:

```http
Authorization: Bearer <your_access_token>
```

### Token Information

- **Access Token**: Valid for 7 days (configurable)
- **Refresh Token**: Valid for 30 days (configurable)
- Tokens are returned in login responses

---

## ⚠️ Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (only in development)"
}
```

### Common HTTP Status Codes

| Status Code | Description                                 |
| ----------- | ------------------------------------------- |
| 200         | Success                                     |
| 201         | Created (successful signup/creation)        |
| 400         | Bad Request (validation error)              |
| 401         | Unauthorized (invalid credentials or token) |
| 403         | Forbidden (insufficient permissions)        |
| 404         | Not Found                                   |
| 409         | Conflict (e.g., email already exists)       |
| 500         | Internal Server Error                       |

### Example Error Responses

**Validation Error (400)**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Authentication Error (401)**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Authorization Error (403)**

```json
{
  "success": false,
  "message": "Access denied. Restaurant role required."
}
```

**Duplicate Email (409)**

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## ✅ Validation Rules

### Email

- Must be valid email format
- Case-insensitive
- Unique per user type

### Password

- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&\*)

### Phone

- Optional for most registrations
- Must be exactly 10 digits
- Numbers only

### Restaurant Name

- Required
- 2-100 characters

### Staff Role

- Must be either:
  - `kitchen_staff`
  - `waiter_desk_staff`

### OTP

- Exactly 6 digits
- Valid for 10 minutes
- Maximum 5 verification attempts

---

## 🏗️ Project Structure

```
arProdBackend/
├── config/              # Configuration files
│   ├── dbConfig.ts      # MongoDB connection
│   └── mailConfig.ts    # Email configuration
├── controllers/         # Route controllers (OOP)
│   ├── restaurant.controller.ts
│   ├── admin.controller.ts
│   └── staff.controller.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts       # Authentication & authorization
│   ├── validation.middleware.ts # Input validation
│   └── error.middleware.ts      # Error handling
├── models/             # Mongoose models
│   ├── seller.ts       # Restaurant model
│   ├── admin.ts        # Admin model
│   ├── staff.ts        # Staff model
│   └── otp.ts          # OTP model
├── routes/             # Express routes
│   ├── restaurant/     # Restaurant routes
│   ├── admin/          # Admin routes
│   └── staff/          # Staff routes
├── services/           # Business logic layer
│   ├── jwt.service.ts
│   ├── otp.service.ts
│   ├── restaurant.auth.service.ts
│   ├── admin.auth.service.ts
│   └── staff.auth.service.ts
├── types/              # TypeScript type definitions
│   ├── enums.ts        # Enums for roles, status, etc.
│   └── interfaces.ts   # TypeScript interfaces
├── utils/              # Utility functions
│   ├── logger.ts       # Logging utility
│   ├── otp.util.ts     # OTP generation
│   ├── emailTemplates.ts # Email HTML templates
│   └── email.service.ts  # Email sending service
├── validation/         # Zod validation schemas
│   └── auth.validation.ts
├── app.ts             # Express app setup
├── server.ts          # Server entry point
└── tsconfig.json      # TypeScript configuration
```

## 🔒 Security Features

1. **Password Security**

   - Bcrypt hashing with salt factor 10
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, and special character

2. **JWT Tokens**

   - Access token: 7 days (configurable)
   - Refresh token: 30 days (configurable)
   - Secure secret key (must be changed in production)

3. **OTP Security**

   - 6-digit random OTP
   - 10-minute expiration
   - Maximum 5 attempts
   - Auto-deletion after expiry

4. **Email Verification**

   - Required for restaurant and admin signup
   - Staff accounts pre-verified

5. **Input Validation**
   - Zod schemas for all inputs
   - Email format validation
   - Phone number validation (10 digits)

## 📝 Environment Variables

See `.env.example` for all configuration options.

Critical variables:

- `JWT_SECRET`: **Must be changed in production**
- `MONGODB_URL`: Your MongoDB connection string
- `EMAIL_USER` & `EMAIL_PASS`: SMTP credentials

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto re-run on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui

# Run specific test suite
npm test -- tests/e2e/order.test.ts
npm test -- tests/e2e/restaurant-auth.test.ts
```

### Test Coverage

Current test coverage:

- **118 tests** - 118 passing (100% pass rate) ✅✅✅
- JWT Service: 10 tests (100% passing)
- OTP Service: 19 tests (100% passing)
- OTP Utility: 16 tests (100% passing)
- **Order Management E2E**: 48 tests (100% passing) ✅
- **Restaurant Auth E2E**: 25 tests (100% passing) ✅

#### E2E Test Suites

**Order Management (48 tests - 100% passing):**
- Order Creation: 11 tests
- Order Retrieval: 8 tests
- Order Accept (Waiter): 5 tests
- Status Updates (Kitchen/Waiter): 7 tests
- Payment Processing: 5 tests
- Staff Orders: 4 tests
- Complete Workflow: 1 test
- Edge Cases: 4 tests
- Security & Authorization: 2 tests

**Restaurant Authentication (25 tests - 100% passing):**
- Signup: 6 tests (100% passing)
- Email Verification: 4 tests (100% passing)
- Login: 5 tests (100% passing)
- Resend OTP: 3 tests (100% passing)
- Forgot Password: 3 tests (100% passing)
- Reset Password: 4 tests (100% passing)

For detailed testing documentation, see:

- `tests/e2e/README.md` - E2E test suite documentation
- `TESTING_GUIDE.md` - Complete testing guide
- `TESTING_IMPLEMENTATION.md` - Implementation details

### Manual API Testing

#### Using cURL

**1. Restaurant Signup**

```bash
curl -X POST http://localhost:5000/api/restaurant/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "Test Restaurant",
    "ownerName": "John Doe",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "Test@123456",
    "confirmPassword": "Test@123456",
    "address": "123 Test St"
  }'
```

**2. Verify Email (check email for OTP)**

```bash
curl -X POST http://localhost:5000/api/restaurant/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

**3. Login**

```bash
curl -X POST http://localhost:5000/api/restaurant/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

**4. Add Staff (use token from login response)**

```bash
curl -X POST http://localhost:5000/api/restaurant/staff/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Kitchen Staff",
    "email": "kitchen@test.com",
    "staffRole": "kitchen_staff",
    "phone": "9876543210"
  }'
```

#### Using Postman

A complete Postman collection is available: `Reality-Loops-API.postman_collection.json`

Import steps:

1. Open Postman
2. Click Import
3. Select the JSON file
4. All 15 API endpoints will be imported with examples

---

## 🚀 Deployment

1. **Set environment variables**

```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URL=<production-mongodb-url>
```

2. **Build the application**

```bash
npm run build
```

3. **Start production server**

```bash
npm start
```

## 📊 Logging

Logs are stored in `/logs` directory:

- `combined.log`: All logs
- `error.log`: Error logs only

Log format in production includes timestamp, level, and metadata.

## 👥 User Flow

### Restaurant Owner

1. Sign up → Receive OTP via email
2. Verify email with OTP → Get access token
3. Login → Access dashboard
4. Add staff members (max 2)
5. Staff receive email with temporary password

### Staff Member

1. Receive email with login credentials
2. Login with temporary password
3. Change password on first login
4. Access restaurant-specific features

### Admin

1. Sign up → Verify email
2. Login → Access admin panel
3. Manage platform-wide settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License - Reality Loops

## 👨‍💻 Author

Reality Loops Team

---

**Note**: This is a production-ready authentication system. Make sure to:

- Change all default secrets in production
- Set up proper email SMTP credentials
- Configure MongoDB with proper security
- Use HTTPS in production
- Set up rate limiting for API endpoints
- Implement proper monitoring and alerting
