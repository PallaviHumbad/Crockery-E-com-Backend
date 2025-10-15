// Controller/categoryController.js
import CategoryModel from "../Models/categoryModel.js";

const categoryController = {
  // CREATE
  createCategory: async (req, res) => {
    try {
      const { categoryName, description, status } = req.body;

      const category = new CategoryModel({
        categoryName,
        description,
        status: status !== undefined ? status : true,
      });

      const savedCategory = await category.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await CategoryModel.find();

      if (!categories || categories.length === 0) {
        return res.status(404).json({ message: "No categories found." });
      }

      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const category = await CategoryModel.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category by ID:", error.message);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  // UPDATE
  updateCategory: async (req, res) => {
    try {
      const { categoryName, description, status } = req.body;

      const updateData = {};
      if (categoryName) updateData.categoryName = categoryName;
      if (description) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DELETE
  deleteCategory: async (req, res) => {
    try {
      const category = await CategoryModel.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default categoryController;
