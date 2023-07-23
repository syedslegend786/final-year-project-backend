import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SessionUser } from "../types";
import { userSchema } from "../modals/User.modal";

export const requireSignInMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await verifyToken(token);
    if (user) {
      const dbUser = await userSchema.findOne({ _id: user.id });
      if (!dbUser) {
        return res.status(401).json({ msg: "Unauthorized" });
      }
      req.user = {
        id: String(dbUser._id),
        role: dbUser.role,
        username: dbUser.username,
      } as SessionUser;
      next();
    } else {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error in requireSignInMiddleware:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const verifyToken = (token: string): Promise<SessionUser | null> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SESSION_SECRET as string, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user as SessionUser);
      }
    });
  });
};
