import { NextFunction, Request, Response } from "express";

export const isSeller = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return res.status(403).json({
      message: "You are not authorized to access this resource",
    });
  }
  return next();
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return res.status(403).json({
      message: "You are not authorized to access this resource",
    });
  }
  return next();
};