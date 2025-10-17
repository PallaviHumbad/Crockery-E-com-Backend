import express from "express";
import {
  createAdmin,
  loginAdmin,
  updateAdmin,
  getCurrentAdmin,
  Adminlogout,
} from "../Controller/AdminController.js";
import { otpController, verifyOtp } from "../Controller/otpController.js";
import adminAuth from "../Middleware/adminAuth.js";

const router = express.Router();

router.post("/create", createAdmin); // Create Admin
router.post("/adminlogin", loginAdmin); // Get All Admins
router.put("/:id", updateAdmin); // Update Admin

//otp routes
router.post("/send-otp", otpController);
router.post("/verify-otp", verifyOtp);

router.get("/me", getCurrentAdmin);
router.post("/logout", Adminlogout);

export default router;
