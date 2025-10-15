import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // Basic Product Details
    productName: { type: String, required: true },
    // price: { type: Number, required: true },
    description: { type: String },

    // Status Flags
    status: { type: Boolean, default: true, required: true },
    hideFromShop: { type: Boolean, default: false, required: true },

    // top sellers
    top_seller: {
      type: Boolean,
      default: false,
    },

    // Product Variants
    variants: [
      {
        weight: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    // Product Images
    images: [{ type: String, required: true }],

    // Categories
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    // Single Attribute Object for the Product
    // attribute: {
    //   percent_badge: {
    //     type: Number,
    //     // required: true,
    //   },
    //   text_badge: {
    //     type: String,
    //     required: true,
    //   },
    //   description_tab: {
    //     type: String,
    //     required: true,
    //   },
    //   additional_info_tab: {
    //     type: String,
    //     // required: true,
    //   },
    //   HSN_no: {
    //     type: Number,
    //     required: true,
    //     unique: true,
    //   },
    //   image: { type: String, required: true },
    // },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
