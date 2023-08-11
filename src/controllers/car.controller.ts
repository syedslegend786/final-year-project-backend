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
  city: string
  page: number,
  limit: number
};
export const carController = {
  create: async (req: Request, res: Response) => {
    try {
      if (!req.file?.path) {
        return res.status(400).json({ msg: "Image is required." });
      }
      const dbUser = await userSchema.findById(req.user?._id)
      if (!dbUser?.city) {
        return res.status(400).json({ msg: "Kindly complete you company profile." });
      }
      const image = await uploadImage(req.file?.path);
      const body = { ...req.body, user: req.user?._id, image: image.secure_url };

      await carSchema.create({ ...body, city: dbUser.city });
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
      const { brand, end_date, model, start_date, city, limit, page } =
        req.body as getVehiclesApiProps;
      const s_date = new Date(start_date);
      const e_date = new Date(end_date);
      
      let _limit = limit || 6
      let _page = page || 1

      const skip = (page - 1) * limit

      const cars = await carSchema.find({
        city: city,
        brand: brand,
        model: model,
        $or: [
          { start_date: { $exists: false }, end_date: { $exists: false } },
          { start_date: { $gt: s_date }, end_date: { $gt: e_date } },
          { start_date: { $lt: e_date }, end_date: { $lt: e_date } },
        ]
      }, {}, { limit: _limit, skip: skip })
      const total = await carSchema.count({
        city: city,
        brand: brand,
        model: model,
        $or: [
          { start_date: { $exists: false }, end_date: { $exists: false } },
          { start_date: { $gt: s_date }, end_date: { $gt: e_date } },
          { start_date: { $lt: e_date }, end_date: { $lt: e_date } },
        ]
      })
     
      return res.status(200).json({ cars, total });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCompanyVehicles: async (req: Request, res: Response) => {
    try {
      let { limit, page } = req.body as {
        page: number
        limit: number
      }
      limit = limit || 6
      page = page || 1
      const skip = (page - 1) * limit
      const vehicles = await carSchema.find({ user: req.user?._id }, {}, { limit, skip });
      const total = await carSchema.count({ user: req.user?._id })
      return res.status(200).json({ vehicles, total });
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
      await userSchema.findByIdAndUpdate(req.user?._id, {
        stripe_session_id: stripeSession.id,
      });
    
      return res.status(200).json(stripeSession.id);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  changeCarImage: async (req: Request, res: Response) => {
    const { carId } = req.body as {
      carId: string;
    };
   
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
