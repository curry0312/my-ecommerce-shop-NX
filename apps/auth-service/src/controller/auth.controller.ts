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
export const verifyUserOtp = async (
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

  console.log("isPasswordMatched =", isPasswordMatched);

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

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
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

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(user.name, email, "user-forgot-password-mail");
 
    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError(`Missing required fields`));
    }

    await verifyOtp(email, otp);

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
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

    const isNewPasswordValid = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordValid) {
      return next(
        new ValidationError("New password cannot be same as old password")
      );
    }

    const newhashPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.users.update({
      where: {
        email,
      },
      data: {
        password: newhashPassword,
      },
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    return next(error);
  }
};
