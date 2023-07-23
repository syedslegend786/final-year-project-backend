import { Schema, Document, Types, model } from "mongoose";
import { Car } from "./Cars.modal";
import { User } from "./User.modal";

export interface OrderDocument extends Document {
  car: Types.ObjectId | Car;
  booked_by: Types.ObjectId | User;
  company: Types.ObjectId | User;
  isRead: boolean;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    car: { type: Types.ObjectId, ref: "Car" },
    booked_by: { type: Types.ObjectId, ref: "User" },
    company: { type: Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model<OrderDocument>("Order", OrderSchema);
