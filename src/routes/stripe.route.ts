import { Request, Response, Router } from "express";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { userSchema } from "../modals/User.modal";
import { stripe } from "../lib/stripe";
import { OrderModel } from "../modals/Orders.model";
import { carSchema } from "../modals/Cars.modal";

const router = Router();

router.get(
  "/verify-payment/:cid",
  requireSignInMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { start_date, end_date } = req.query as {
        start_date: string;
        end_date: string;
      };
      console.log('verify-payment data====>',JSON.stringify(req.query));
      const carId = req.params.cid;
      const dbCar = await carSchema.findOne({ _id: carId });
      const dbUser = await userSchema.findById(req?.user?.id);
      if (!dbUser?.stripe_session_id) {
        return res.status(400).json({ msg: "No product available." });
      }
      const stripSession = await stripe.checkout.sessions.retrieve(
        dbUser?.stripe_session_id
      );
      if (stripSession.payment_status === "unpaid") {
        return res.status(400).json({ msg: "You didn't pay for this car." });
      }
      await userSchema.findByIdAndUpdate(req.user?.id, {
        $unset: {
          stripe_session_id: "",
        },
      });
      await OrderModel.create({
        car: carId,
        booked_by: req.user?.id,
        company: dbCar?.user,
      });
      await carSchema.findByIdAndUpdate(carId, {
        start_date: start_date,
        end_date: end_date,
        booked_by: req.user?.id,
      });
      return res.status(200).json({ msg: "Order Successful." });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  }
);
export default router;
