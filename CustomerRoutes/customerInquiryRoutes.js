import express from "express";
import {
  createInquiry,
  getAllInquiries,
} from "../CustomerController/customeriInquiryController.js";

const router = express.Router();

// Create a new inquiry
router.post("/createinquiry", createInquiry);

// Get all inquiries
router.get("/getallinquiries", getAllInquiries);

export default router;
