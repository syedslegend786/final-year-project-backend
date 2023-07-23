import { Router } from "express";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { onboardingController } from "../controllers/onboarding.controller";

const router = Router();

router.post(
  "/make-instructor",
  requireSignInMiddleware,
  onboardingController.makeInstructor
);
router.post(
  "/verify-instructor",
  requireSignInMiddleware,
  onboardingController.verifyInstructor
);

export default router;
