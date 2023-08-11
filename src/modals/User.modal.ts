import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { ROLES } from "../utils/enums";
export interface User {
  username: string
  email: string
  password: string
  role: ROLES[]
  otp: string
  reset_token: string
  mobile_number: string
  id_card_front: string
  id_card_back: string
  license: string
  security_fee: number
  stripe_account_id: string
  stripe_session_id: string,
  verified: boolean,
  city: string
  lat: number
  long: number
}
export const user = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    password: String,
    role: {
      type: [String],
      default: [ROLES.USER],
    },
    otp: {
      type: String,
      default: ""
    },
    mobile_number: {
      type: String,
      default: ''
    },
    reset_token: { type: String, default: "" },
    id_card_back: {
      type: String,
      default: ""
    },
    id_card_front: {
      type: String,
      default: ""
    },
    license: {
      type: String,
      default: ""
    },
    security_fee: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    stripe_account_id: String,
    stripe_session_id: String,
    city: {
      type: String,
      default: ""
    },
    lat: {
      type: Number,
      default: 0
    },
    long: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);


export const userSchema = model<User>("User", user);
