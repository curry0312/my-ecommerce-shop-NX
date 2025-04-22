import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@packages/error-handler";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type loginDataBody = z.infer<typeof loginSchema>;

export const validateLoginData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    loginSchema.safeParse(req.body);
    next();
  } catch (err) {
    next(
      new ValidationError("User registration data validation failed", {
        error: err,
        schema: loginSchema,
      })
    );
  }
};
