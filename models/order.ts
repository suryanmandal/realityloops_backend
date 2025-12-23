import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem } from "../types/interfaces";
import { OrderStatus } from "../types/enums";

/**
 * Order Item Sub-schema
 * Represents individual items in an order with snapshot data
 */
const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
  },
  { _id: false } // Don't create separate _id for sub-documents
);

/**
 * Order Schema
 * Main order document with complete order lifecycle tracking
 */
const orderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
      index: true,
    },
    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentAmount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.IDLE,
      required: true,
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    waiterStaffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      index: true,
    },
    kitchenStaffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      index: true,
    },
    orderAcceptedAt: {
      type: Date,
    },
    preparingStartedAt: {
      type: Date,
    },
    preparedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    customerNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Customer notes cannot exceed 500 characters"],
    },
    kitchenNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Kitchen notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
orderSchema.index({ restaurantId: 1, status: 1 }); // Filter by restaurant and status
orderSchema.index({ restaurantId: 1, createdAt: -1 }); // Recent orders per restaurant
orderSchema.index({ restaurantId: 1, orderNumber: 1 }); // Search by order number
orderSchema.index({ restaurantId: 1, isPaid: 1 }); // Filter paid/unpaid orders
orderSchema.index({ waiterStaffId: 1, status: 1 }); // Waiter's assigned orders
orderSchema.index({ kitchenStaffId: 1, status: 1 }); // Kitchen's assigned orders
orderSchema.index({ restaurantId: 1, tableNumber: 1, createdAt: -1 }); // Orders by table

/**
 * Pre-save hook to generate unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
orderSchema.pre<IOrder>("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Generate order number based on date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const datePrefix = `ORD-${year}${month}${day}`;

    // Find the last order number for today
    const lastOrder = await mongoose
      .model("Order")
      .findOne({
        orderNumber: new RegExp(`^${datePrefix}`),
      })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean<{ orderNumber: string }>();

    let sequence = 1;
    if (lastOrder?.orderNumber) {
      // Extract sequence number and increment
      const lastSequence = parseInt(lastOrder.orderNumber.split("-")[2]);
      sequence = lastSequence + 1;
    }

    // Generate new order number with 4-digit sequence
    this.orderNumber = `${datePrefix}-${String(sequence).padStart(4, "0")}`;

    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Pre-save hook to validate subtotals and total amount
 */
orderSchema.pre<IOrder>("save", function (next) {
  // Calculate and validate subtotals
  let calculatedTotal = 0;

  for (const item of this.items) {
    const expectedSubtotal = item.quantity * item.unitPrice;

    // Allow small floating point differences (0.01)
    if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
      return next(
        new Error(
          `Invalid subtotal for ${item.productName}. Expected ${expectedSubtotal}, got ${item.subtotal}`
        )
      );
    }

    calculatedTotal += item.subtotal;
  }

  // Validate total amount matches sum of subtotals
  if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
    return next(
      new Error(
        `Total amount mismatch. Calculated: ${calculatedTotal.toFixed(2)}, Provided: ${this.totalAmount}`
      )
    );
  }

  next();
});

export default mongoose.model<IOrder>("Order", orderSchema);
