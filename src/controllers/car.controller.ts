import { Request, Response } from "express";
import { carSchema } from "../modals/Cars.modal";
import cloudinary, { uploadImage } from "../lib/cloudinary";
import { User, userSchema } from "../modals/User.modal";
import { calculatePlaterformFee, stripe, usdToCents } from "../lib/stripe";
type getVehiclesApiProps = {
  start_date: string;
  end_date: string;
  model: string;
  brand: string;
};
export const carController = {
  create: async (req: Request, res: Response) => {
    try {
      if (!req.file?.path) {
        return res.status(400).json({ msg: "Image is required." });
      }
      const image = await uploadImage(req.file?.path);
      const body = { ...req.body, user: req.user?.id, image: image.secure_url };

      await carSchema.create(body);

      return res.status(200).json({ msg: "created successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const carId = req.params.id;
      const body = req.body;
      await carSchema.findByIdAndUpdate(carId, { ...body });
      return res.status(200).json({ msg: "created successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCars: async (req: Request, res: Response) => {
    try {
      const { brand, end_date, model, start_date } =
        req.query as getVehiclesApiProps;
      const s_date = new Date(start_date);
      const e_date = new Date(end_date);
      console.log(req.query);
      const cars = await carSchema.find({
        $and: [
          {
            brand: brand,
          },
          {
            model: model,
          },
          {
            $or: [
              {
                start_date: { $exists: false },
                end_date: { $exists: false },
              },
              {
                start_date: {
                  $lt: s_date,
                },
                end_date: {
                  $lt: s_date,
                },
              },
              {
                start_date: {
                  $gt: e_date,
                },
                end_date: {
                  $gt: e_date,
                },
              },
            ],
          },
        ],
      });
      return res.status(200).json(cars);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCompanyVehicles: async (req: Request, res: Response) => {
    try {
      const vehicles = await carSchema.find({ user: req.user?.id });
      return res.status(200).json(vehicles);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  singleCar: async (req: Request, res: Response) => {
    try {
      const { cid } = req.params as { cid: string };
      const car = await carSchema.findById(cid);
      return res.status(200).json(car);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getHomeFormInitialData: async (req: Request, res: Response) => {
    try {
      const brand = await carSchema.distinct("brand");
      const model = await carSchema.distinct("model");
      return res.status(200).json({ brand, model });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  payCarRent: async (req: Request, res: Response) => {
    try {
      const { cid, start_date, end_date } = req.params as {
        cid: string;
        start_date: string;
        end_date: string;
      };

      const car = await carSchema.findById(cid).populate("user");
      if (!car) {
        return res.status(400).json({ msg: "Car not found." });
      }
      if (typeof car.user !== "object") {
        return res.status(400).json({ msg: "Try again later." });
      }
      let carUser = car.user as User;
      if (!carUser.stripe_account_id) {
        return res.status(400).json({ msg: "Car not found." });
      }
      const plateformfee = calculatePlaterformFee(car.price!);
      // Stripe-Products
      const stripeProduct = await stripe.products.create({
        name: `${car.brand} - ${car.model}`,
        images: [car.image!],
      });
      // Stripe-Price
      const stripePrice = await stripe.prices.create({
        unit_amount: usdToCents(car.price!),
        currency: "usd",
        product: stripeProduct.id,
      });
      // Stripe-session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        payment_intent_data: {
          application_fee_amount: usdToCents(plateformfee),
          transfer_data: {
            destination: carUser.stripe_account_id!,
          },
        },
        success_url: `${process.env.CHECKOUT_SUCCESS_URL}?cid=${car._id}&&start_date=${start_date}&&end_date=${end_date}`,
        cancel_url: `${process.env.CHECKOUT_CANCEL_URL}?cid=${car._id}`,
        mode: "payment",
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
      });
      // update current logged in user..
      await userSchema.findByIdAndUpdate(req.user?.id, {
        stripe_session_id: stripeSession.id,
      });
      console.log(car);
      return res.status(200).json(stripeSession.id);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  changeCarImage: async (req: Request, res: Response) => {
    const { carId } = req.body as {
      carId: string;
    };
    console.log("file---<", req.file);
    try {
      if (!req.file?.path) {
        return res.status(400).json({ msg: "Image is required." });
      }
      const image = await uploadImage(req.file?.path);
      await carSchema.findByIdAndUpdate(carId, {
        $set: {
          image: image.secure_url,
        },
      });
      return res.status(200).json(image.secure_url);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
