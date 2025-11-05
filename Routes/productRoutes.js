import express from "express";
import {
  createProduct,
  getAllProducts,
  getActiveProducts,
  getBestSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleBestSeller,
  toggleHideProduct,
} from "../Controller/productController.js";

const router = express.Router();

// CRUD routes
router.post("/createproduct", createProduct);
router.get("/getallproducts", getAllProducts);
router.get("/getactiveproducts", getActiveProducts);
router.get("/getbestsellerproducts", getBestSellerProducts);
router.get("/getproductbyid/:id", getProductById);
router.put("/updateproduct/:id", updateProduct);
router.delete("/deleteproduct/:id", deleteProduct);

// Status toggle routes
router.patch("/togglestatus/:id", toggleProductStatus);
router.patch("/togglebestseller/:id", toggleBestSeller);
router.patch("/togglehide/:id", toggleHideProduct);

export default router;
