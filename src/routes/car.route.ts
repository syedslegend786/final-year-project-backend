import { Router } from "express";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { carController } from "../controllers/car.controller";
import multer from "../lib/multer";
import cloudinary from "../lib/cloudinary";
import { carSchema } from "../modals/Cars.modal";
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
router.post("/cars/listings", carController.getCars);
router.get("/car/:cid", carController.singleCar);

router.post(
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
router.delete("/delete/car/:id", async (req, res) => {
  try {
    const { id } = req.params
    await carSchema.findByIdAndDelete(id)
    return res.status(200).json({ msg: "success" });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message })
  }
})
export default router;
