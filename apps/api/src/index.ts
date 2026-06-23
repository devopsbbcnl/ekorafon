import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import factoryRoutes from "./routes/factory";
import rfqRoutes from "./routes/rfq";
import quoteRoutes from "./routes/quote";
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const corsOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.WEB_URL || "http://localhost:3000"
    : true; // reflect request origin in dev (any localhost port works)
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/factory", factoryRoutes);
app.use("/api/rfq", rfqRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Global error handler — returns JSON so the browser always gets a response
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
