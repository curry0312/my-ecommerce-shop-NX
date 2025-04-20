import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRegistrationBody } from "../utils/middleware/validateRegistrationData";
import { setCookie } from "../utils/cookie/setCookie";
import { loginDataBody } from "../utils/middleware/validateLoginData";

//handle Registration for a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body as UserRegistrationBody;

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(
        new ValidationError(`User with email ${email} already exists`)
      );
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "user-activation-mail");

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Verify user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password } = req.body;
    if (!name || !email || !otp || !password) {
      return next(new ValidationError(`Missing required fields`));
    }

    //check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return next(
        new ValidationError(`User with email ${email} already exists`)
      );
    }

    //If user does not exists, verify otp
    await verifyOtp(email, otp);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    return res.status(200).json({
      message: `New User ${name} with email ${email} created successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as loginDataBody;

  if (!email || !password) {
    return next(new ValidationError(`Missing required fields`));
  }

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return next(new ValidationError(`User with email ${email} not found`));
  }

  if (!user.password) {
    return next(
      new ValidationError(
        `There is no password for this user, try to use other login method`
      )
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  console.log("isPasswordMatched =",isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ValidationError(`Invalid password`));
  }

  const accessToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_ACCESSTOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_REFRESHTOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  setCookie(res, "accessToken", accessToken);
  setCookie(res, "refreshToken", refreshToken);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      "access-token": accessToken,
      "refresh-token": refreshToken,
    },
  });
};