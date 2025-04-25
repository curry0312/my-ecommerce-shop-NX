/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookie from "cookie-parser";
import cookieParser from "cookie-parser";
import initializeConfig from "./libs/initialSideConfig.ts";

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookie());
app.use(cookieParser());

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100),
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);

app.use("/product", proxy("http://localhost:6002"));
app.use("/", proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeConfig();
    console.log(`Site config initialized successfully`);
  } catch (error) {
    console.log("Failed to initialize site config", error);
  }
});
server.on("error", console.error);
