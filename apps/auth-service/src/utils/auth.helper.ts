import crypto from "crypto";
import { NextFunction } from "express";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import { redisKey } from "../var/redisKey";

export const checkOtpRestrictions = async (
  email: string,
) => {
  const otpFailLock = await redis.get(redisKey.otp_fail_lock(email));
  if (otpFailLock) {
    throw new ValidationError(
      `Account locked due to multiple failed attempts! Please try again after 30 minutes`
    );
  }

  const otpSpamLock = await redis.get(redisKey.otp_spam_lock(email));
  if (otpSpamLock) {
    throw new ValidationError(
      `Too many OTP requests! Please try again after 1 hours`
    );
  }

  const otpCooldown = await redis.get(redisKey.otp_cooldown(email));
  if (otpCooldown) {
    throw new ValidationError(`You can only get 1 otp per minute`);
  }
};

export const trackOtpRequests = async (email: string) => {
  const otpRequests = await redis.get(redisKey.otp_request_count(email));

  if (otpRequests && Number(otpRequests) >= 3) {
    await redis.set(redisKey.otp_spam_lock(email), "true", "EX", 3600); // 1 hour
    await redis.del(redisKey.otp_request_count(email));
    throw new ValidationError(
      `Too many OTP requests! Please try again after 1 hours`
    );
  }

  await redis.set(
    redisKey.otp_request_count(email),
    (Number(otpRequests) || 0) + 1,
    "EX",
    3600
  );
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail({
    to: email,
    subject: "OTP Verification",
    templateName: template,
    data: { name, otp },
  });

  await redis.set(redisKey.otp(email), otp, "EX", 300); // 5 min
  await redis.set(redisKey.otp_cooldown(email), "true", "EX", 60); // 1 per min
};

export const verifyOtp = async (
  email: string,
  otp: string,
) => {
  const storedOtp = await redis.get(redisKey.otp(email));
  if (!storedOtp) {
    throw new ValidationError(`Invalid OTP`);
  }

  const failAttempts = await redis.get(redisKey.otp_attempts(email));

  if (storedOtp !== otp) {
    if (failAttempts && Number(failAttempts) >= 3) {
      await redis.set(redisKey.otp_fail_lock(email), "locked", "EX", 1800); // 30 min
      await redis.del(redisKey.otp(email), redisKey.otp_attempts(email));

      throw new ValidationError(
        `Account locked due to multiple failed attempts! Please try again after 30 minutes`
      );
    }

    await redis.set(
      redisKey.otp_attempts(email),
      (Number(failAttempts) || 0) + 1,
      "EX",
      300
    );

    throw new ValidationError(
      `Invalid OTP, ${2 - Number(failAttempts || 0)} attempts left`
    );
  }

  await redis.del(
    redisKey.otp(email),
    redisKey.otp_attempts(email),
    redisKey.otp_cooldown(email),
    redisKey.otp_request_count(email),
    redisKey.otp_fail_lock(email),
    redisKey.otp_spam_lock(email)
  );
};
