import { Request, Response } from "express";
import { userSchema } from "../modals/User.modal";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../utils/createAccessToken";
interface Register {
  username: string;
  password: string;
}
export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { password, username } = req.body as Register;
      const user = await userSchema.create({
        username,
        password: password,
      });
      const token = createAccessToken({
        id: String(user._id),
        role: user.role,
        username: user.username,
      });
      return res.json(token);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
