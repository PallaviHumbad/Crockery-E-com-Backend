import Product from "../Models/productModel.js";
import cloudinary from "../config/cloudinary.js"; // Adjust path to your Cloudinary config file
import CategoryModel from "../Models/categoryModel.js";

// Helper function to upload an image to Cloudinary
const uploadImageToCloudinary = async (image) => {
  try {
    // Assuming image is a base64 string or buffer; adjust based on your frontend
    const result = await cloudinary.uploader.upload(image, {
      folder: "products", // Optional: organize images in a folder
      use_filename: true,
      unique_filename: false,
    });
    return result.secure_url; // Return the secure URL from Cloudinary
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      status,
      hideFromShop,
      top_seller, // boolean value from req.body
      variants,
      images, // Array of base64 strings or file buffers
      categories,
    } = req.body;

    // Explicit validation for required fields
    if (!productName)
      return res.status(400).json({ message: "Product name is required" });
    if (!images || !Array.isArray(images) || images.length === 0)
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    if (!categories || !Array.isArray(categories) || categories.length === 0)
      return res
        .status(400)
        .json({ message: "At least one category is required" });
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one variant is required" });
    }
    for (const variant of variants) {
      if (!variant.weight || !variant.price) {
        return res
          .status(400)
          .json({ message: "Each variant must have weight and price" });
      }
    }

    // Check maximum top_seller products if top_seller is true
    if (top_seller === true) {
      const topSellerCount = await Product.countDocuments({ top_seller: true });
    }

    // Upload images to Cloudinary
    const uploadedImageUrls = await Promise.all(
      images.map(uploadImageToCloudinary)
    );

    // Create a new product. Note: product-level price and attribute are removed.
    const newProduct = new Product({
      productName,
      description,
      status: status ?? true,
      hideFromShop: hideFromShop ?? false,
      top_seller: top_seller ?? false,
      // Append a space between weight value and unit for each variant
      variants: variants.map((v) => ({
        weight: `${v.weightValue} ${v.weightUnit}`,
        price: parseFloat(v.price) || 0,
      })),
      images: uploadedImageUrls,
      categories,
    });

    // Save to database
    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (includes the top_seller field by default)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categories", "name").exec();
    res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "categories",
        model: CategoryModel,
        select: "categoryName _id",
      })
      .exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      status,
      hideFromShop,
      top_seller,
      variants,
      images,
      categories,
    } = req.body;

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Top seller logic
    if (top_seller !== undefined) {
      if (top_seller === true && product.top_seller !== true) {
        const topSellerCount = await Product.countDocuments({
          top_seller: true,
        });
        if (topSellerCount >= 4) {
          return res
            .status(400)
            .json({ message: "Maximum of 4 top seller products allowed" });
        }
      }
      product.top_seller = top_seller;
    }

    // Upload new images to Cloudinary if provided
    let uploadedImageUrls = product.images;
    if (images && images.length > 0) {
      uploadedImageUrls = await Promise.all(
        images.map((image) => uploadImageToCloudinary(image))
      );
      product.images = uploadedImageUrls;
    }

    // Update fields only if provided in the request body
    if (productName) product.productName = productName;
    if (description !== undefined) product.description = description;
    if (status !== undefined) product.status = status;
    if (hideFromShop !== undefined) product.hideFromShop = hideFromShop;
    if (categories) product.categories = categories;
    if (variants) {
      product.variants = variants.map((v) => ({
        weight: v.weight, // Use the combined weight string directly
        price: parseFloat(v.price) || 0,
      }));
    }

    // Save the updated product
    const updatedProduct = await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((url) =>
          cloudinary.uploader.destroy(url.split("/").pop().split(".")[0])
        )
      );
    }

    // Delete product
    await Product.deleteOne({ _id: id });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};

// Multiple Delete Products
export const deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body; // expecting { ids: ["id1", "id2", ...] }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }
    const deleteResult = await Product.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      message: `${deleteResult.deletedCount} products deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Multiple Edit: Update Product Status
export const updateMultipleProductsStatus = async (req, res) => {
  try {
    const { ids, status } = req.body; // expecting { ids: ["id1", "id2", ...], status: true/false }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }
    if (status === undefined) {
      return res.status(400).json({ message: "Status value is required" });
    }
    const updateResult = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.status(200).json({
      message: `${updateResult.modifiedCount} products updated successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductField = async (req, res) => {
  try {
    const { field, value } = req.body;
    const { id } = req.params;

    console.log(field, value, id);
    // Validate field if needed (e.g., ensure only allowed toggle fields are updated)
    const allowedFields = ["status", "top_seller", "hideFromShop"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Field not allowed to update" });
    }
    const update = {};
    update[field] = value;
    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllShowedProducts = async (req, res) => {
  try {
    const hiddenProducts = await Product.find({ hideFromShop: false })
      .populate("categories", "name") // Adjust populate fields as needed
      .exec();

    res.status(200).json({
      message: "Hidden products retrieved successfully",
      products: hiddenProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
