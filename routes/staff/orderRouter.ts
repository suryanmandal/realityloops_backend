import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import { authenticate, isWaiterStaff, isRestaurantOrStaff } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import {
  createOrderSchema,
  acceptOrderSchema,
  updateOrderStatusSchema,
  markAsPaidSchema,
  getOrdersQuerySchema,
  getOrderByIdSchema,
} from "../../validation/order.validation";

const orderRouter = Router();

/**
 * All order routes require authentication
 * Routes are accessible to both restaurant owner and staff members
 */

/**
 * @route   POST /api/v1/staff/orders
 * @desc    Create new order
 * @access  Private (Staff or Restaurant)
 */
orderRouter.post(
  "/",
  authenticate,
  isRestaurantOrStaff,
  validate(createOrderSchema),
  OrderController.createOrder
);

/**
 * @route   GET /api/v1/staff/orders
 * @desc    Get all orders with filters
 * @access  Private (Staff or Restaurant)
 */
orderRouter.get(
  "/",
  authenticate,
  isRestaurantOrStaff,
  validate(getOrdersQuerySchema),
  OrderController.getOrders
);

/**
 * @route   GET /api/v1/staff/orders/my/assigned
 * @desc    Get orders assigned to current staff member
 * @access  Private (Staff only)
 */
orderRouter.get(
  "/my/assigned",
  authenticate,
  isRestaurantOrStaff,
  OrderController.getMyOrders
);

/**
 * @route   GET /api/v1/staff/orders/:id
 * @desc    Get single order by ID
 * @access  Private (Staff or Restaurant)
 */
orderRouter.get(
  "/:id",
  authenticate,
  isRestaurantOrStaff,
  validate(getOrderByIdSchema),
  OrderController.getOrderById
);

/**
 * @route   PATCH /api/v1/staff/orders/:id/accept
 * @desc    Accept order (Waiter only - moves from IDLE to PREPARING)
 * @access  Private (Waiter Staff only)
 */
orderRouter.patch(
  "/:id/accept",
  authenticate,
  isWaiterStaff,
  validate(acceptOrderSchema),
  OrderController.acceptOrder
);

/**
 * @route   PATCH /api/v1/staff/orders/:id/status
 * @desc    Update order status
 *          - Kitchen: PREPARING → PREPARED
 *          - Waiter: PREPARED → DELIVERED
 * @access  Private (Staff - Kitchen or Waiter based on status)
 */
orderRouter.patch(
  "/:id/status",
  authenticate,
  isRestaurantOrStaff,
  validate(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

/**
 * @route   PATCH /api/v1/staff/orders/:id/payment
 * @desc    Mark order as paid (Waiter only)
 * @access  Private (Waiter Staff only)
 */
orderRouter.patch(
  "/:id/payment",
  authenticate,
  isWaiterStaff,
  validate(markAsPaidSchema),
  OrderController.markAsPaid
);

export default orderRouter;
