import { NextFunction, Router, Response, Request } from "express";
import { authController } from "../controllers/auth.controller";
import passport from "passport";
import { User, user, userSchema } from "../modals/User.modal";
import { createAccessToken } from "../utils/createAccessToken";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { generateRandomeNumber } from "../utils/generateRandomNumbers";
import { v4 as uuid } from 'uuid'
const router = Router();
router.post("/register", authController.register);
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { mobile_number, password } = req.body as Partial<User>
    const dbUser = await userSchema.findOne({
      mobile_number,
      password
    });
    if (!dbUser) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    if (!dbUser.verified) {
      const otp = generateRandomeNumber({})
      await userSchema.findByIdAndUpdate(dbUser._id, {
        $set: {
          otp: otp
        }
      })
      return res.status(200).json({ token: true, });
    }
    const token = createAccessToken({
      _id: String(dbUser._id),
    });
    return res.status(200).json(token);
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
});
router.get("/get-user", requireSignInMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json("error");
  }
  const dbUser = await userSchema.findById(req.user._id)
  return res.status(200).json(dbUser);
});
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { mobile_number, otp } = req.body as Partial<User>
    const dbUser = await userSchema.findOne({ mobile_number })
    if (!dbUser) {
      return res.status(400).json({ msg: 'User not found.' });
    }
    if (dbUser.otp !== otp) {
      return res.status(400).json({ msg: 'Incorrect otp or otp is expired.' });
    }
    await userSchema.findByIdAndUpdate(dbUser._id, {
      $set: {
        verified: true,
        otp: ""
      }
    })
    return res.status(200).json({ msg: "Verified successfully." });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
})

router.post('/forget-password', async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body as { mobileNumber: string }
    const dbUser = await userSchema.findOne({ mobile_number: mobileNumber })
    if (!dbUser) {
      return res.status(200).json({ msg: "User not found." });
    }
    const resetToken = uuid().toString()
    await userSchema.findByIdAndUpdate(dbUser._id, {
      $set: {
        reset_token: resetToken
      }
    })
    return res.status(200).json({ msg: "Reset link has been sent to your mobile number." });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
})

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body as {
      token: string
      password: string
    }
   
    const dbUser = await userSchema.findOne({ reset_token: token })
    if (!dbUser) {
      return res.status(400).json({ msg: "User not found." });
    }
    await userSchema.findByIdAndUpdate(dbUser._id, {
      $set: {
        password: password,
        reset_token: ""
      }
    })
    return res.status(200).json({ msg: "Password changed successfully." });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
})

router.post("/update/company/profile", requireSignInMiddleware, async (req: Request, res: Response) => {
  try {

    await userSchema.findByIdAndUpdate(req.user?._id, {
      $set: {
        ...req.body
      }
    })
    return res.status(200).json({ msg: 'success.' });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
})

export default router;
