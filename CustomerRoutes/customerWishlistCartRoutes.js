// routes/customerWishlistCart.routes.js
import express from "express";
import {
  getCustomerWishlistCart,
  getWishlistItems,
  addItemToWishlist,
  updateWishlistItems,
  removeItemFromWishlist,
  getCartItems,
  addItemToCart,
  updateCartItems,
  removeItemFromCart,
  clearCart,
} from "../CustomerController/customerWishlistCartController.js";

const router = express.Router();

// Full document retrieval
router.get("/:customerId", getCustomerWishlistCart);

// --- Wishlist Routes ---
router.get("/getItemwishlist/:customerId", getWishlistItems);
router.post("/addItemwishlist/:customerId", addItemToWishlist);
router.put("/updateItemwishlist/:customerId", updateWishlistItems);
router.delete("/removeItemwishlist/:customerId", removeItemFromWishlist);

// --- Cart Routes ---
router.get("/getItemcart/:customerId", getCartItems);
router.post("/additemcart/:customerId", addItemToCart);
router.put("/updatecart/:customerId", updateCartItems);
router.delete("/removeItemcart/:customerId", removeItemFromCart);
router.delete("/clearcart/:customerId", clearCart);

export default router;
