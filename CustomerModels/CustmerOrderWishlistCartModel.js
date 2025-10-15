import mongoose from "mongoose";
// import Product from "../Models/Product";

const CustomerWishlistCartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    wishlistItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const CustomerWishlistCartModel = mongoose.model(
  "CustomerWishlistCart",
  CustomerWishlistCartSchema
);

export default CustomerWishlistCartModel;
