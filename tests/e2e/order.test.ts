import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { Restaurant, Staff, Product, Category, Order } from '../../models';
import { JWTService } from '../../services/jwt.service';
import { UserRole, StaffRole, AccountStatus, OrderStatus, ProductStatus, CategoryStatus } from '../../types/enums';
import mongoose from 'mongoose';

/**
 * E2E Test Suite for Order Management System
 *
 * Tests cover:
 * 1. Order Creation
 * 2. Order Retrieval (List & Single)
 * 3. Order Acceptance (Waiter)
 * 4. Order Status Updates (Kitchen & Waiter)
 * 5. Payment Processing
 * 6. Authorization & Permissions
 * 7. Edge Cases & Error Handling
 */

describe('Order Management System - E2E Tests', () => {
  let restaurantId: string;
  let restaurantToken: string;
  let waiterStaffId: string;
  let waiterToken: string;
  let kitchenStaffId: string;
  let kitchenToken: string;
  let categoryId: string;
  let product1Id: string;
  let product2Id: string;
  let product3Id: string;

  /**
   * Setup: Create restaurant, staff, categories, and products before each test
   */
  beforeEach(async () => {
    // Create restaurant
    const restaurant = await Restaurant.create({
      restaurantName: 'Test Restaurant',
      ownerName: 'Test Owner',
      email: `restaurant${Date.now()}@test.com`,
      phone: '1234567890',
      password: 'Test@123456',
      role: UserRole.RESTAURANT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });
    restaurantId = (restaurant._id as mongoose.Types.ObjectId).toString();
    restaurantToken = JWTService.generateAccessToken({
      id: restaurantId,
      email: restaurant.email,
      role: UserRole.RESTAURANT,
    });

    // Create waiter staff
    const waiterStaff = await Staff.create({
      name: 'Waiter Staff',
      email: `waiter${Date.now()}@test.com`,
      phone: '5555555555',
      password: 'Waiter@123456',
      staffRole: StaffRole.WAITER_DESK,
      restaurantId,
      addedBy: restaurantId,
      role: UserRole.STAFF,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });
    waiterStaffId = (waiterStaff._id as mongoose.Types.ObjectId).toString();
    waiterToken = JWTService.generateAccessToken({
      id: waiterStaffId,
      email: waiterStaff.email,
      role: UserRole.STAFF,
      staffRole: StaffRole.WAITER_DESK,
      restaurantId,
    });

    // Create kitchen staff
    const kitchenStaff = await Staff.create({
      name: 'Kitchen Staff',
      email: `kitchen${Date.now()}@test.com`,
      phone: '6666666666',
      password: 'Kitchen@123456',
      staffRole: StaffRole.KITCHEN,
      restaurantId,
      addedBy: restaurantId,
      role: UserRole.STAFF,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });
    kitchenStaffId = (kitchenStaff._id as mongoose.Types.ObjectId).toString();
    kitchenToken = JWTService.generateAccessToken({
      id: kitchenStaffId,
      email: kitchenStaff.email,
      role: UserRole.STAFF,
      staffRole: StaffRole.KITCHEN,
      restaurantId,
    });

    // Create category
    const category = await Category.create({
      name: 'Main Course',
      description: 'Main course items',
      restaurantId,
      status: CategoryStatus.ACTIVE,
    });
    categoryId = (category._id as mongoose.Types.ObjectId).toString();

    // Create products
    const product1 = await Product.create({
      title: 'Margherita Pizza',
      description: 'Classic pizza with tomato and mozzarella',
      mrp: 500,
      price: 450,
      categoryId,
      restaurantId,
      status: ProductStatus.ACTIVE,
      isAvailable: true,
      preparationTime: 20,
      stock: 100,
    });
    product1Id = (product1._id as mongoose.Types.ObjectId).toString();

    const product2 = await Product.create({
      title: 'Garlic Bread',
      description: 'Crispy garlic bread',
      mrp: 200,
      price: 150,
      categoryId,
      restaurantId,
      status: ProductStatus.ACTIVE,
      isAvailable: true,
      preparationTime: 10,
      stock: 50,
    });
    product2Id = (product2._id as mongoose.Types.ObjectId).toString();

    const product3 = await Product.create({
      title: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon',
      mrp: 400,
      price: 350,
      categoryId,
      restaurantId,
      status: ProductStatus.ACTIVE,
      isAvailable: true,
      preparationTime: 15,
      stock: 30,
    });
    product3Id = (product3._id as mongoose.Types.ObjectId).toString();
  });

  /**
   * Test Suite 1: Order Creation
   */
  describe('POST /api/v1/staff/orders - Create Order', () => {
    it('should create order successfully with valid data', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 450,
            subtotal: 900,
          },
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 1,
            unitPrice: 150,
            subtotal: 150,
          },
        ],
        totalAmount: 1050,
        paymentAmount: 1050,
        customerNotes: 'Extra cheese, no onions',
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
      expect(response.body.data.order.status).toBe(OrderStatus.IDLE);
      expect(response.body.data.order.isPaid).toBe(false);
      expect(response.body.data.order.tableNumber).toBe('T5');
      expect(response.body.data.order.totalAmount).toBe(1050);
      expect(response.body.data.order.customerNotes).toBe('Extra cheese, no onions');
      expect(response.body.data.order.items).toHaveLength(2);
    });

    it('should create order with restaurant owner token', async () => {
      const orderData = {
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.restaurantId).toBe(restaurantId);
    });

    it('should create order with kitchen staff token', async () => {
      const orderData = {
        tableNumber: 'T2',
        items: [
          {
            productId: product3Id,
            productName: 'Pasta Carbonara',
            quantity: 1,
            unitPrice: 350,
            subtotal: 350,
          },
        ],
        totalAmount: 350,
        paymentAmount: 350,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
      };

      await request(app)
        .post('/api/v1/staff/orders')
        .send(orderData)
        .expect(401);
    });

    it('should fail with invalid product ID', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: '507f1f77bcf86cd799439011', // Non-existent ID
            productName: 'Fake Product',
            quantity: 1,
            unitPrice: 100,
            subtotal: 100,
          },
        ],
        totalAmount: 100,
        paymentAmount: 100,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail with unavailable product', async () => {
      // Make product unavailable
      await Product.findByIdAndUpdate(product1Id, { isAvailable: false });

      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not available');
    });

    it('should fail with incorrect total amount', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 450,
            subtotal: 900,
          },
        ],
        totalAmount: 800, // Wrong total
        paymentAmount: 800,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with incorrect subtotal', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 450,
            subtotal: 800, // Wrong subtotal (should be 900)
          },
        ],
        totalAmount: 800,
        paymentAmount: 800,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const orderData = {
        tableNumber: 'T5',
        // Missing items
        totalAmount: 450,
        paymentAmount: 450,
      };

      await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);
    });

    it('should fail with empty items array', async () => {
      const orderData = {
        tableNumber: 'T5',
        items: [], // Empty array
        totalAmount: 0,
        paymentAmount: 0,
      };

      await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(400);
    });

    it('should create order with multiple items', async () => {
      const orderData = {
        tableNumber: 'T10',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 450,
            subtotal: 900,
          },
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 3,
            unitPrice: 150,
            subtotal: 450,
          },
          {
            productId: product3Id,
            productName: 'Pasta Carbonara',
            quantity: 1,
            unitPrice: 350,
            subtotal: 350,
          },
        ],
        totalAmount: 1700,
        paymentAmount: 1700,
        customerNotes: 'Rush order for VIP table',
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.items).toHaveLength(3);
      expect(response.body.data.order.totalAmount).toBe(1700);
    });
  });

  /**
   * Test Suite 2: Get All Orders
   */
  describe('GET /api/v1/staff/orders - Get All Orders', () => {
    let order1Id: string;
    let order2Id: string;
    let order3Id: string;

    beforeEach(async () => {
      // Create sample orders
      const order1 = await Order.create({
        restaurantId,
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.IDLE,
        isPaid: false,
      });
      order1Id = (order1._id as mongoose.Types.ObjectId).toString();

      const order2 = await Order.create({
        restaurantId,
        tableNumber: 'T2',
        items: [
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 2,
            unitPrice: 150,
            subtotal: 300,
          },
        ],
        totalAmount: 300,
        paymentAmount: 300,
        status: OrderStatus.PREPARING,
        isPaid: false,
        waiterStaffId,
      });
      order2Id = (order2._id as mongoose.Types.ObjectId).toString();

      const order3 = await Order.create({
        restaurantId,
        tableNumber: 'T3',
        items: [
          {
            productId: product3Id,
            productName: 'Pasta Carbonara',
            quantity: 1,
            unitPrice: 350,
            subtotal: 350,
          },
        ],
        totalAmount: 350,
        paymentAmount: 350,
        status: OrderStatus.DELIVERED,
        isPaid: true,
        waiterStaffId,
        kitchenStaffId,
        paidAt: new Date(),
      });
      order3Id = (order3._id as mongoose.Types.ObjectId).toString();
    });

    it('should get all orders for restaurant', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders?status=IDLE')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].status).toBe(OrderStatus.IDLE);
    });

    it('should filter orders by payment status', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders?isPaid=true')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].isPaid).toBe(true);
    });

    it('should filter orders by table number', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders?tableNumber=T2')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].tableNumber).toBe('T2');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/v1/staff/orders')
        .expect(401);
    });
  });

  /**
   * Test Suite 3: Get Order by ID
   */
  describe('GET /api/v1/staff/orders/:id - Get Order by ID', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        restaurantId,
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 450,
            subtotal: 900,
          },
        ],
        totalAmount: 900,
        paymentAmount: 900,
        status: OrderStatus.IDLE,
        isPaid: false,
        customerNotes: 'Extra cheese',
      });
      orderId = (order._id as mongoose.Types.ObjectId).toString();
    });

    it('should get order by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/staff/orders/${orderId}`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id).toBe(orderId);
      expect(response.body.data.order.tableNumber).toBe('T5');
      expect(response.body.data.order.customerNotes).toBe('Extra cheese');
    });

    it('should fail with non-existent order ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/v1/staff/orders/${fakeId}`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/api/v1/staff/orders/${orderId}`)
        .expect(401);
    });
  });

  /**
   * Test Suite 4: Accept Order (Waiter Only)
   */
  describe('PATCH /api/v1/staff/orders/:id/accept - Accept Order', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        restaurantId,
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.IDLE,
        isPaid: false,
      });
      orderId = (order._id as mongoose.Types.ObjectId).toString();
    });

    it('should accept order successfully as waiter', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ kitchenNotes: 'Rush order' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order accepted and sent to kitchen');
      expect(response.body.data.order.status).toBe(OrderStatus.PREPARING);
      expect(response.body.data.order.waiterStaffId).toBeDefined();
      expect(response.body.data.order.orderAcceptedAt).toBeDefined();
      expect(response.body.data.order.preparingStartedAt).toBeDefined();
      expect(response.body.data.order.kitchenNotes).toBe('Rush order');
    });

    it('should accept order without kitchen notes', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe(OrderStatus.PREPARING);
    });

    it('should fail when kitchen staff tries to accept', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({})
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('waiter');
    });

    it('should fail when order is already accepted', async () => {
      // First acceptance
      await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({})
        .expect(200);

      // Second attempt
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be accepted');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .send({})
        .expect(401);
    });
  });

  /**
   * Test Suite 5: Update Order Status
   */
  describe('PATCH /api/v1/staff/orders/:id/status - Update Order Status', () => {
    let preparingOrderId: string;
    let preparedOrderId: string;

    beforeEach(async () => {
      // Create order in PREPARING status
      const preparingOrder = await Order.create({
        restaurantId,
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.PREPARING,
        isPaid: false,
        waiterStaffId,
        orderAcceptedAt: new Date(),
        preparingStartedAt: new Date(),
      });
      preparingOrderId = (preparingOrder._id as mongoose.Types.ObjectId).toString();

      // Create order in PREPARED status
      const preparedOrder = await Order.create({
        restaurantId,
        tableNumber: 'T6',
        items: [
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 1,
            unitPrice: 150,
            subtotal: 150,
          },
        ],
        totalAmount: 150,
        paymentAmount: 150,
        status: OrderStatus.PREPARED,
        isPaid: false,
        waiterStaffId,
        kitchenStaffId,
        orderAcceptedAt: new Date(),
        preparingStartedAt: new Date(),
        preparedAt: new Date(),
      });
      preparedOrderId = (preparedOrder._id as mongoose.Types.ObjectId).toString();
    });

    it('should mark order as PREPARED by kitchen staff', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/status`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({ status: OrderStatus.PREPARED })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe(OrderStatus.PREPARED);
      expect(response.body.data.order.kitchenStaffId).toBeDefined();
      expect(response.body.data.order.preparedAt).toBeDefined();
    });

    it('should mark order as PREPARED with kitchen notes', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/status`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({
          status: OrderStatus.PREPARED,
          kitchenNotes: 'Made extra spicy'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.kitchenNotes).toBe('Made extra spicy');
    });

    it('should mark order as DELIVERED by waiter staff', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparedOrderId}/status`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe(OrderStatus.DELIVERED);
      expect(response.body.data.order.deliveredAt).toBeDefined();
    });

    it('should fail when kitchen tries to mark as DELIVERED', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparedOrderId}/status`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(400);

      expect(response.body.success).toBe(false);
      // Kitchen staff can only mark PREPARING orders as PREPARED
      expect(response.body.message).toContain('PREPARING status');
    });

    it('should fail when waiter tries to mark as PREPARED', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/status`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ status: OrderStatus.PREPARED })
        .expect(400);

      expect(response.body.success).toBe(false);
      // Waiter staff can only mark PREPARED orders as DELIVERED
      expect(response.body.message).toContain('PREPARED status');
    });

    it('should fail with invalid status transition', async () => {
      // Try to mark PREPARING order as DELIVERED (should be PREPARED first)
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/status`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/status`)
        .send({ status: OrderStatus.PREPARED })
        .expect(401);
    });
  });

  /**
   * Test Suite 6: Mark Order as Paid
   */
  describe('PATCH /api/v1/staff/orders/:id/payment - Mark as Paid', () => {
    let deliveredOrderId: string;
    let preparingOrderId: string;

    beforeEach(async () => {
      // Create delivered order (ready for payment)
      const deliveredOrder = await Order.create({
        restaurantId,
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.DELIVERED,
        isPaid: false,
        waiterStaffId,
        kitchenStaffId,
        orderAcceptedAt: new Date(),
        preparingStartedAt: new Date(),
        preparedAt: new Date(),
        deliveredAt: new Date(),
      });
      deliveredOrderId = (deliveredOrder._id as mongoose.Types.ObjectId).toString();

      // Create preparing order (not ready for payment)
      const preparingOrder = await Order.create({
        restaurantId,
        tableNumber: 'T6',
        items: [
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 1,
            unitPrice: 150,
            subtotal: 150,
          },
        ],
        totalAmount: 150,
        paymentAmount: 150,
        status: OrderStatus.PREPARING,
        isPaid: false,
        waiterStaffId,
      });
      preparingOrderId = (preparingOrder._id as mongoose.Types.ObjectId).toString();
    });

    it('should mark delivered order as paid by waiter', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${deliveredOrderId}/payment`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order marked as paid successfully');
      expect(response.body.data.order.isPaid).toBe(true);
      expect(response.body.data.order.paidAt).toBeDefined();
    });

    it('should fail when kitchen staff tries to mark as paid', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${deliveredOrderId}/payment`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('waiter');
    });

    it('should fail when order is not delivered', async () => {
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${preparingOrderId}/payment`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be delivered');
    });

    it('should fail when order is already paid', async () => {
      // First payment
      await request(app)
        .patch(`/api/v1/staff/orders/${deliveredOrderId}/payment`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      // Second attempt
      const response = await request(app)
        .patch(`/api/v1/staff/orders/${deliveredOrderId}/payment`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already marked as paid');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/api/v1/staff/orders/${deliveredOrderId}/payment`)
        .expect(401);
    });
  });

  /**
   * Test Suite 7: Get My Assigned Orders
   */
  describe('GET /api/v1/staff/orders/my/assigned - Get My Orders', () => {
    let waiterOrder1Id: string;
    let waiterOrder2Id: string;
    let kitchenOrderId: string;

    beforeEach(async () => {
      // Create orders assigned to waiter
      const waiterOrder1 = await Order.create({
        restaurantId,
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.PREPARING,
        isPaid: false,
        waiterStaffId,
      });
      waiterOrder1Id = (waiterOrder1._id as mongoose.Types.ObjectId).toString();

      const waiterOrder2 = await Order.create({
        restaurantId,
        tableNumber: 'T2',
        items: [
          {
            productId: product2Id,
            productName: 'Garlic Bread',
            quantity: 1,
            unitPrice: 150,
            subtotal: 150,
          },
        ],
        totalAmount: 150,
        paymentAmount: 150,
        status: OrderStatus.DELIVERED,
        isPaid: true,
        waiterStaffId,
        paidAt: new Date(),
      });
      waiterOrder2Id = (waiterOrder2._id as mongoose.Types.ObjectId).toString();

      // Create order assigned to kitchen
      const kitchenOrder = await Order.create({
        restaurantId,
        tableNumber: 'T3',
        items: [
          {
            productId: product3Id,
            productName: 'Pasta Carbonara',
            quantity: 1,
            unitPrice: 350,
            subtotal: 350,
          },
        ],
        totalAmount: 350,
        paymentAmount: 350,
        status: OrderStatus.PREPARED,
        isPaid: false,
        waiterStaffId,
        kitchenStaffId,
      });
      kitchenOrderId = (kitchenOrder._id as mongoose.Types.ObjectId).toString();
    });

    it('should get waiter assigned orders', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders/my/assigned')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(3);
    });

    it('should get kitchen assigned orders', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders/my/assigned')
        .set('Authorization', `Bearer ${kitchenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
    });

    it('should filter my orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/staff/orders/my/assigned?status=PREPARING')
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].status).toBe(OrderStatus.PREPARING);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/v1/staff/orders/my/assigned')
        .expect(401);
    });
  });

  /**
   * Test Suite 8: Complete Order Workflow
   */
  describe('Complete Order Workflow - E2E', () => {
    it('should complete full order lifecycle from creation to payment', async () => {
      // Step 1: Create order
      const createResponse = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({
          tableNumber: 'T10',
          items: [
            {
              productId: product1Id,
              productName: 'Margherita Pizza',
              quantity: 2,
              unitPrice: 450,
              subtotal: 900,
            },
            {
              productId: product2Id,
              productName: 'Garlic Bread',
              quantity: 1,
              unitPrice: 150,
              subtotal: 150,
            },
          ],
          totalAmount: 1050,
          paymentAmount: 1050,
          customerNotes: 'VIP customer',
        })
        .expect(201);

      const orderId = createResponse.body.data.order._id;
      expect(createResponse.body.data.order.status).toBe(OrderStatus.IDLE);

      // Step 2: Waiter accepts order
      const acceptResponse = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ kitchenNotes: 'Rush order for VIP' })
        .expect(200);

      expect(acceptResponse.body.data.order.status).toBe(OrderStatus.PREPARING);
      expect(acceptResponse.body.data.order.orderAcceptedAt).toBeDefined();

      // Step 3: Kitchen marks as prepared
      const preparedResponse = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({ status: OrderStatus.PREPARED })
        .expect(200);

      expect(preparedResponse.body.data.order.status).toBe(OrderStatus.PREPARED);
      expect(preparedResponse.body.data.order.preparedAt).toBeDefined();

      // Step 4: Waiter delivers order
      const deliveredResponse = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);

      expect(deliveredResponse.body.data.order.status).toBe(OrderStatus.DELIVERED);
      expect(deliveredResponse.body.data.order.deliveredAt).toBeDefined();

      // Step 5: Waiter marks as paid
      const paidResponse = await request(app)
        .patch(`/api/v1/staff/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${waiterToken}`)
        .expect(200);

      expect(paidResponse.body.data.order.isPaid).toBe(true);
      expect(paidResponse.body.data.order.paidAt).toBeDefined();

      // Step 6: Verify final order state
      const finalResponse = await request(app)
        .get(`/api/v1/staff/orders/${orderId}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      const finalOrder = finalResponse.body.data.order;
      expect(finalOrder.status).toBe(OrderStatus.DELIVERED);
      expect(finalOrder.isPaid).toBe(true);
      expect(finalOrder.orderAcceptedAt).toBeDefined();
      expect(finalOrder.preparingStartedAt).toBeDefined();
      expect(finalOrder.preparedAt).toBeDefined();
      expect(finalOrder.deliveredAt).toBeDefined();
      expect(finalOrder.paidAt).toBeDefined();
      expect(finalOrder.waiterStaffId).toBeDefined();
      expect(finalOrder.kitchenStaffId).toBeDefined();
    });
  });

  /**
   * Test Suite 9: Edge Cases and Error Scenarios
   */
  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent order creation', async () => {
      const orderData = {
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
      };

      // Create multiple orders concurrently
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/v1/staff/orders')
          .set('Authorization', `Bearer ${waiterToken}`)
          .send(orderData)
      );

      const responses = await Promise.all(promises);

      // At least one should succeed
      const successfulResponses = responses.filter(r => r.status === 201);
      expect(successfulResponses.length).toBeGreaterThan(0);

      // All successful orders should have unique order numbers
      const orderNumbers = successfulResponses.map(r => r.body.data.order.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(successfulResponses.length);
    });

    it('should handle very large order amounts', async () => {
      const orderData = {
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 100,
            unitPrice: 450,
            subtotal: 45000,
          },
        ],
        totalAmount: 45000,
        paymentAmount: 45000,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.totalAmount).toBe(45000);
    });

    it('should handle customer notes with special characters', async () => {
      const orderData = {
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        customerNotes: 'Extra cheese!!! @#$%^&*() <script>alert("test")</script>',
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.customerNotes).toBeDefined();
    });

    it('should handle decimal amounts correctly', async () => {
      const orderData = {
        tableNumber: 'T1',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 3,
            unitPrice: 333.33,
            subtotal: 999.99,
          },
        ],
        totalAmount: 999.99,
        paymentAmount: 999.99,
      };

      const response = await request(app)
        .post('/api/v1/staff/orders')
        .set('Authorization', `Bearer ${waiterToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.totalAmount).toBeCloseTo(999.99, 2);
    });
  });

  /**
   * Test Suite 10: Authorization and Security
   */
  describe('Authorization and Security Tests', () => {
    let anotherRestaurantId: string;
    let anotherRestaurantToken: string;
    let orderId: string;

    beforeEach(async () => {
      // Create another restaurant
      const anotherRestaurant = await Restaurant.create({
        restaurantName: 'Another Restaurant',
        ownerName: 'Another Owner',
        email: `another${Date.now()}@test.com`,
        phone: '9999999999',
        password: 'Test@123456',
        role: UserRole.RESTAURANT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });
      anotherRestaurantId = (anotherRestaurant._id as mongoose.Types.ObjectId).toString();
      anotherRestaurantToken = JWTService.generateAccessToken({
        id: anotherRestaurantId,
        email: anotherRestaurant.email,
        role: UserRole.RESTAURANT,
      });

      // Create order for first restaurant
      const order = await Order.create({
        restaurantId,
        tableNumber: 'T5',
        items: [
          {
            productId: product1Id,
            productName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
        totalAmount: 450,
        paymentAmount: 450,
        status: OrderStatus.IDLE,
        isPaid: false,
      });
      orderId = (order._id as mongoose.Types.ObjectId).toString();
    });

    it('should not allow staff from different restaurant to access orders', async () => {
      // Create staff for another restaurant
      const anotherStaff = await Staff.create({
        name: 'Another Staff',
        email: `staff${Date.now()}@another.com`,
        phone: '7777777777',
        password: 'Staff@123456',
        staffRole: StaffRole.WAITER_DESK,
        restaurantId: anotherRestaurantId,
        addedBy: anotherRestaurantId,
        role: UserRole.STAFF,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      const anotherStaffToken = JWTService.generateAccessToken({
        id: (anotherStaff._id as mongoose.Types.ObjectId).toString(),
        email: anotherStaff.email,
        role: UserRole.STAFF,
        staffRole: StaffRole.WAITER_DESK,
        restaurantId: anotherRestaurantId,
      });

      // Try to access order from different restaurant
      const response = await request(app)
        .get(`/api/v1/staff/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherStaffToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow restaurant owner to access another restaurant orders', async () => {
      const response = await request(app)
        .get(`/api/v1/staff/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherRestaurantToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
