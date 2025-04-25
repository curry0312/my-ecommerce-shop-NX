import { Router } from "express";
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
} from "../controllers/product.controller";
import { isAuthenticated } from "@packages/middleware/isAuthenticated";

const productRouter = Router();

productRouter.get("/get-categories", getCategories);

productRouter.post("/create-product", createProduct);

productRouter.post("/create-discountCode", isAuthenticated, createDiscountCode);

productRouter.get("/get-discountCode", isAuthenticated, getDiscountCodes);

productRouter.delete("/delete-discountCode/:discountCodeId", isAuthenticated, deleteDiscountCode);



export default productRouter;
