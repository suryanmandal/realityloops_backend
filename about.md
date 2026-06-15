# About Reality Loops Backend API

## Overview

Reality Loops Backend API is a production-grade restaurant management platform built with Node.js, TypeScript, and Express. The system features role-based authentication and authorization with support for multiple user types, comprehensive order management, and a well-structured architecture following modern software development practices.

## Project Structure

```
arProdBackend/
├── config/              # Configuration files
│   ├── dbConfig.ts      # MongoDB connection
│   ├── firebaseConfig.ts # Firebase configuration
│   ├── index.ts         # Configuration exports
│   └── mailConfig.ts    # Email configuration
├── controllers/         # Route controllers (OOP)
│   ├── admin.controller.ts
│   ├── category.controller.ts
│   ├── index.ts
│   ├── order.controller.ts
│   ├── product.controller.ts
│   ├── restaurant.controller.ts
│   ├── staff.controller.ts
│   ├── upload.controller.ts
│   └── userController.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts       # Authentication & authorization
│   ├── error.middleware.ts      # Error handling
│   ├── index.ts
│   ├── upload.middleware.ts     # File upload handling
│   └── validation.middleware.ts # Input validation
├── models/             # Mongoose models
│   ├── admin.ts        # Admin model
│   ├── category.ts     # Category model
│   ├── index.ts
│   ├── order.ts        # Order model
│   ├── otp.ts          # OTP model
│   ├── product.ts      # Product model
│   ├── seller.ts       # Restaurant model
│   ├── staff.ts        # Staff model
│   └── user.ts         # User model
├── routes/             # Express routes
│   ├── admin/          # Admin routes
│   ├── restaurant/     # Restaurant routes
│   ├── seller/         # Seller routes
│   ├── staff/          # Staff routes
│   ├── user/           # User routes
│   └── index.ts        # Main route aggregator
├── services/           # Business logic layer
│   ├── admin.auth.service.ts
│   ├── category.service.ts
│   ├── index.ts
│   ├── jwt.service.ts
│   ├── order.service.ts
│   ├── otp.service.ts
│   ├── product.service.ts
│   ├── restaurant.auth.service.ts
│   ├── staff.auth.service.ts
│   └── upload.service.ts
├── types/              # TypeScript type definitions
│   ├── enums.ts        # Enums for roles, status, etc.
│   └── interfaces.ts   # TypeScript interfaces
├── utils/              # Utility functions
│   ├── email.service.ts  # Email sending service
│   ├── emailTemplates.ts # Email HTML templates
│   ├── index.ts
│   ├── logger.ts       # Logging utility
│   └── otp.util.ts     # OTP generation
├── validation/         # Zod validation schemas
│   └── auth.validation.ts
├── api/                # API route definitions
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── .env.example        # Environment variables example
├── .gitignore
├── API_DOCUMENTATION.md # API documentation
├── ORDER_MANAGEMENT_GUIDE.md # Order management guide
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── vitest.config.ts    # Testing configuration
└── public/             # Static files (uploads)
    └── uploads/
        └── 3d-models/  # 3D model storage
```

## Key Components Analysis

### App.ts - Express Application Setup

The `app.ts` file serves as the main Express application configuration:

```typescript
import express from 'express';
import type { Request, Response, Application } from 'express';
import { config } from 'dotenv';
import morgan from 'morgan';
import apiRouter from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

config({
    quiet: true,
});

const app: Application = express();

// Morgan HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Custom morgan format for production
    app.use(morgan('combined', {
        stream: {
            write: (message: string) => logger.http(message.trim())
        }
    }));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder (for uploaded 3D models)
app.use('/uploads', express.static('public/uploads'));

// Health check route
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        status: 'success',
        message: 'Reality Loops API Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/v1', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
```

Key features of the application setup:
- Environment variable loading with dotenv
- HTTP request logging with Morgan (different formats for dev/prod)
- Body parsing middleware for JSON and URL-encoded data
- Static file serving for uploaded 3D models
- Health check endpoint
- API versioning with `/api/v1` prefix
- 404 and error handling middleware

### Server.ts - Server Entry Point

The `server.ts` file handles server startup and database connection:

```typescript
import app from "./app";
import { config } from "dotenv";
import connectDB from "./config/dbConfig";
import { logger } from "./utils/logger";

config({
  quiet: true,
});

const PORT: number = parseInt(process.env.PORT ?? "3000", 10);

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info("🚀 Server is starting...");
      logger.info(
        process.env.NODE_ENV === "production"
          ? "🌍 Running in production mode"
          : "🔍 Running in development mode"
      );
      logger.info(`✅ Server is running on http://127.0.0.1:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    logger.error("Failed to connect to the database, server not starting", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
```

Key features of the server setup:
- Proper error handling for uncaught exceptions and promise rejections
- Database connection with graceful startup
- Graceful shutdown handling for SIGTERM and SIGINT signals
- Comprehensive logging throughout the startup process

## Product Router

The product router handles all product-related operations for restaurants. It's located at `/routes/restaurant/productRouter.ts` and provides comprehensive CRUD operations for managing restaurant products with support for image and AR model uploads.

```typescript
import { Router } from "express";
import { ProductController } from "../../controllers/product.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";
import { uploadProductFiles } from "../../middleware/upload.middleware";
import {
    createProductSchema,
    updateProductSchema,
    bulkUpdateAvailabilitySchema,
} from "../../validation/product.validation";

const productRouter = Router();

// All product routes require authentication and restaurant role
productRouter.use(authenticate, isRestaurant);

// Bulk update availability (before /:id to avoid route conflicts)
productRouter.patch(
    "/bulk-availability",
    validate(bulkUpdateAvailabilitySchema),
    ProductController.bulkUpdateAvailability,
);

// Create product with image and AR model upload
productRouter.post(
    "/",
    uploadProductFiles,
    validate(createProductSchema),
    ProductController.createProduct,
);

// Get all products
productRouter.get("/", ProductController.getProducts);

// Get product by ID
productRouter.get("/:id", ProductController.getProductById);

// Update product with optional image and AR model upload
productRouter.put(
    "/:id",
    uploadProductFiles,
    validate(updateProductSchema),
    ProductController.updateProduct,
);

// Delete product
productRouter.delete("/:id", ProductController.deleteProduct);

export default productRouter;
```

Key features of the product router:
- All routes require authentication and restaurant role
- Bulk update availability functionality
- Support for image and AR model uploads
- Comprehensive CRUD operations (Create, Read, Update, Delete)
- Input validation using Zod schemas
- Proper route ordering to avoid conflicts

## Core Features

### Authentication System

The platform implements a comprehensive authentication system with:

1. **Multiple User Types**:
   - Restaurant/Seller accounts
   - Admin accounts
   - Staff accounts (Kitchen & Waiter/Desk staff)

2. **Security Features**:
   - JWT-based authentication with refresh tokens
   - OTP-based email verification
   - Secure password hashing with bcrypt
   - Role-based access control (RBAC)

3. **Authentication Flows**:
   - Signup with email verification
   - Login with JWT token generation
   - Password reset with OTP
   - Staff account creation by restaurants

### Order Management System

The platform includes a complete order management system with:

1. **Order Lifecycle**:
   - IDLE → PREPARING → PREPARED → DELIVERED
   - Staff assignment tracking
   - Payment status management
   - Timeline tracking for order stages

2. **Staff Roles**:
   - Waiter/Desk staff: Accept orders, mark as paid
   - Kitchen staff: Update preparation status

### API Endpoints

The API provides 24+ endpoints across different user types:

| Type | Endpoints |
|------|-----------|
| Restaurant | Signup, login, email verification, password reset, staff management |
| Admin | Signup, login, email verification, password reset, 3D model upload |
| Staff | Login, password change, order management |
| Order Management | Create, retrieve, update orders with various filters |

### Security Features

1. **Password Security**:
   - Minimum 8 characters with uppercase, lowercase, number, and special character
   - Bcrypt hashing with salt factor 10

2. **JWT Tokens**:
   - Access token: 7 days (configurable)
   - Refresh token: 30 days (configurable)
   - Secure secret key

3. **Input Validation**:
   - Comprehensive validation using Zod
   - Sanitization of inputs

4. **Rate Limiting**:
   - Express-rate-limit implementation

## Technology Stack

- **Backend**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh tokens
- **Validation**: Zod for schema validation
- **Security**: bcrypt for password hashing
- **Email**: Nodemailer for email services
- **Logging**: Custom logger with file output
- **Testing**: Vitest for testing framework
- **File Upload**: Multer for handling multipart forms

## Architecture Patterns

1. **Service Layer Pattern**: Business logic is separated from controllers
2. **OOP Architecture**: Controllers and services implemented as classes
3. **Middleware Pattern**: Authentication, validation, and error handling as middleware
4. **MVC Pattern**: Clear separation of models, controllers, and views (API responses)

## Production Features

1. **Comprehensive Logging**: Structured logging with different levels (ERROR, WARN, INFO, HTTP, DEBUG)
2. **Error Handling**: Global error middleware with consistent error responses
3. **Environment Configuration**: Proper environment variable management
4. **Graceful Shutdown**: Proper cleanup on server shutdown
5. **Health Checks**: Basic health check endpoint
6. **Static File Serving**: For uploaded 3D models

## Validation and Error Handling

The system implements comprehensive validation using Zod schemas with specific validation rules for:

- Email format validation
- Password complexity requirements
- Phone number validation (10 digits)
- Restaurant name length requirements
- Staff role validation

Error responses follow a consistent format:
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (only in development)"
}
```

## File Upload Capabilities

The platform supports 3D model uploads for admin users with:
- File size limits (100MB)
- Supported formats (.glb, .gltf, .usdz)
- Secure file storage in public/uploads/3d-models/
- Direct URL access for AR model integration

## Conclusion

The Reality Loops Backend API is a well-structured, production-ready application that demonstrates modern Node.js development practices. It includes comprehensive authentication, order management, and security features while maintaining clean code organization and proper separation of concerns. The application is designed to scale and includes all necessary features for a restaurant management platform with AR capabilities.
