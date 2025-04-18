import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";

//Register a new user
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;
      
        const existingUser = await prisma.users.findUnique({
          where: {
            email,
          },
        });
      
        if(existingUser){
          return next(new  ValidationError(`User with email ${email} already exists`))
        }
      
       await checkOtpRestrictions(email, next)
       await trackOtpRequests(email, next)
       await sendOtp(name, email, "user-activation-mail");
      
        return res.status(200).json({
          message: "OTP sent successfully",
        });  
    } catch (error) {
        return next(error);
    }
};
