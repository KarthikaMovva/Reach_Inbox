import { Router } from "express";

import {
    createEmailController,
    getAllEmailsController,
    getScheduledEmailsController,
    getSentEmailsController,
    getEmailByIdController,
    deleteEmailController,
    updateEmailController
} from "../controllers/email.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createEmailController);

router.get("/scheduled", getScheduledEmailsController);
router.get("/sent", getSentEmailsController);

router.get("/", getAllEmailsController);
router.get("/:id", getEmailByIdController);

router.patch("/:id", updateEmailController);
router.delete("/:id", deleteEmailController);

export default router;