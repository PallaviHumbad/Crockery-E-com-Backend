import express from "express";
const CategoryRouter = express.Router();
import categoryController from "../Controller/categoryController.js";

// CRUD Routes
CategoryRouter.post("/categories", categoryController.createCategory);
CategoryRouter.get("/getAllcategories", categoryController.getAllCategories);
CategoryRouter.get(
  "/getByIdcategories/:id",
  categoryController.getCategoryById
);
CategoryRouter.patch("/categories/:id", categoryController.updateCategory);
CategoryRouter.delete("/categories/:id", categoryController.deleteCategory);

export default CategoryRouter;
