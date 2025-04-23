import { Router } from "express";
import {
  createShop,
  getSeller,
  getUser,
  refreshAccessToken,
  sellerForgotPassword,
  sellerLogin,
  sellerRegistration,
  userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  verifyForgotPasswordOtp,
  verifySellerOtp,
  verifyUserOtp,
} from "../controller/auth.controller";
import {
  validateSellerRegistration,
  validateUserRegistration,
} from "../utils/middleware/zodSchemaValidation/validateRegistrationData";
import { validateVerifyUserData } from "../utils/middleware/zodSchemaValidation/validateVerifyUserData";
import { validateLoginData } from "../utils/middleware/zodSchemaValidation/validateLoginData";
import { isAuthenticated } from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "../utils/middleware/checkRole";

export const authRouter = Router();

//** User Routes **//

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
authRouter.get("/get-logged-in-user", isAuthenticated, isUser, getUser);

//** Seller Routes **//

authRouter.post(
  "/seller-registration",
  validateSellerRegistration,
  sellerRegistration
);

authRouter.post("/verify-seller", verifySellerOtp);

authRouter.post("/create-shop", createShop);

authRouter.post("/login-seller", sellerLogin);

authRouter.get("/get-logged-in-seller", isAuthenticated, isSeller, getSeller);

authRouter.post("/forgot-seller-password", sellerForgotPassword);

export default authRouter;
