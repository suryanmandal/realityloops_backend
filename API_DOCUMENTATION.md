# API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Table of Contents

1. [User Authentication](#user-authentication)
2. [Restaurant/Seller Authentication](#restaurantseller-authentication)
3. [Restaurant Categories](#restaurant-categories)
4. [Restaurant Products](#restaurant-products)
5. [Admin Authentication](#admin-authentication)
6. [Admin Upload](#admin-upload)
7. [Staff Authentication](#staff-authentication)
8. [Staff Orders](#staff-orders)

---

## User Authentication

### Base Path: `/v1/user/auth`

#### 1. User Signup

- **Method:** `POST`
- **Endpoint:** `/signup`
- **Authentication:** None
- **Description:** Register a new user account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

**Error Responses:**

- `400`: Missing required fields, passwords don't match, or password too short
- `500`: Server error

---

#### 2. User Login

- **Method:** `POST`
- **Endpoint:** `/login`
- **Authentication:** None
- **Description:** Login with email and password

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "jwt_token_here"
}
```

**Error Responses:**

- `401`: Invalid email or password
- `500`: Server error

---

#### 3. Verify OTP (Placeholder)

- **Method:** `POST`
- **Endpoint:** `/verify-otp`
- **Authentication:** None
- **Status:** Not implemented

---

#### 4. Forgot Password (Placeholder)

- **Method:** `POST`
- **Endpoint:** `/forgot-password`
- **Authentication:** None
- **Status:** Not implemented

---

#### 5. Forgot Password Verify OTP (Placeholder)

- **Method:** `POST`
- **Endpoint:** `/forgot-password/verify-otp`
- **Authentication:** None
- **Status:** Not implemented

---

#### 6. Reset Password (Placeholder)

- **Method:** `POST`
- **Endpoint:** `/reset-password`
- **Authentication:** None
- **Status:** Not implemented

---

#### 7. Google Authentication (Placeholder)

- **Method:** `POST`
- **Endpoint:** `/google-auth`
- **Authentication:** None
- **Status:** Not implemented

---

## Restaurant/Seller Authentication

### Base Path: `/v1/restaurant/auth`

#### 1. Restaurant Signup

- **Method:** `POST`
- **Endpoint:** `/signup`
- **Authentication:** None
- **Description:** Register a new restaurant account

**Request Body:**

```json
{
  "restaurantName": "Restaurant Name",
  "ownerName": "Owner Name",
  "email": "restaurant@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "address": "123 Main St, City, State 12345"
}
```

**Validation Rules:**

- `restaurantName`: 2-100 characters
- `ownerName`: 2-50 characters
- `email`: Valid email format
- `phone`: 10 digits
- `password`: 8-50 characters, must contain uppercase, lowercase, digit, and special character
- `confirmPassword`: Must match password

**Response (201):**

```json
{
  "message": "Restaurant registered successfully",
  "token": "jwt_token_here",
  "restaurant": {
    "_id": "restaurant_id",
    "restaurantName": "Restaurant Name",
    "ownerName": "Owner Name",
    "email": "restaurant@example.com"
  }
}
```

**Error Responses:**

- `400`: Validation failed or restaurant already exists
- `500`: Server error

---

#### 2. Verify Email

- **Method:** `POST`
- **Endpoint:** `/verify-email`
- **Authentication:** None
- **Description:** Verify restaurant email with OTP

**Request Body:**

```json
{
  "email": "restaurant@example.com",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

---

#### 3. Restaurant Login

- **Method:** `POST`
- **Endpoint:** `/login`
- **Authentication:** None
- **Description:** Login with email and password

**Request Body:**

```json
{
  "email": "restaurant@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "jwt_token_here",
  "restaurant": {
    "_id": "restaurant_id",
    "restaurantName": "Restaurant Name"
  }
}
```

---

#### 4. Resend OTP

- **Method:** `POST`
- **Endpoint:** `/resend-otp`
- **Authentication:** None
- **Description:** Resend OTP to email

**Request Body:**

```json
{
  "email": "restaurant@example.com"
}
```

**Response (200):**

```json
{
  "message": "OTP sent to email"
}
```

---

#### 5. Forgot Password

- **Method:** `POST`
- **Endpoint:** `/forgot-password`
- **Authentication:** None
- **Description:** Request password reset

**Request Body:**

```json
{
  "email": "restaurant@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset link sent to email"
}
```

---

#### 6. Reset Password

- **Method:** `POST`
- **Endpoint:** `/reset-password`
- **Authentication:** None
- **Description:** Reset password with OTP

**Request Body:**

```json
{
  "email": "restaurant@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

---

#### 7. Add Staff

- **Method:** `POST`
- **Endpoint:** `/add-staff`
- **Authentication:** Required (Restaurant owner only)
- **Description:** Add staff member to restaurant

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "phone": "1234567890",
  "role": "KITCHEN_STAFF",
  "password": "StaffPass123!"
}
```

**Response (201):**

```json
{
  "message": "Staff added successfully",
  "staff": {
    "_id": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com",
    "role": "KITCHEN_STAFF"
  }
}
```

---

## Restaurant Categories

### Base Path: `/v1/restaurant/category`

**Authentication Required:** Yes (Restaurant owner only)

#### 1. Create Category

- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Create a new product category with image

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
name: "Appetizers"
description: "Delicious appetizers"
image: <file>
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "category_id",
    "name": "Appetizers",
    "description": "Delicious appetizers",
    "image": "image_url"
  }
}
```

---

#### 2. Get All Categories

- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Get all categories for the restaurant

**Response (200):**

```json
{
  "message": "Categories retrieved successfully",
  "categories": [
    {
      "_id": "category_id",
      "name": "Appetizers",
      "description": "Delicious appetizers",
      "image": "image_url"
    }
  ]
}
```

---

#### 3. Get Category by ID

- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** Get specific category details

**Response (200):**

```json
{
  "message": "Category retrieved successfully",
  "category": {
    "_id": "category_id",
    "name": "Appetizers",
    "description": "Delicious appetizers",
    "image": "image_url"
  }
}
```

---

#### 4. Update Category

- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Description:** Update category information with optional new image

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
name: "Updated Appetizers"
description: "Updated description"
image: <file> (optional)
```

**Response (200):**

```json
{
  "message": "Category updated successfully",
  "category": {
    "_id": "category_id",
    "name": "Updated Appetizers",
    "description": "Updated description"
  }
}
```

---

#### 5. Delete Category

- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Description:** Delete a category

**Response (200):**

```json
{
  "message": "Category deleted successfully"
}
```

---

## Restaurant Products

### Base Path: `/v1/restaurant/product`

**Authentication Required:** Yes (Restaurant owner only)

#### 1. Create Product

- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Create a new product with image and AR model

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
name: "Margherita Pizza"
description: "Classic Margherita Pizza"
categoryId: "category_id"
price: 12.99
arModel: <file> (optional)
image: <file> (optional)
isAvailable: true
```

**Response (201):**

```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "product_id",
    "name": "Margherita Pizza",
    "description": "Classic Margherita Pizza",
    "price": 12.99,
    "isAvailable": true,
    "image": "image_url",
    "arModel": "model_url"
  }
}
```

---

#### 2. Get All Products

- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Get all products for the restaurant

**Response (200):**

```json
{
  "message": "Products retrieved successfully",
  "products": [
    {
      "_id": "product_id",
      "name": "Margherita Pizza",
      "price": 12.99,
      "isAvailable": true
    }
  ]
}
```

---

#### 3. Get Product by ID

- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** Get specific product details

**Response (200):**

```json
{
  "message": "Product retrieved successfully",
  "product": {
    "_id": "product_id",
    "name": "Margherita Pizza",
    "description": "Classic Margherita Pizza",
    "price": 12.99,
    "isAvailable": true,
    "image": "image_url",
    "arModel": "model_url"
  }
}
```

---

#### 4. Update Product

- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Description:** Update product information with optional new image/AR model

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
name: "Updated Product Name"
description: "Updated description"
price: 14.99
isAvailable: true
image: <file> (optional)
arModel: <file> (optional)
```

**Response (200):**

```json
{
  "message": "Product updated successfully",
  "product": {
    "_id": "product_id",
    "name": "Updated Product Name",
    "price": 14.99
  }
}
```

---

#### 5. Bulk Update Availability

- **Method:** `PATCH`
- **Endpoint:** `/bulk-availability`
- **Description:** Update availability status for multiple products

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "productIds": ["product_id_1", "product_id_2"],
  "isAvailable": true
}
```

**Response (200):**

```json
{
  "message": "Products availability updated successfully",
  "updatedCount": 2
}
```

---

#### 6. Delete Product

- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Description:** Delete a product

**Response (200):**

```json
{
  "message": "Product deleted successfully"
}
```

---

## Admin Authentication

### Base Path: `/v1/admin/auth`

#### 1. Admin Signup

- **Method:** `POST`
- **Endpoint:** `/signup`
- **Authentication:** None
- **Description:** Register a new admin account

**Request Body:**

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "phone": "1234567890",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!"
}
```

**Validation Rules:**

- `name`: 2-50 characters
- `email`: Valid email format
- `phone`: 10 digits (optional)
- `password`: 8-50 characters, must contain uppercase, lowercase, digit, and special character

**Response (201):**

```json
{
  "message": "Admin registered successfully",
  "token": "jwt_token_here",
  "admin": {
    "_id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
```

---

#### 2. Verify Email

- **Method:** `POST`
- **Endpoint:** `/verify-email`
- **Authentication:** None
- **Description:** Verify admin email with OTP

**Request Body:**

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

**Response (200):**

```json
{
  "message": "Email verified successfully"
}
```

---

#### 3. Admin Login

- **Method:** `POST`
- **Endpoint:** `/login`
- **Authentication:** None
- **Description:** Login with email and password

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "jwt_token_here"
}
```

---

#### 4. Resend OTP

- **Method:** `POST`
- **Endpoint:** `/resend-otp`
- **Authentication:** None
- **Description:** Resend OTP to admin email

**Request Body:**

```json
{
  "email": "admin@example.com"
}
```

**Response (200):**

```json
{
  "message": "OTP sent to email"
}
```

---

#### 5. Forgot Password

- **Method:** `POST`
- **Endpoint:** `/forgot-password`
- **Authentication:** None
- **Description:** Request password reset

**Request Body:**

```json
{
  "email": "admin@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset link sent to email"
}
```

---

#### 6. Reset Password

- **Method:** `POST`
- **Endpoint:** `/reset-password`
- **Authentication:** None
- **Description:** Reset password with OTP

**Request Body:**

```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "NewAdminPass123!",
  "confirmPassword": "NewAdminPass123!"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

---

## Admin Upload

### Base Path: `/v1/admin/upload`

**Authentication Required:** Yes (Admin only)

#### 1. Upload 3D Model

- **Method:** `POST`
- **Endpoint:** `/3d-model`
- **Description:** Upload a 3D model file

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
file: <3d model file>
```

**Response (200):**

```json
{
  "message": "3D model uploaded successfully",
  "model": {
    "filename": "model_filename",
    "path": "/uploads/3d-models/model_filename",
    "size": 1024000,
    "mimetype": "model/gltf-binary"
  }
}
```

---

#### 2. Delete 3D Model

- **Method:** `DELETE`
- **Endpoint:** `/3d-model/:filename`
- **Description:** Delete a 3D model file

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "3D model deleted successfully"
}
```

---

## Staff Authentication

### Base Path: `/v1/staff/auth`

#### 1. Staff Login

- **Method:** `POST`
- **Endpoint:** `/login`
- **Authentication:** None
- **Description:** Login staff member with email and password

**Request Body:**

```json
{
  "email": "staff@example.com",
  "password": "StaffPass123!"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "jwt_token_here",
  "staff": {
    "_id": "staff_id",
    "name": "Staff Name",
    "role": "KITCHEN_STAFF"
  }
}
```

**Error Responses:**

- `401`: Invalid email or password
- `500`: Server error

---

#### 2. Change Password

- **Method:** `POST`
- **Endpoint:** `/change-password`
- **Authentication:** Required (Staff only)
- **Description:** Change staff member password

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "OldStaffPass123!",
  "newPassword": "NewStaffPass123!",
  "confirmPassword": "NewStaffPass123!"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

---

## Staff Orders

### Base Path: `/v1/staff/orders`

**Authentication Required:** Yes (Staff or Restaurant owner)

#### 1. Create Order

- **Method:** `POST`
- **Endpoint:** `/`
- **Description:** Create a new order

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "notes": "No onions"
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "totalAmount": 25.98,
  "notes": "Deliver after 5 PM"
}
```

**Response (201):**

```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "order_id",
    "customerName": "John Doe",
    "status": "IDLE",
    "totalAmount": 25.98,
    "createdAt": "2024-12-23T10:30:00Z"
  }
}
```

---

#### 2. Get All Orders

- **Method:** `GET`
- **Endpoint:** `/`
- **Description:** Get all orders with optional filters

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

```
?status=PREPARING
?limit=10
?skip=0
?sortBy=createdAt
?sortOrder=desc
```

**Response (200):**

```json
{
  "message": "Orders retrieved successfully",
  "orders": [
    {
      "_id": "order_id",
      "customerName": "John Doe",
      "status": "PREPARING",
      "totalAmount": 25.98,
      "createdAt": "2024-12-23T10:30:00Z"
    }
  ],
  "total": 50,
  "limit": 10,
  "skip": 0
}
```

---

#### 3. Get My Orders (Assigned to Staff)

- **Method:** `GET`
- **Endpoint:** `/my/assigned`
- **Description:** Get orders assigned to current staff member

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "Your orders retrieved successfully",
  "orders": [
    {
      "_id": "order_id",
      "customerName": "John Doe",
      "status": "PREPARING",
      "assignedTo": "staff_id"
    }
  ]
}
```

---

#### 4. Get Order by ID

- **Method:** `GET`
- **Endpoint:** `/:id`
- **Description:** Get specific order details

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "Order retrieved successfully",
  "order": {
    "_id": "order_id",
    "customerName": "John Doe",
    "items": [
      {
        "productId": "product_id",
        "productName": "Margherita Pizza",
        "quantity": 2,
        "price": 12.99
      }
    ],
    "status": "PREPARING",
    "totalAmount": 25.98,
    "createdAt": "2024-12-23T10:30:00Z"
  }
}
```

---

#### 5. Accept Order (Waiter Only)

- **Method:** `PATCH`
- **Endpoint:** `/:id/accept`
- **Description:** Accept order and move from IDLE to PREPARING status (Waiter staff only)

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "Order accepted successfully",
  "order": {
    "_id": "order_id",
    "status": "PREPARING",
    "acceptedAt": "2024-12-23T10:35:00Z"
  }
}
```

---

#### 6. Update Order Status

- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Description:** Update order status
  - **Kitchen Staff:** Can move from PREPARING → PREPARED
  - **Waiter:** Can move from PREPARED → DELIVERED

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "status": "PREPARED",
  "notes": "Ready for delivery"
}
```

**Response (200):**

```json
{
  "message": "Order status updated successfully",
  "order": {
    "_id": "order_id",
    "status": "PREPARED",
    "updatedAt": "2024-12-23T10:45:00Z"
  }
}
```

---

## Response Status Codes

| Code | Meaning                                                 |
| ---- | ------------------------------------------------------- |
| 200  | OK - Request successful                                 |
| 201  | Created - Resource created successfully                 |
| 400  | Bad Request - Invalid input or validation error         |
| 401  | Unauthorized - Authentication required or invalid token |
| 403  | Forbidden - User doesn't have permission                |
| 404  | Not Found - Resource not found                          |
| 500  | Server Error - Internal server error                    |

---

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from login endpoints and are valid for 30 days.

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "error_code"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads use multipart/form-data
- Password must contain: uppercase, lowercase, digit, and special character
- Phone numbers must be 10 digits
- Email validation is performed on all endpoints
- OTP validation required for certain operations
