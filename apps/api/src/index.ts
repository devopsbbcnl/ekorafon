import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import factoryRoutes from "./routes/factory";
import rfqRoutes from "./routes/rfq";
import quoteRoutes from "./routes/quote";
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";
import paymentRoutes from "./routes/payment";
import reviewRoutes from "./routes/review";
import verificationRoutes from "./routes/verification";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Railway sits in front of the app behind one reverse proxy hop —
// trust its X-Forwarded-For so req.ip reflects the real client, not the proxy.
app.set("trust proxy", 1);

const allowedOrigins: (string | RegExp)[] =
  process.env.NODE_ENV === "production"
    ? [
        process.env.WEB_URL   || "http://localhost:3000",
        process.env.ADMIN_URL || "http://localhost:3001",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
      ];

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server calls (no origin header) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Webhook must receive the raw body for HMAC signature verification —
// mount it before express.json() so the body isn't parsed first.
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/factory", factoryRoutes);
app.use("/api/rfq", rfqRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Global error handler — returns JSON so the browser always gets a response
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
