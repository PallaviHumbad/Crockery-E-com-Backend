import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controller/categoryControl.js";

const router = express.Router();

// CRUD Routes
router.post("/createcategory", createCategory); // Create
router.get("/getallcategories", getAllCategories); // Read All
router.get("/getcategory/:id", getCategoryById); // Read Single
router.put("/updatecategory/:id", updateCategory); // Update
router.delete("/deletecategory/:id", deleteCategory); // Delete

export default router;
