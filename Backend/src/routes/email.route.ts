import { Router } from "express";

import {
    createEmailController,
    getAllEmailsController,
    getEmailByIdController,
    deleteEmailController
} from "../controllers/email.controller.js";

const router = Router();

router.post("/", createEmailController);
router.get("/", getAllEmailsController);
router.get("/:id", getEmailByIdController);
router.delete("/:id", deleteEmailController);

export default router;