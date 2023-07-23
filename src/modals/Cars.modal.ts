import mongoose, {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
} from "mongoose";

const car = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    seats: Number,
    price: Number,
    ratings: Number,
    start_date: Date,
    end_date: Date,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    image: String,
    booked_by: { type: mongoose.Types.ObjectId, ref: "User", require: false },
  },
  {
    timestamps: true,
  }
);

type CarType = InferSchemaType<typeof car>;

export type Car = HydratedDocument<CarType>;
export const carSchema = model<Car>("Car", car);
