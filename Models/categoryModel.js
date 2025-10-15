// Models/categoryModel.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
