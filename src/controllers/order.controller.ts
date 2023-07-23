import { Request, Response } from "express";
import { OrderModel } from "../modals/Orders.model";
import { Types } from "mongoose";
export const OrderController = {
  create: async (req: Request, res: Response) => {
    try {
      const body = req.body;
      await OrderModel.create(body);
      return res.status(200).json({ msg: "okay" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCompanyOrders: async (req: Request, res: Response) => {
    try {
      console.log("req.user==>", req.user);
      const orders = await OrderModel.find({
        company: req.user?.id,
        isRead: false,
      }).populate("car booked_by");
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCompanyOrdersList: async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find({
        company: req.user?.id,
      })
        .populate("car booked_by")
        .sort("isRead");
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  markReadOrders: async (req: Request, res: Response) => {
    const { oid } = req.body as { oid: string };
    try {
      await OrderModel.findByIdAndUpdate(oid, {
        isRead: true,
      });
      return res.status(200).json({ msg: "success" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getOrderHistory: async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find({
        booked_by: req.user?.id,
      }).populate("car booked_by");
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
