import express from "express";
import {
  getCustomersWithCartAndWishlist,
  getCustomersWithWishlist,
  getCustomersWithCart,
} from "../Controller/adminCustomerController.js";

const router = express.Router();

// Route 1: All customers with either wishlist or cart items
router.get("/customers", getCustomersWithCartAndWishlist);

// Route 2: Customers who have added wishlist products
router.get("/customers/wishlist", getCustomersWithWishlist);

// Route 3: Customers who have added cart items
router.get("/customers/cart", getCustomersWithCart);

export default router;
