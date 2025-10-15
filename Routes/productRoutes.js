import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  updateMultipleProductsStatus,
  updateProductField,
  getAllShowedProducts,
} from "../Controller/productController.js";

const router = express.Router();

// CRUD Routes
router.post("/createproduct", createProduct); // Create a new product
router.get("/getallproduct", getAllProducts); // Get all products
router.get("/getproductbyid/:id", getProduct); // Get single product by ID
router.put("/updateproduct/:id", updateProduct); // Update product by ID
router.delete("/deleteproduct/:id", deleteProduct); // Delete product by ID
router.get("/hidden-products", getAllShowedProducts);

router.delete("/", deleteMultipleProducts); // DELETE request expecting an array of IDs in the body
router.put("/", updateMultipleProductsStatus); // PUT request expecting { ids: [...], status: true/false }
router.patch("/:id/updateField", updateProductField);

export default router;
