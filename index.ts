import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./src/routes/index";
const app = express();

app.use(
  cors({ origin: process.env.FRONT_END_APP_URL as string, credentials: true })
);

app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json("Hello world");
});

routes.forEach((route) => {
  app.use(route);
});
mongoose.connect("mongodb://0.0.0.0:27017/passportjs").then(() => {
  console.log("DB Connected successfully!");
});
app.listen(process.env.PORT || 5000, () => {
  console.log(`server is running at port http://localhost:5000`);
});
