import crypto from "crypto";
import razorpayInstance from "../utils/razorpay.js";
import Payment from "../models/Payment.js";

/* ---------------------------------------
   CREATE RAZORPAY ORDER
-----------------------------------------*/
export const createOrder = async (req, res) => {
  try {
    const { amount, bookingId, userId } = req.body;

    if (!amount || !bookingId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "Amount, bookingId, and userId are required"
      });
    }

    // Create order on Razorpay
    // Generate short receipt ID (max 40 chars for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortBookingId = bookingId.slice(-12); // Last 12 chars of booking ID

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `rcpt_${shortBookingId}_${timestamp}`, // Format: rcpt_bookingId_timestamp (max 40 chars)
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Save payment record in database
    const payment = await Payment.create({
      orderId: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      bookingId,
      userId,
      amount,
      currency: "INR",
      status: "created",
    });

    return res.status(201).json({
      success: true,
      order: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
      },
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* ---------------------------------------
   VERIFY PAYMENT SIGNATURE
-----------------------------------------*/
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        msg: "Missing payment verification data"
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed" }
      );

      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }

    // Update payment record with successful payment details
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "success",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Payment verified successfully",
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: payment.status,
      },
    });

  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* ---------------------------------------
   GET PAYMENT STATUS
-----------------------------------------*/
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    });

  } catch (err) {
    console.error("Get Payment Status Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* ---------------------------------------
   GET PAYMENT BY BOOKING ID
-----------------------------------------*/
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found for this booking"
      });
    }

    return res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    });

  } catch (err) {
    console.error("Get Payment By Booking Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
