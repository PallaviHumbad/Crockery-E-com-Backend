import express from "express";
import {
  createUserPanel,
  getAllUserPanels,
  getUserPanelById,
  updateUserPanel,
  toggleUserPanelStatus,
  deleteUserPanel,
} from "../Controller/UserPanelController.js";
import adminAuth from "../Middleware/adminAuth.js";

const router = express.Router();

// All routes require admin authentication
router.post("/", createUserPanel);
router.get("/", getAllUserPanels);
router.get("/:id", getUserPanelById);
router.put("/:id", updateUserPanel);
router.patch("/:id/status", toggleUserPanelStatus);
router.delete("/:id", deleteUserPanel);

export default router;
