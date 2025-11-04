import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../Controller/productController.js";

const router = express.Router();

// CRUD routes
router.post("/createproduct", createProduct);
router.get("/getallproducts", getAllProducts);
router.get("/getproductbyid/:id", getProductById);
router.put("/updateproduct/:id", updateProduct);
router.delete("/deleteproduct/:id", deleteProduct);

export default router;
