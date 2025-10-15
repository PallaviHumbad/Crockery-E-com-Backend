import express from "express";
import database from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./Routes/AdminRoutes.js";
import customerRoute from "./Routes/customerRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import otpRoutes from "./Routes/customerOtpRoutes.js";
import customerOrderRouter from "./Routes/customerOrderRoutes.js";
import CategoryRouter from "./Routes/categoryRoutes.js";
import customerCartWishlistRoutes from "./CustomerRoutes/customerWishlistCartRoutes.js";
import distributorRoutes from "./CustomerRoutes/distributorRoutes.js";
import inquiryRoutes from "./CustomerRoutes/customerInquiryRoutes.js";
import adminCustomerRoutes from "./Routes/adminCustomerRoutes.js";
import razorpayRoutes from "./Routes/razorpayRoutes.js";

dotenv.config();
database();

const app = express();
const allowedOrigins = [
  // "https://mahendra-ke-namkeen-six.vercel.app",
  "https://mnk-2025.vercel.app",
  "https://sprightly-baklava-2d3c9b.netlify.app",
  "http://localhost:5173"
];

// Increase payload size limit
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    // origin: ["http://localhost:3000", "http://localhost:5173", "https://mahendra-ke-namkeen-six.vercel.app", "https://sprightly-baklava-2d3c9b.netlify.app"],
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoute);
// Routes
app.use("/api/products", productRoutes);
app.use("/api/customer-orders", customerOrderRouter);
app.use("/api/category", CategoryRouter);
// Use the admin routes under the /api/admin prefix
app.use("/api/admin", adminCustomerRoutes);
//customer otp send/recirve
app.use("/api/customer-otp", otpRoutes);
app.use("/api/customercartwishlist", customerCartWishlistRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/razorpay", razorpayRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App is listening at ${process.env.PORT}`);
});

export default app;
