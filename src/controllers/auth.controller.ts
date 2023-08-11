import { Request, Response } from "express";
import { User, userSchema } from "../modals/User.modal";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../utils/createAccessToken";
import { CreateResponse } from "../utils/CreateResponse";
import { generateRandomeNumber } from "../utils/generateRandomNumbers";
export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { password, username, email, mobile_number } = req.body as Partial<User>;
      const dbEmail = await userSchema.findOne({ email })
      if (dbEmail) {
        return CreateResponse({ data: { msg: "Email has been taken." }, res, status: 400 })
      }
      const dbNumber = await userSchema.findOne({ mobile_number })
      if (dbNumber) {
        return CreateResponse({ data: { msg: "Mobile number has been taken." }, res, status: 400 })
      }
      const otp = generateRandomeNumber({})
      await userSchema.create({
        password, username, email, mobile_number, otp
      });
      return CreateResponse({ data: { msg: "OTP has been sent to you number, verify yourself." }, res, status: 200 })
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
