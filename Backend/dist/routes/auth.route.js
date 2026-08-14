import { Router } from "express";
import { registerController, loginController, getMeController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, getMeController);
export default router;
