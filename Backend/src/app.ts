import express from "express";
import emailRoutes from "./routes/email.route";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "reachinbox-backend"
    });
});

app.use("/api/emails", emailRoutes);

export default app;