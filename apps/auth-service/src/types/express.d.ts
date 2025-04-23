// src/types/express.d.ts
import { User, Seller } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: User | Seller;
    role?: "user" | "seller";
  }
}
