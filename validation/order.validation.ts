import { z } from "zod";
import { OrderStatus } from "../types/enums";

/**
 * Order item validation schema
 */
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  subtotal: z.coerce.number().min(0, "Subtotal cannot be negative"),
});

/**
 * Create order validation schema
 */
export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z
      .string()
      .trim()
      .min(1, "Restaurant ID is required")
      .optional(),

    tableNumber: z
      .string()
      .trim()
      .min(1, "Table number is required")
      .max(20, "Table number cannot exceed 20 characters"),

    items: z
      .array(orderItemSchema)
      .min(1, "Order must contain at least one item")
      .max(50, "Order cannot contain more than 50 items"),

    totalAmount: z.coerce
      .number()
      .min(0, "Total amount cannot be negative"),

    paymentAmount: z.coerce
      .number()
      .min(0, "Payment amount cannot be negative"),

    customerNotes: z
      .string()
      .trim()
      .max(500, "Customer notes cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
  }).refine(
    (data) => {
      // Validate that total amount matches sum of item subtotals
      const calculatedTotal = data.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      return Math.abs(data.totalAmount - calculatedTotal) < 0.01;
    },
    {
      message: "Total amount must equal sum of item subtotals",
      path: ["totalAmount"],
    }
  ).refine(
    (data) => {
      // Validate each item's subtotal
      return data.items.every((item) => {
        const expectedSubtotal = item.quantity * item.unitPrice;
        return Math.abs(item.subtotal - expectedSubtotal) < 0.01;
      });
    },
    {
      message: "Item subtotal must equal quantity × unit price",
      path: ["items"],
    }
  ),
});

/**
 * Accept order validation schema (waiter accepts idle order)
 */
export const acceptOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
  body: z.object({
    kitchenNotes: z
      .string()
      .trim()
      .max(500, "Kitchen notes cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
  }),
});

/**
 * Update order status validation schema
 */
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
  body: z.object({
    status: z.enum(
      [
        OrderStatus.PREPARING,
        OrderStatus.PREPARED,
        OrderStatus.DELIVERED,
      ] as const,
      {
        message: "Invalid status. Must be PREPARING, PREPARED, or DELIVERED",
      }
    ),
    kitchenNotes: z
      .string()
      .trim()
      .max(500, "Kitchen notes cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
  }),
});

/**
 * Mark order as paid validation schema
 */
export const markAsPaidSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

/**
 * Get orders query parameters validation schema
 */
export const getOrdersQuerySchema = z.object({
  query: z.object({
    status: z
      .enum([
        OrderStatus.IDLE,
        OrderStatus.PREPARING,
        OrderStatus.PREPARED,
        OrderStatus.DELIVERED,
      ])
      .optional(),

    isPaid: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),

    tableNumber: z.string().trim().optional(),

    startDate: z
      .string()
      .datetime()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),

    endDate: z
      .string()
      .datetime()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),

    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be at least 1")
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(20),
  }),
});

/**
 * Get order by ID validation schema
 */
export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});
