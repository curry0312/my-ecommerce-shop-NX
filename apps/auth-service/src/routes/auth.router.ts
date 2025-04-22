import { Router } from "express";
import {
  getUser,
  refreshAccessToken,
  userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  verifyForgotPasswordOtp,
  verifyUserOtp,
} from "../controller/auth.controller";
import { validateUserRegistration } from "../utils/middleware/zodSchemaValidation/validateRegistrationData";
import { validateVerifyUserData } from "../utils/middleware/zodSchemaValidation/validateVerifyUserData";
import { validateLoginData } from "../utils/middleware/zodSchemaValidation/validateLoginData";
import { isAuthenticated } from "@packages/middleware/isAuthenticated";

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

//handle forgot password
authRouter.post("/forgot-password-user", userForgotPassword);

//handle reset password
authRouter.post("/reset-password-user", userResetPassword);

//handle verify otp for forgot password
authRouter.post("/verify-forgot-password-user", verifyForgotPasswordOtp);

//handle refresh access token
authRouter.post("/refresh-token-user", refreshAccessToken);

//get logged in user info, if user is not logged in, return error
authRouter.get("/logged-in-user", isAuthenticated, getUser);

export default authRouter;
