import { Router } from "express";
import {
    userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  verifyForgotPasswordOtp,
  verifyUserOtp,
} from "../controller/auth.controller";
import { validateUserRegistration } from "../utils/middleware/validateRegistrationData";
import { validateVerifyUserData } from "../utils/middleware/validateVerifyUserData";
import { validateLoginData } from "../utils/middleware/validateLoginData";

export const authRouter = Router();

//Handle user registration ad send otp for verification
authRouter.post(
  "/user-registration",
  validateUserRegistration,
  userRegistration
);

//Verify user by otp, if valid, create user and set password, otherwise return error
authRouter.post("/verify-user", validateVerifyUserData, verifyUserOtp);

//handle user login
authRouter.post("/login-user", validateLoginData, userLogin);

authRouter.post("/forgot-password-user", userForgotPassword);

authRouter.post("/reset-password-user", userResetPassword);

authRouter.post("/verify-forgot-password-user", verifyForgotPasswordOtp);

export default authRouter;
