import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { logger } from "../utils/logger";
import { OrderStatus, StaffRole } from "../types/enums";

/**
 * Order Controller Class
 * Handles HTTP requests for order management
 */
export class OrderController {
  /**
   * @route   POST /api/v1/staff/orders
   * @desc    Create new order
   * @access  Private (Staff - any role, or Restaurant)
   */
  static async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      // Get restaurant ID from user (staff has restaurantId, restaurant uses own id)
      const restaurantId = req.user?.restaurantId || req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await OrderService.createOrder(restaurantId, req.body);

      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Order create controller error", {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/staff/orders
   * @desc    Get all orders with filters
   * @access  Private (Staff - any role, or Restaurant)
   */
  static async getOrders(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId || req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const filters = {
        status: req.query.status as OrderStatus | undefined,
        isPaid: req.query.isPaid === "true" ? true : req.query.isPaid === "false" ? false : undefined,
        tableNumber: req.query.tableNumber as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await OrderService.getOrders(restaurantId, filters);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get orders controller error", {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/staff/orders/:id
   * @desc    Get single order by ID
   * @access  Private (Staff - any role, or Restaurant)
   */
  static async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId || req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const result = await OrderService.getOrderById(restaurantId, id);

      const statusCode = result.success ? 200 : 404;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get order by ID controller error", {
        error: error.message,
        orderId: req.params.id,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PATCH /api/v1/staff/orders/:id/accept
   * @desc    Accept order (Waiter only - moves from IDLE to PREPARING)
   * @access  Private (Staff - Waiter only)
   */
  static async acceptOrder(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId;
      const staffId = req.user?.id;
      const staffRole = req.user?.staffRole;

      if (!restaurantId || !staffId || !staffRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { kitchenNotes } = req.body;

      const result = await OrderService.acceptOrder(
        restaurantId,
        id,
        staffId,
        staffRole,
        kitchenNotes
      );

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Accept order controller error", {
        error: error.message,
        orderId: req.params.id,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PATCH /api/v1/staff/orders/:id/status
   * @desc    Update order status
   *          - Kitchen: PREPARING → PREPARED
   *          - Waiter: PREPARED → DELIVERED
   * @access  Private (Staff - Kitchen or Waiter)
   */
  static async updateOrderStatus(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId;
      const staffId = req.user?.id;
      const staffRole = req.user?.staffRole;

      if (!restaurantId || !staffId || !staffRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;
      const { status, kitchenNotes } = req.body;

      const result = await OrderService.updateOrderStatus(
        restaurantId,
        id,
        staffId,
        staffRole,
        status,
        kitchenNotes
      );

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Update order status controller error", {
        error: error.message,
        orderId: req.params.id,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PATCH /api/v1/staff/orders/:id/payment
   * @desc    Mark order as paid (Waiter only)
   * @access  Private (Staff - Waiter only)
   */
  static async markAsPaid(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId;
      const staffId = req.user?.id;
      const staffRole = req.user?.staffRole;

      if (!restaurantId || !staffId || !staffRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;

      const result = await OrderService.markAsPaid(
        restaurantId,
        id,
        staffId,
        staffRole
      );

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Mark as paid controller error", {
        error: error.message,
        orderId: req.params.id,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/staff/orders/my/assigned
   * @desc    Get orders assigned to current staff member
   * @access  Private (Staff only)
   */
  static async getMyOrders(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.restaurantId;
      const staffId = req.user?.id;
      const staffRole = req.user?.staffRole;

      if (!restaurantId || !staffId || !staffRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const filters = {
        status: req.query.status as OrderStatus | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await OrderService.getOrdersByStaff(
        restaurantId,
        staffId,
        staffRole,
        filters
      );

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get my orders controller error", {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
