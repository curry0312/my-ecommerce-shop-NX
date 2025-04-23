import prisma from "@packages/libs/prisma/index.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken =
    req.cookies.accessToken ||
    req.cookies["seller-accessToken"] ||
    req.headers.authorization;

  if (!accessToken) {
    return res.status(401).json({
      status: 401,
      message: "no accessToken found",
    });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESSTOKEN_SECRET as string
    ) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(401).json({
        status: 401,
        message: "invalid token",
      });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
      });
    } else {
      account = await prisma.sellers.findUnique({
        where: {
          id: decoded.id,
        },
      });
    }

    if (!account) {
      return res.status(401).json({
        status: 401,
        message: "Account not found",
      });
    }

    req.user = account;
    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }
};
