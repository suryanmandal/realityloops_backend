import Order from "../models/order";
import Product from "../models/product";
import Staff from "../models/staff";
import { logger } from "../utils/logger";
import { OrderStatus, StaffRole } from "../types/enums";
import { IOrderItem } from "../types/interfaces";
import { Types } from "mongoose";

/**
 * Order Service Class
 * Handles all order-related business logic
 */
export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(
    restaurantId: string,
    data: {
      tableNumber: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>;
      totalAmount: number;
      paymentAmount: number;
      customerNotes?: string;
    }
  ) {
    try {
      // Verify all products exist and belong to the restaurant
      const productIds = data.items.map((item) => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        restaurantId,
      });

      if (products.length !== productIds.length) {
        return {
          success: false,
          message: "One or more products not found or do not belong to your restaurant",
        };
      }

      // Verify products are available
      const unavailableProducts = products.filter((p) => !p.isAvailable);
      if (unavailableProducts.length > 0) {
        return {
          success: false,
          message: `Products not available: ${unavailableProducts.map((p) => p.title).join(", ")}`,
        };
      }

      // Create order
      const order = await Order.create({
        restaurantId,
        tableNumber: data.tableNumber,
        items: data.items,
        totalAmount: data.totalAmount,
        paymentAmount: data.paymentAmount,
        status: OrderStatus.IDLE,
        isPaid: false,
        customerNotes: data.customerNotes,
      });

      await order.populate([
        { path: "items.productId", select: "title image" },
      ]);

      logger.info("Order created", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        restaurantId,
        totalAmount: order.totalAmount,
      });

      return {
        success: true,
        message: "Order created successfully",
        data: { order },
      };
    } catch (error: any) {
      logger.error("Error creating order", {
        error: error.message,
        restaurantId,
      });
      return {
        success: false,
        message: "Failed to create order",
      };
    }
  }

  /**
   * Get orders with filters
   */
  static async getOrders(
    restaurantId: string,
    domain?: string,
    filters?: {
      status?: OrderStatus;
      isPaid?: boolean;
      tableNumber?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const query: any = { restaurantId };

      // Apply filters
      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.isPaid !== undefined) {
        query.isPaid = filters.isPaid;
      }

      if (filters?.tableNumber) {
        query.tableNumber = filters.tableNumber;
      }

      // Date range filter
      if (filters?.startDate || filters?.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          query.createdAt.$lte = endDate;
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [orderDocs, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate([
            { path: "items.productId", select: "title image" },
            { path: "waiterStaffId", select: "name email" },
            { path: "kitchenStaffId", select: "name email" },
          ]),
        Order.countDocuments(query),
      ]);

      // Convert to plain objects and add domain to product images if domain is provided
      if (domain) {
        const processedOrders = orderDocs.map(orderDoc => {
          const orderObject = orderDoc.toObject();
          if (orderObject.items && Array.isArray(orderObject.items)) {
            orderObject.items = orderObject.items.map(item => {
              // Type assertion to handle populated product data
              const populatedProduct = item.productId as any;
              if (populatedProduct && populatedProduct.image) {
                // If image path is already a full URL, don't modify it
                if (!populatedProduct.image.startsWith('http')) {
                  populatedProduct.image = `${domain}/${populatedProduct.image}`;
                }
              }
              return item;
            });
          }
          return orderObject;
        });

        return {
          success: true,
          message: "Orders retrieved successfully",
          data: {
            orders: processedOrders,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        };
      }

      // Convert to plain objects without domain modification
      const orders = orderDocs.map(doc => doc.toObject());
      return {
        success: true,
        message: "Orders retrieved successfully",
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error("Error getting orders", {
        error: error.message,
        restaurantId,
      });
      return {
        success: false,
        message: "Failed to retrieve orders",
      };
    }
  }

  /**
   * Get single order by ID
   */
  static async getOrderById(restaurantId: string, orderId: string) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        restaurantId,
      }).populate([
        { path: "items.productId", select: "title description image price" },
        { path: "waiterStaffId", select: "name email phone" },
        { path: "kitchenStaffId", select: "name email phone" },
      ]);

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      return {
        success: true,
        message: "Order retrieved successfully",
        data: { order },
      };
    } catch (error: any) {
      logger.error("Error getting order by ID", {
        error: error.message,
        orderId,
      });
      return {
        success: false,
        message: "Failed to retrieve order",
      };
    }
  }

  /**
   * Accept order (Waiter only - moves from IDLE to PREPARING)
   */
  static async acceptOrder(
    restaurantId: string,
    orderId: string,
    staffId: string,
    staffRole: StaffRole,
    kitchenNotes?: string
  ) {
    try {
      // Verify staff is a waiter
      if (staffRole !== StaffRole.WAITER_DESK) {
        return {
          success: false,
          message: "Only waiter staff can accept orders",
        };
      }

      // Verify staff belongs to the restaurant
      const staff = await Staff.findOne({
        _id: staffId,
        restaurantId,
        staffRole: StaffRole.WAITER_DESK,
      });

      if (!staff) {
        return {
          success: false,
          message: "Waiter staff not found",
        };
      }

      // Find order
      const order = await Order.findOne({
        _id: orderId,
        restaurantId,
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Check if order is in IDLE status
      if (order.status !== OrderStatus.IDLE) {
        return {
          success: false,
          message: `Order cannot be accepted. Current status: ${order.status}`,
        };
      }

      // Update order
      order.status = OrderStatus.PREPARING;
      order.waiterStaffId = staff._id as Types.ObjectId;
      order.orderAcceptedAt = new Date();
      order.preparingStartedAt = new Date();
      if (kitchenNotes) {
        order.kitchenNotes = kitchenNotes;
      }

      await order.save();
      await order.populate([
        { path: "items.productId", select: "title image" },
        { path: "waiterStaffId", select: "name email" },
      ]);

      logger.info("Order accepted by waiter", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        staffId,
        staffName: staff.name,
      });

      return {
        success: true,
        message: "Order accepted and sent to kitchen",
        data: { order },
      };
    } catch (error: any) {
      logger.error("Error accepting order", {
        error: error.message,
        orderId,
        staffId,
      });
      return {
        success: false,
        message: "Failed to accept order",
      };
    }
  }

  /**
   * Update order status
   * - Kitchen staff: PREPARING → PREPARED
   * - Waiter staff: PREPARED → DELIVERED
   */
  static async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    staffId: string,
    staffRole: StaffRole,
    newStatus: OrderStatus,
    kitchenNotes?: string
  ) {
    try {
      // Verify staff belongs to restaurant
      const staff = await Staff.findOne({
        _id: staffId,
        restaurantId,
      });

      if (!staff) {
        return {
          success: false,
          message: "Staff not found",
        };
      }

      // Find order
      const order = await Order.findOne({
        _id: orderId,
        restaurantId,
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Validate status transitions based on staff role
      if (staffRole === StaffRole.KITCHEN) {
        // Kitchen can only move from PREPARING to PREPARED
        if (order.status !== OrderStatus.PREPARING) {
          return {
            success: false,
            message: `Order must be in PREPARING status. Current status: ${order.status}`,
          };
        }
        if (newStatus !== OrderStatus.PREPARED) {
          return {
            success: false,
            message: "Kitchen staff can only mark order as PREPARED",
          };
        }

        order.status = OrderStatus.PREPARED;
        order.kitchenStaffId = staff._id as Types.ObjectId;
        order.preparedAt = new Date();
        if (kitchenNotes) {
          order.kitchenNotes = kitchenNotes;
        }
      } else if (staffRole === StaffRole.WAITER_DESK) {
        // Waiter can only move from PREPARED to DELIVERED
        if (order.status !== OrderStatus.PREPARED) {
          return {
            success: false,
            message: `Order must be in PREPARED status. Current status: ${order.status}`,
          };
        }
        if (newStatus !== OrderStatus.DELIVERED) {
          return {
            success: false,
            message: "Waiter staff can only mark order as DELIVERED",
          };
        }

        order.status = OrderStatus.DELIVERED;
        order.deliveredAt = new Date();
        // Keep the original waiter or update if different waiter is delivering
        if (!order.waiterStaffId) {
          order.waiterStaffId = staff._id as Types.ObjectId;
        }
      } else {
        return {
          success: false,
          message: "Invalid staff role for this operation",
        };
      }

      await order.save();
      await order.populate([
        { path: "items.productId", select: "title image" },
        { path: "waiterStaffId", select: "name email" },
        { path: "kitchenStaffId", select: "name email" },
      ]);

      logger.info("Order status updated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: order.status,
        staffId,
        staffRole,
      });

      return {
        success: true,
        message: `Order status updated to ${order.status}`,
        data: { order },
      };
    } catch (error: any) {
      logger.error("Error updating order status", {
        error: error.message,
        orderId,
        staffId,
      });
      return {
        success: false,
        message: "Failed to update order status",
      };
    }
  }

  /**
   * Mark order as paid (Waiter staff only)
   */
  static async markAsPaid(
    restaurantId: string,
    orderId: string,
    staffId: string,
    staffRole: StaffRole
  ) {
    try {
      // Verify staff is a waiter
      if (staffRole !== StaffRole.WAITER_DESK) {
        return {
          success: false,
          message: "Only waiter staff can mark orders as paid",
        };
      }

      // Verify staff belongs to restaurant
      const staff = await Staff.findOne({
        _id: staffId,
        restaurantId,
        staffRole: StaffRole.WAITER_DESK,
      });

      if (!staff) {
        return {
          success: false,
          message: "Waiter staff not found",
        };
      }

      // Find order
      const order = await Order.findOne({
        _id: orderId,
        restaurantId,
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      // Check if already paid
      if (order.isPaid) {
        return {
          success: false,
          message: "Order is already marked as paid",
        };
      }

      // Check if order is delivered
      if (order.status !== OrderStatus.DELIVERED) {
        return {
          success: false,
          message: "Order must be delivered before marking as paid",
        };
      }

      // Update order
      order.isPaid = true;
      order.paidAt = new Date();

      await order.save();
      await order.populate([
        { path: "items.productId", select: "title image" },
        { path: "waiterStaffId", select: "name email" },
        { path: "kitchenStaffId", select: "name email" },
      ]);

      logger.info("Order marked as paid", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentAmount: order.paymentAmount,
        staffId,
      });

      return {
        success: true,
        message: "Order marked as paid successfully",
        data: { order },
      };
    } catch (error: any) {
      logger.error("Error marking order as paid", {
        error: error.message,
        orderId,
        staffId,
      });
      return {
        success: false,
        message: "Failed to mark order as paid",
      };
    }
  }

  /**
   * Get orders by staff (for staff to see their assigned orders)
   */
  static async getOrdersByStaff(
    restaurantId: string,
    staffId: string,
    staffRole: StaffRole,
    domain?: string,
    filters?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const query: any = { restaurantId };

      // Filter by staff role
      if (staffRole === StaffRole.KITCHEN) {
        query.kitchenStaffId = staffId;
      } else if (staffRole === StaffRole.WAITER_DESK) {
        query.waiterStaffId = staffId;
      }

      // Apply status filter
      if (filters?.status) {
        query.status = filters.status;
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const [orderDocs, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate([
            { path: "items.productId", select: "title image" },
          ]),
        Order.countDocuments(query),
      ]);

      // Convert to plain objects and add domain to product images if domain is provided
      if (domain) {
        const processedOrders = orderDocs.map(orderDoc => {
          const orderObject = orderDoc.toObject();
          if (orderObject.items && Array.isArray(orderObject.items)) {
            orderObject.items = orderObject.items.map(item => {
              // Type assertion to handle populated product data
              const populatedProduct = item.productId as any;
              if (populatedProduct && populatedProduct.image) {
                // If image path is already a full URL, don't modify it
                if (!populatedProduct.image.startsWith('http')) {
                  populatedProduct.image = `${domain}/${populatedProduct.image}`;
                }
              }
              return item;
            });
          }
          return orderObject;
        });

        return {
          success: true,
          message: "Orders retrieved successfully",
          data: {
            orders: processedOrders,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        };
      }

      // Convert to plain objects without domain modification
      const orders = orderDocs.map(doc => doc.toObject());
      return {
        success: true,
        message: "Orders retrieved successfully",
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error("Error getting orders by staff", {
        error: error.message,
        staffId,
      });
      return {
        success: false,
        message: "Failed to retrieve orders",
      };
    }
  }
}
