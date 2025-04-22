import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { users as UsersType } from "@prisma/client";


export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const accessToken =
    req.headers.authorization?.split(" ")[1] || req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({
      status: 401,
      message: "no token",
    });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESSTOKEN_SECRET as string
    ) as {
      id: string;
      role: string;
    };

    if (!decoded) {
      return res.status(401).json({
        status: 401,
        message: "invalid token",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Account not found",
      });
    }
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }
};
