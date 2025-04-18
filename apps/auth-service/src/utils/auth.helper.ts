import crypto from "crypto";
import { NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields`);
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format`);
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  //  Otp fail lock
  const otpFailLock = await redis.get(`otp_fail_lock:${email}`);
  if (otpFailLock) {
    return next(
      new ValidationError(
        `Account locked due to multiple failed attempts! Please try again after 30 minutes`
      )
    );
  }
  //  Otp spam lock
  const otpSpamLock = await redis.get(`otp_spam_lock:${email}`);
  if (otpSpamLock) {
    return next(
      new ValidationError(
        `Too many OTP requests! Please try again after 1 hours`
      )
    );
  }
  //  Otp receive cooldown
  const otpCooldown = await redis.get(`otp_cooldown:${email}`);
  if (otpCooldown) {
    return next(new ValidationError(`You can only get 1 otp per minute`));
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequests = await redis.get(`otp_request_count:${email}`);
  
  //If users send more than 2 otp in 1 hour, lock the account for 1 hour
  if (otpRequests && Number(otpRequests) >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // 1 hour
    return next(
      new ValidationError(
        `Too many OTP requests! Please try again after 1 hours`
      )
    );
  }
  await redis.set(`otp_request_count:${email}`, (Number(otpRequests) || 0) + 1, "EX", 3600);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 999).toString();
  await sendEmail({
    to: email,
    subject: "OTP Verification",
    templateName: template,
    data: { name, otp },
  });
  await redis.set(`otp:${email}`, otp, "EX", 300); // 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // can only send 1 otp per minute
};
