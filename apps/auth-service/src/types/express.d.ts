// src/types/express.d.ts
import type { User, Seller } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    account?: User | Seller;
    role?: "user" | "seller";
  }
}
