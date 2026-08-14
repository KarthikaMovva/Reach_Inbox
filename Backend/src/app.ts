import express from "express";
import cors from "cors";

import emailRoutes from "./routes/email.route";
import senderRoutes from "./routes/sender.route.js";
import authRouter from "./routes/auth.route.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests such as curl/Postman/server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "reachinbox-backend",
    });
});

app.use("/api/emails", emailRoutes);
app.use("/api/senders", senderRoutes);
app.use("/api/auth", authRouter);

export default app;