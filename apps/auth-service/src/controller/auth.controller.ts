import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import {
  SellerRegistrationBody,
  UserRegistrationBody,
} from "../utils/middleware/zodSchemaValidation/validateRegistrationData";
import { setCookie } from "../utils/cookie/setCookie";
import { loginDataBody } from "../utils/middleware/zodSchemaValidation/validateLoginData";


//!User
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

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    return res.status(200).json({
      message: `New User ${name} with email ${email} created successfully`,
      data: newUser,
    });
  } catch (error) {
    return next(error);
  }
};

//User Login
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
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      "access-token": accessToken,
      "refresh-token": refreshToken,
    },
  });
};

//Get User Details
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    return res.status(200).json({
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token user
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return next(new ValidationError(`Missing refresh token`));
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESHTOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError(`Invalid refresh token`));
    }

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return next(new AuthError(`User not found`));
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_ACCESSTOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    setCookie(res, "accessToken", newAccessToken);

    return res.status(200).json({
      message: "accessToken refreshed successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        "access-token": newAccessToken,
      },
    });
  } catch (error) {}
};

//User forgot password
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

//User verify otp for forgot password
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
};

//User reset password
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

//!Seller
//Seller registration
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, country, phone_number } =
      req.body as SellerRegistrationBody;

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (existingSeller) {
      return next(
        new ValidationError(`Seller with email ${email} already exists`)
      );
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "seller-activation-mail");

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Seller forgot password
export const sellerForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ValidationError(`Seller with email ${email} not found`));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(user.name, email, "seller-forgot-password-mail");

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//Verify seller otp
export const verifySellerOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, name, password, country, phoneNumber } = req.body;
    if (!name || !email || !otp || !password || !country || !phoneNumber) {
      return next(new ValidationError(`Missing required fields`));
    }

    //check if user already exists
    const existingUser = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return next(
        new ValidationError(`Seller with email ${email} already exists`)
      );
    }

    //If user does not exists, verify otp
    await verifyOtp(email, otp);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hash,
        country,
        phone_number: phoneNumber,
      },
    });

    return res.status(200).json({
      message: `New Seller ${name} with email ${email} created successfully`,
      data: newSeller,
    });
  } catch (error) {
    return next(error);
  }
};

//login seller
export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as loginDataBody;

  if (!email || !password) {
    return next(new ValidationError(`Missing required fields`));
  }

  const seller = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!seller) {
    return next(new ValidationError(`Seller with email ${email} not found`));
  }

  if (!seller.password) {
    return next(
      new ValidationError(
        `There is no password for this seller, try to use other login method`
      )
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, seller.password);

  console.log("isPasswordMatched =", isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ValidationError(`Invalid password`));
  }

  const accessToken = jwt.sign(
    { id: seller.id, role: "seller" },
    process.env.JWT_ACCESSTOKEN_SECRET as string,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    { id: seller.id, role: "seller" },
    process.env.JWT_REFRESHTOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  setCookie(res, "seller-accessToken", accessToken);
  setCookie(res, "seller-refreshToken", refreshToken);

  res.status(200).json({
    message: "User logged in successfully",
    data: {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      "access-token": accessToken,
      "refresh-token": refreshToken,
    },
  });
};

//get seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller;
    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError(`Seller with id ${sellerId} not found`));
    }

    return res.status(200).json({ message: "Seller found", data: seller });
  } catch (error) {
    return next(error);
  }
};

//Create a new Shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, openingHours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !openingHours || !category || !sellerId) {
      return next(new ValidationError(`Missing required fields`));
    }

    const user = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!user) {
      return next(new ValidationError(`Seller with id ${sellerId} not found`));
    }

    const newShop = await prisma.shops.create({
      data: {
        sellerId,
        name: user.name,
        bio,
        address,
        openingHours: openingHours,
        website,
        category,
      },
    });

    return res
      .status(200)
      .json({ message: "Shop created successfully", data: newShop });
  } catch (error) {
    return next(error);
  }
};


//!Payment
//create stripe account


