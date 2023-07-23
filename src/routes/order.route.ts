import { Router } from "express";
import { requireSignInMiddleware } from "../middleware/auth.middleware";
import { OrderController } from "../controllers/order.controller";

const router = Router();

router.post("/order", requireSignInMiddleware, OrderController.create);
router.get(
  "/orders",
  requireSignInMiddleware,
  OrderController.getCompanyOrders
);

router.get(
  "/orders-listing",
  requireSignInMiddleware,
  OrderController.getCompanyOrdersList
);

router.post("/mark-order-read", OrderController.markReadOrders);

router.get(
  "/order-history",
  requireSignInMiddleware,
  OrderController.getOrderHistory
);
export default router;
