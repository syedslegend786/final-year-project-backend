import { Router } from "express";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { carController } from "../controllers/car.controller";
import multer from "../lib/multer";
import cloudinary from "../lib/cloudinary";
const router = Router();

router.post(
  "/car",
  requireSignInMiddleware,
  multer.single("image"),
  carController.create
);
//
router.patch("/update/car/:id", requireSignInMiddleware, carController.update);
router.post(
  "/update/car/image",
  requireSignInMiddleware,
  multer.single("image"),
  carController.changeCarImage
);
//
router.get("/cars", carController.getCars);
router.get("/car/:cid", carController.singleCar);

router.get(
  "/company-vehicles",
  requireSignInMiddleware,
  carController.getCompanyVehicles
);

router.get("/home/initial-data", carController.getHomeFormInitialData);

router.post(
  "/create-checkout/:cid/:start_date/:end_date",
  requireSignInMiddleware,
  carController.payCarRent
);
export default router;
