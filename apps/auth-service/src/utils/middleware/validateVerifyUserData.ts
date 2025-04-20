import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@packages/error-handler";
import { z } from "zod";

const VerifyUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().min(1, "OTP is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
});

export const validateVerifyUserData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    VerifyUserSchema.parse(req.body);
    next();
  } catch (err) {
    next(new ValidationError("User registration data validation failed", err));
  }
};
