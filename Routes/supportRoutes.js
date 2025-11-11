import express from "express";
import {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  getSupportTicketsByCustomer,
  updateSupportTicket,
  changeSupportTicketStatus,
  deleteSupportTicket,
} from "../Controller/SupportController.js";
import adminAuth from "../Middleware/adminAuth.js";
import authenticate from "../Middleware/authenticate.js";

const router = express.Router();

// Public/Customer routes
router.post("/", authenticate, createSupportTicket);
router.get("/customer/:customerId", authenticate, getSupportTicketsByCustomer);

// Admin routes
router.get("/", adminAuth, getAllSupportTickets);
router.get("/:id", adminAuth, getSupportTicketById);
router.put("/:id", adminAuth, updateSupportTicket);
router.patch("/:id/status", adminAuth, changeSupportTicketStatus);
router.delete("/:id", adminAuth, deleteSupportTicket);

export default router;
