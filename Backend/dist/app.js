"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const email_route_1 = __importDefault(require("./routes/email.route"));
const sender_route_js_1 = __importDefault(require("./routes/sender.route.js"));
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
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
}));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "reachinbox-backend",
    });
});
app.use("/api/emails", email_route_1.default);
app.use("/api/senders", sender_route_js_1.default);
app.use("/api/auth", auth_route_js_1.default);
exports.default = app;
