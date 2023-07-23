import { Request, Response } from "express";
import { stripe } from "../lib/stripe";
import { userSchema } from "../modals/User.modal";
import { ROLES } from "../utils/enums";

export const onboardingController = {
  makeInstructor: async (req: Request, res: Response) => {
    try {
      const account = await stripe.accounts.create({ type: "express" });
      const user = await userSchema.findOneAndUpdate(
        { _id: req.user?.id },
        {
          stripe_account_id: account.id,
        },
        {
          new: true,
        }
      );
      const accountLink = await stripe.accountLinks.create({
        account: user?.stripe_account_id!,
        refresh_url: process.env.STRIPE_CREATE_COMPANY_URL as string,
        type: "account_onboarding",
        return_url: process.env.STRIPE_CREATE_COMPANY_URL as string,
      });
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(accountLink)) {
        params.append(key, value);
      }

      const searchParamsString = params.toString();

      const url = `${accountLink.url}?${searchParamsString}`;
      res.status(200).json(url);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  verifyInstructor: async (req: Request, res: Response) => {
    try {
      const dbUser = await userSchema.findById(req.user?.id);
      if (!dbUser?.stripe_account_id) {
        return res.status(400).json({ msg: "Something went wrong." });
      }
      if (!dbUser.role.includes(ROLES.COMPANY)) {
        dbUser.role.push(ROLES.COMPANY);
        await dbUser.save();
      }
      return res.status(200).json({ msg: "successful." });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
