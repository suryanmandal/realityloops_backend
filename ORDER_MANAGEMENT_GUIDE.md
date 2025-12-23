# Order Management System Documentation

## 📋 Overview

The Order Management System is a production-grade order handling system designed for restaurant operations. It provides complete order lifecycle tracking from creation to payment, with role-based access control for Kitchen and Waiter staff.

## 🎯 Key Features

- ✅ **Complete Order Lifecycle**: IDLE → PREPARING → PREPARED → DELIVERED
- ✅ **Role-Based Workflow**: Kitchen and Waiter staff have specific responsibilities
- ✅ **Real-time Status Tracking**: Timestamp tracking for each order stage
- ✅ **Payment Management**: Track paid/unpaid orders
- ✅ **Staff Assignment**: Track which staff handled each order
- ✅ **Product Snapshots**: Historical record of product details at order time
- ✅ **Comprehensive Filtering**: Filter by status, date, table, payment status
- ✅ **Validation & Error Handling**: Production-grade validation at every step
- ✅ **Auto-generated Order Numbers**: Unique order numbers (ORD-YYYYMMDD-XXXX)

## 🔄 Order Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. CREATE ORDER (Any Staff/Restaurant)
   ├─ Customer places order
   ├─ Products selected with quantities
   ├─ Total amount calculated
   └─ Status: IDLE

2. ACCEPT ORDER (Waiter Staff Only)
   ├─ Waiter accepts the order
   ├─ Assigned to waiter
   ├─ Sent to kitchen
   └─ Status: IDLE → PREPARING

3. PREPARE ORDER (Kitchen Staff Only)
   ├─ Kitchen prepares the food
   ├─ Assigned to kitchen staff
   ├─ Marks as ready
   └─ Status: PREPARING → PREPARED

4. DELIVER ORDER (Waiter Staff Only)
   ├─ Waiter delivers to table
   ├─ Customer receives order
   └─ Status: PREPARED → DELIVERED

5. MARK AS PAID (Waiter Staff Only)
   ├─ Payment received
   ├─ Order complete
   └─ isPaid: false → true
```

## 🏗️ Database Schema

### Order Model

```typescript
{
  // Auto-generated unique identifier
  orderNumber: "ORD-20231221-0001",  // Format: ORD-YYYYMMDD-XXXX

  // Restaurant reference
  restaurantId: ObjectId,

  // Table identification
  tableNumber: "T5",  // e.g., "T1", "T12", "Counter"

  // Order items (snapshot at order time)
  items: [
    {
      productId: ObjectId,           // Reference to Product
      productName: "Margherita Pizza", // Snapshot
      quantity: 2,
      unitPrice: 450,                // Price at order time
      subtotal: 900                  // quantity × unitPrice
    }
  ],

  // Pricing
  totalAmount: 1050,                 // Sum of all subtotals
  paymentAmount: 1050,               // Amount to be paid

  // Order status
  status: "IDLE" | "PREPARING" | "PREPARED" | "DELIVERED",
  isPaid: false,

  // Staff assignments
  waiterStaffId: ObjectId,           // Waiter who handled
  kitchenStaffId: ObjectId,          // Kitchen who prepared

  // Timeline tracking
  orderAcceptedAt: Date,             // When waiter accepted
  preparingStartedAt: Date,          // When kitchen started
  preparedAt: Date,                  // When kitchen finished
  deliveredAt: Date,                 // When delivered to table
  paidAt: Date,                      // When payment received

  // Notes
  customerNotes: "Extra cheese",     // Customer requests
  kitchenNotes: "Rush order",        // Internal notes

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Order Status Enum

```typescript
enum OrderStatus {
  IDLE = "IDLE",           // Created, waiting for waiter
  PREPARING = "PREPARING", // Accepted by waiter, in kitchen
  PREPARED = "PREPARED",   // Kitchen finished, ready for delivery
  DELIVERED = "DELIVERED"  // Delivered to customer table
}
```

## 🔐 Authorization Matrix

| Action | Waiter Staff | Kitchen Staff | Restaurant Owner |
|--------|--------------|---------------|------------------|
| Create Order | ✅ | ✅ | ✅ |
| View Orders | ✅ | ✅ | ✅ |
| Accept Order (IDLE → PREPARING) | ✅ | ❌ | ✅ |
| Mark Prepared (PREPARING → PREPARED) | ❌ | ✅ | ✅ |
| Mark Delivered (PREPARED → DELIVERED) | ✅ | ❌ | ✅ |
| Mark as Paid | ✅ | ❌ | ✅ |

## 📡 API Endpoints

### Base URL
```
Development: http://localhost:5000/api/v1/staff/orders
Production: https://your-domain.com/api/v1/staff/orders
```

### 1. Create Order

**Endpoint**: `POST /api/v1/staff/orders`
**Auth**: Staff (any role) or Restaurant
**Description**: Create a new order

**Request Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "tableNumber": "T5",
  "items": [
    {
      "productId": "64abc123...",
      "productName": "Margherita Pizza",
      "quantity": 2,
      "unitPrice": 450,
      "subtotal": 900
    },
    {
      "productId": "64abc456...",
      "productName": "Garlic Bread",
      "quantity": 1,
      "unitPrice": 150,
      "subtotal": 150
    }
  ],
  "totalAmount": 1050,
  "paymentAmount": 1050,
  "customerNotes": "Extra cheese, no onions"
}
```

**Validation Rules**:
- `tableNumber`: Required, 1-20 characters
- `items`: Required, minimum 1 item, maximum 50 items
- `totalAmount`: Must equal sum of all item subtotals
- Each item `subtotal`: Must equal `quantity × unitPrice`
- `customerNotes`: Optional, max 500 characters

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "64abc789...",
      "orderNumber": "ORD-20231221-0001",
      "restaurantId": "64abc...",
      "tableNumber": "T5",
      "items": [...],
      "totalAmount": 1050,
      "paymentAmount": 1050,
      "status": "IDLE",
      "isPaid": false,
      "customerNotes": "Extra cheese, no onions",
      "createdAt": "2023-12-21T10:30:00.000Z",
      "updatedAt": "2023-12-21T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
```json
// Product not found
{
  "success": false,
  "message": "One or more products not found or do not belong to your restaurant"
}

// Product unavailable
{
  "success": false,
  "message": "Products not available: Pizza, Pasta"
}

// Invalid total amount
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.totalAmount",
      "message": "Total amount must equal sum of item subtotals"
    }
  ]
}
```

---

### 2. Get All Orders

**Endpoint**: `GET /api/v1/staff/orders`
**Auth**: Staff (any role) or Restaurant
**Description**: Get all orders with optional filters

**Query Parameters**:
```
?status=PREPARING
&isPaid=false
&tableNumber=T5
&startDate=2023-12-21
&endDate=2023-12-22
&page=1
&limit=20
```

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| status | enum | IDLE, PREPARING, PREPARED, DELIVERED | - |
| isPaid | boolean | Filter by payment status | - |
| tableNumber | string | Filter by table | - |
| startDate | date/datetime | Orders from this date | - |
| endDate | date/datetime | Orders until this date | - |
| page | number | Page number | 1 |
| limit | number | Items per page (max 100) | 20 |

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderNumber": "ORD-20231221-0001",
        "tableNumber": "T5",
        "status": "PREPARING",
        "totalAmount": 1050,
        "isPaid": false,
        "waiterStaffId": {
          "name": "John Doe",
          "email": "john@restaurant.com"
        },
        "items": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Order by ID

**Endpoint**: `GET /api/v1/staff/orders/:id`
**Auth**: Staff (any role) or Restaurant
**Description**: Get detailed information about a single order

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "_id": "64abc789...",
      "orderNumber": "ORD-20231221-0001",
      "restaurantId": "...",
      "tableNumber": "T5",
      "items": [
        {
          "productId": {
            "title": "Margherita Pizza",
            "image": "uploads/products/pizza.jpg",
            "price": 450
          },
          "productName": "Margherita Pizza",
          "quantity": 2,
          "unitPrice": 450,
          "subtotal": 900
        }
      ],
      "totalAmount": 1050,
      "paymentAmount": 1050,
      "status": "PREPARING",
      "isPaid": false,
      "waiterStaffId": {
        "name": "John Doe",
        "email": "john@restaurant.com",
        "phone": "1234567890"
      },
      "kitchenStaffId": null,
      "orderAcceptedAt": "2023-12-21T10:32:00.000Z",
      "preparingStartedAt": "2023-12-21T10:32:00.000Z",
      "customerNotes": "Extra cheese",
      "kitchenNotes": "Rush order",
      "createdAt": "2023-12-21T10:30:00.000Z",
      "updatedAt": "2023-12-21T10:32:00.000Z"
    }
  }
}
```

---

### 4. Get My Assigned Orders

**Endpoint**: `GET /api/v1/staff/orders/my/assigned`
**Auth**: Staff only
**Description**: Get orders assigned to the current staff member

**Query Parameters**:
- `status`: Filter by order status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Behavior**:
- **Kitchen Staff**: Returns orders where `kitchenStaffId` matches current staff
- **Waiter Staff**: Returns orders where `waiterStaffId` matches current staff

---

### 5. Accept Order (Waiter Only)

**Endpoint**: `PATCH /api/v1/staff/orders/:id/accept`
**Auth**: Waiter Staff only
**Description**: Accept an order and send to kitchen

**Request Body**:
```json
{
  "kitchenNotes": "Rush order, VIP table"  // optional
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order accepted and sent to kitchen",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "status": "PREPARING",
      "waiterStaffId": "64abc...",
      "orderAcceptedAt": "2023-12-21T10:32:00.000Z",
      "preparingStartedAt": "2023-12-21T10:32:00.000Z",
      "kitchenNotes": "Rush order, VIP table"
    }
  }
}
```

**Business Rules**:
- Only Waiter/Desk staff can accept orders
- Order must be in `IDLE` status
- Status changes: `IDLE` → `PREPARING`
- Sets `waiterStaffId`, `orderAcceptedAt`, `preparingStartedAt`

**Error Responses**:
```json
// Not a waiter
{
  "success": false,
  "message": "Only waiter staff can accept orders"
}

// Order not in IDLE status
{
  "success": false,
  "message": "Order cannot be accepted. Current status: PREPARING"
}
```

---

### 6. Update Order Status

**Endpoint**: `PATCH /api/v1/staff/orders/:id/status`
**Auth**: Kitchen or Waiter Staff
**Description**: Update order status based on staff role

**Request Body**:
```json
{
  "status": "PREPARED",  // or "DELIVERED"
  "kitchenNotes": "Made extra spicy as requested"  // optional
}
```

**Status Transition Rules**:

| From | To | Allowed Staff | Action |
|------|-----|---------------|--------|
| PREPARING | PREPARED | Kitchen | Kitchen finishes preparation |
| PREPARED | DELIVERED | Waiter | Waiter delivers to table |

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order status updated to PREPARED",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "status": "PREPARED",
      "kitchenStaffId": "64abc...",
      "preparedAt": "2023-12-21T10:45:00.000Z"
    }
  }
}
```

**Kitchen Staff Behavior**:
- Can only update from `PREPARING` to `PREPARED`
- Sets `kitchenStaffId` and `preparedAt`

**Waiter Staff Behavior**:
- Can only update from `PREPARED` to `DELIVERED`
- Sets `deliveredAt`

**Error Responses**:
```json
// Invalid status transition for kitchen
{
  "success": false,
  "message": "Order must be in PREPARING status. Current status: IDLE"
}

// Kitchen trying to mark as delivered
{
  "success": false,
  "message": "Kitchen staff can only mark order as PREPARED"
}
```

---

### 7. Mark Order as Paid

**Endpoint**: `PATCH /api/v1/staff/orders/:id/payment`
**Auth**: Waiter Staff only
**Description**: Mark an order as paid after payment received

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Order marked as paid successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20231221-0001",
      "isPaid": true,
      "paidAt": "2023-12-21T11:00:00.000Z",
      "status": "DELIVERED",
      "paymentAmount": 1050
    }
  }
}
```

**Business Rules**:
- Only Waiter/Desk staff can mark as paid
- Order must be in `DELIVERED` status
- Cannot mark already paid orders
- Sets `isPaid` to `true` and `paidAt` timestamp

**Error Responses**:
```json
// Not delivered yet
{
  "success": false,
  "message": "Order must be delivered before marking as paid"
}

// Already paid
{
  "success": false,
  "message": "Order is already marked as paid"
}
```

---

## 🎯 Usage Examples

### Complete Order Flow Example

#### 1. Create Order (Any Staff)
```bash
curl -X POST http://localhost:5000/api/v1/staff/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "T5",
    "items": [
      {
        "productId": "64abc123...",
        "productName": "Pizza",
        "quantity": 2,
        "unitPrice": 450,
        "subtotal": 900
      }
    ],
    "totalAmount": 900,
    "paymentAmount": 900
  }'
```

#### 2. Waiter Accepts Order
```bash
curl -X PATCH http://localhost:5000/api/v1/staff/orders/64abc789.../accept \
  -H "Authorization: Bearer <waiter_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "kitchenNotes": "Rush order"
  }'
```

#### 3. Kitchen Marks as Prepared
```bash
curl -X PATCH http://localhost:5000/api/v1/staff/orders/64abc789.../status \
  -H "Authorization: Bearer <kitchen_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PREPARED"
  }'
```

#### 4. Waiter Delivers Order
```bash
curl -X PATCH http://localhost:5000/api/v1/staff/orders/64abc789.../status \
  -H "Authorization: Bearer <waiter_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED"
  }'
```

#### 5. Waiter Marks as Paid
```bash
curl -X PATCH http://localhost:5000/api/v1/staff/orders/64abc789.../payment \
  -H "Authorization: Bearer <waiter_token>"
```

---

## 📊 Order Number Format

Order numbers are auto-generated in the format: `ORD-YYYYMMDD-XXXX`

**Examples**:
- `ORD-20231221-0001` - First order of December 21, 2023
- `ORD-20231221-0042` - 42nd order of the same day
- `ORD-20231222-0001` - First order of next day

**Features**:
- Unique per day
- Sequential numbering resets daily
- 4-digit sequence supports up to 9999 orders per day
- Pre-save hook automatically generates number

---

## ⚙️ Technical Implementation

### Architecture Layers

1. **Model Layer** (`models/order.ts`)
   - Mongoose schema with validations
   - Pre-save hooks for order number generation
   - Subtotal and total amount validation
   - Compound indexes for performance

2. **Service Layer** (`services/order.service.ts`)
   - Business logic implementation
   - Status transition validation
   - Staff role verification
   - Product availability checks

3. **Controller Layer** (`controllers/order.controller.ts`)
   - HTTP request/response handling
   - Authentication extraction
   - Error handling

4. **Routes Layer** (`routes/staff/orderRouter.ts`)
   - Endpoint definitions
   - Middleware chains
   - Role-based access control

5. **Validation Layer** (`validation/order.validation.ts`)
   - Zod schemas for input validation
   - Custom validation rules
   - Error message formatting

### Database Indexes

For optimal query performance:

```javascript
// Compound indexes
{ restaurantId: 1, status: 1 }        // Filter by restaurant + status
{ restaurantId: 1, createdAt: -1 }    // Recent orders
{ restaurantId: 1, orderNumber: 1 }   // Search by order number
{ restaurantId: 1, isPaid: 1 }        // Paid/unpaid orders
{ waiterStaffId: 1, status: 1 }       // Waiter's assigned orders
{ kitchenStaffId: 1, status: 1 }      // Kitchen's assigned orders
{ restaurantId: 1, tableNumber: 1, createdAt: -1 }  // Orders by table
```

---

## 🔒 Security Features

- ✅ JWT authentication required for all endpoints
- ✅ Role-based authorization (Kitchen vs Waiter)
- ✅ Restaurant isolation (staff can only see own restaurant's orders)
- ✅ Status transition validation
- ✅ Input sanitization and validation
- ✅ SQL injection protection (MongoDB)
- ✅ XSS protection
- ✅ Rate limiting ready

---

## 📝 Best Practices

### For Restaurant Owners
1. Train staff on order flow
2. Monitor order timestamps for performance
3. Review unpaid orders regularly
4. Use filters to track order status

### For Waiter Staff
1. Accept orders promptly (IDLE → PREPARING)
2. Add kitchen notes for special requests
3. Deliver orders when marked PREPARED
4. Mark as paid immediately after payment

### For Kitchen Staff
1. Check new orders regularly (PREPARING status)
2. Update to PREPARED when food is ready
3. Use kitchen notes for special instructions
4. Communicate delays to waiters

### For Developers
1. Use proper error handling
2. Log all order state changes
3. Monitor order completion times
4. Track staff performance metrics

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Order cannot be accepted"
- **Cause**: Order not in IDLE status
- **Solution**: Check current order status, may already be accepted

**Issue**: "Only waiter staff can accept orders"
- **Cause**: Kitchen staff trying to accept order
- **Solution**: Use waiter staff credentials

**Issue**: "Order must be delivered before marking as paid"
- **Cause**: Trying to mark as paid before delivery
- **Solution**: Complete delivery step first

**Issue**: "Total amount must equal sum of item subtotals"
- **Cause**: Math error in order creation
- **Solution**: Verify calculations, ensure subtotal = quantity × unitPrice

---

## 📈 Future Enhancements

Potential improvements:
- [ ] Real-time order notifications (WebSocket)
- [ ] Order analytics and reporting
- [ ] Estimated preparation time tracking
- [ ] Order modification after creation
- [ ] Order cancellation workflow
- [ ] Split payment support
- [ ] Tip management
- [ ] Order history export
- [ ] Customer feedback integration
- [ ] Kitchen display system (KDS) integration

---

## 📞 Support

For issues or questions:
- Review error messages in API responses
- Check application logs in `logs/` directory
- Verify staff role and permissions
- Ensure order status allows the operation
- Confirm products belong to restaurant

---

**Version**: 1.0.0
**Last Updated**: December 23, 2025
**Status**: Production Ready ✅
