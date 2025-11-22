import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getPaymentByBooking,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment signature
router.post("/verify", verifyPayment);

// Get payment status by order ID
router.get("/status/:orderId", getPaymentStatus);

// Get payment by booking ID
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
