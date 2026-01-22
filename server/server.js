import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoute.js";

import { clerkMiddleware } from "@clerk/express";

const app = express();

/* -------------------- DB & SERVICES -------------------- */
await connectDB();
await connectCloudinary();

/* -------------------- WEBHOOKS (RAW BODY ONLY) -------------------- */
app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

app.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

/* -------------------- MIDDLEWARES -------------------- */
app.use(cors());
app.use(express.json()); // AFTER webhooks
app.use(clerkMiddleware());

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => res.send("Started"));

app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
