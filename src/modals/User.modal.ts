import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { ROLES } from "../utils/enums";

export const user = new Schema(
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
    stripe_account_id: String,
    stripe_session_id: String,
  },
  {
    timestamps: true,
  }
);

type UserType = InferSchemaType<typeof user>;
export type User = HydratedDocument<UserType>;
export const userSchema = model<User>("User", user);
