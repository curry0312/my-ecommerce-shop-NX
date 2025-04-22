import { ValidationError } from "@packages/error-handler";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const userRegistrationSchema = baseSchema.extend({});

export const sellerRegistrationSchema = baseSchema.extend({
  phone_number: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
});

export type UserRegistrationBody = z.infer<typeof userRegistrationSchema>;
export type SellerRegistrationBody = z.infer<typeof sellerRegistrationSchema>;

export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    userRegistrationSchema.parse(req.body);
    next();
  } catch (err) {
    next(
      new ValidationError("User registration data validation failed", {
        error: err,
        schema: userRegistrationSchema,
      })
    );
  }
};
export const validateSellerRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    sellerRegistrationSchema.safeParse(req.body);
    next();
  } catch (err) {
    next(
      new ValidationError("User registration data validation failed", {
        error: err,
        schema: sellerRegistrationSchema,
      })
    );
  }
};
