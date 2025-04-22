import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";


export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization;

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
