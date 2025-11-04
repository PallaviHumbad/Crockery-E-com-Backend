import Product from "../Models/productModel.js";
import Category from "../Models/Category.js";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      originalPrice,
      discountPrice,
      productImages,
      categoryId,
      subCategoryId,
    } = req.body;

    if (
      !productName ||
      !description ||
      !originalPrice ||
      !discountPrice ||
      !productImages ||
      !categoryId ||
      !subCategoryId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find category
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Find subcategory inside category
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    const product = new Product({
      productName,
      description,
      originalPrice,
      discountPrice,
      productImages,
      category: categoryId,
      subCategoryId,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Products
export const getAllProducts = async (req, res) => {
  try {
    // Populate category and match subCategoryId manually
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Product by ID (with Category + SubCategory info)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Attach full subCategory info
    const category = await Category.findById(product.category);
    const subCategory = category?.subCategories.id(product.subCategoryId);

    res.status(200).json({
      ...product.toObject(),
      subCategory: subCategory || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      originalPrice,
      discountPrice,
      productImages,
      categoryId,
      subCategoryId,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.status(404).json({ message: "SubCategory not found" });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        description,
        originalPrice,
        discountPrice,
        productImages,
        category: categoryId,
        subCategoryId,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
