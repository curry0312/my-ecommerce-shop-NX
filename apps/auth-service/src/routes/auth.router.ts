import { Router } from "express";
import {
  userLogin,
  userRegistration,
  verifyUser,
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
authRouter.post("/verify-user", validateVerifyUserData, verifyUser);

//handle user login
authRouter.post("/user-login", validateLoginData, userLogin);

export default authRouter;
