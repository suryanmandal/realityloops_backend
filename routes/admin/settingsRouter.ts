import { Router } from "express";
import { SettingsController } from "../../controllers/settings.controller";
import { authenticate, isAdmin } from "../../middleware/auth.middleware";

const settingsRouter = Router();

// All settings routes require authentication and admin role
settingsRouter.use(authenticate, isAdmin);

// GET /api/v1/admin/settings
settingsRouter.get("/", SettingsController.getSettings);

// PUT /api/v1/admin/settings
settingsRouter.put("/", SettingsController.updateSettings);

export default settingsRouter;
