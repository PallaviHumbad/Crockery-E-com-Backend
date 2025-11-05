import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    productImages: [
      {
        type: String,
        required: true,
      },
    ],
    // Reference to Category and SubCategory
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // New fields
    isActive: {
      type: Boolean,
      default: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    hideProduct: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware to limit bestSeller products to 10
productSchema.pre("save", async function (next) {
  if (this.bestSeller && this.isModified("bestSeller")) {
    const bestSellerCount = await mongoose
      .model("Product")
      .countDocuments({ bestSeller: true, _id: { $ne: this._id } });

    if (bestSellerCount >= 10) {
      const error = new Error("Cannot have more than 10 best seller products");
      return next(error);
    }
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
