import express from "express";
import emailRoutes from "./routes/email.route";
import senderRoutes from "./routes/sender.route.js";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "reachinbox-backend"
    });
});

app.use("/api/emails", emailRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/auth", authRouter);

export default app;