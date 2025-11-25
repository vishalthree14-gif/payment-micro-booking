import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-booking-nine.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Payment Service is running", timestamp: new Date() });
});

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();
    console.log("Payment service connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting payment service:", err);
    process.exit(1);
  }
};

startServer();
