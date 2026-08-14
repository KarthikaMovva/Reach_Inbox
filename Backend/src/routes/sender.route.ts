import { Router } from "express";
import {
    getAllSendersController,
    getSenderByIdController,
    createSenderController,
    updateSenderController,
    deleteSenderController
} from "../controllers/sender.controller.js";


const router = Router();


router.get(
    "/",
    getAllSendersController
);
router.get(
    "/:id",
    getSenderByIdController
);
router.post(
    "/",
    createSenderController
);
router.patch(
    "/:id",
    updateSenderController
);
router.delete(
    "/:id",
    deleteSenderController
);


export default router;