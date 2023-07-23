import { NextFunction, Router, Response, Request } from "express";
import { authController } from "../controllers/auth.controller";
import passport from "passport";
import { userSchema } from "../modals/User.modal";
import { createAccessToken } from "../utils/createAccessToken";
import { requireSignInMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.post("/register", authController.register);
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const dbUser = await userSchema.findOne({
      email: email,
      password: password,
    });
    if (!dbUser) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const token = createAccessToken({
      id: String(dbUser._id),
      role: dbUser.role,
      username: dbUser.username,
    });
    return res.status(200).json(token);
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
});
router.get("/get-user", requireSignInMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json("error");
  }
  return res.status(200).json(req.user);
});

export default router;
