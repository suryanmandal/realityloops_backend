import { Router } from "express";

const sellerRouter = Router();

// Seller routes are now under /restaurant
// This router is kept for backwards compatibility
// Redirect to restaurant routes if needed

export default sellerRouter;
