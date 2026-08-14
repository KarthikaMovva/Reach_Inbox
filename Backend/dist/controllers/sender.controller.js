import { getAllSenders, getSenderById, createSender, updateSender, deleteSender } from "../services/sender.service.js";
export async function getAllSendersController(req, res) {
    try {
        const senders = await getAllSenders(req.userId);
        return res.json(senders);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch senders"
        });
    }
}
export async function getSenderByIdController(req, res) {
    try {
        const id = String(req.params.id);
        const sender = await getSenderById(id, req.userId);
        if (!sender) {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch sender"
        });
    }
}
export async function createSenderController(req, res) {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                error: "name and email are required"
            });
        }
        const sender = await createSender({
            name,
            email
        }, req.userId);
        return res.status(201).json(sender);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create sender"
        });
    }
}
export async function updateSenderController(req, res) {
    try {
        const id = String(req.params.id);
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(400).json({
                error: "At least one field is required"
            });
        }
        const sender = await updateSender(id, req.userId, {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email })
        });
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Sender not found") {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        return res.status(500).json({
            error: "Failed to update sender"
        });
    }
}
export async function deleteSenderController(req, res) {
    try {
        const id = String(req.params.id);
        const sender = await deleteSender(id, req.userId);
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        if (error.code === "NOT_FOUND") {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        if (error.code === "HAS_EMAILS") {
            return res.status(409).json({
                error: "Cannot delete sender because it has associated emails"
            });
        }
        return res.status(500).json({
            error: "Failed to delete sender"
        });
    }
}
