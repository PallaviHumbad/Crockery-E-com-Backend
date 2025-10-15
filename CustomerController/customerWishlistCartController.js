// controllers/customerWishlistCart.controller.js
import CustomerWishlistCartModel from "../CustomerModels/CustmerOrderWishlistCartModel.js";
// Retrieve the complete document for a customer
export const getCustomerWishlistCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    })
      .populate("wishlistItems")
      .populate("cartItems");
    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Customer wishlist cart not found" });
    }
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Wishlist Operations ---

// Get only wishlist items
export const getWishlistItems = async (req, res) => {
  try {
    const { customerId } = req.params;
    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    }).populate("wishlistItems");
    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Wishlist not found for this customer" });
    }
    res.status(200).json(wishlistCart.wishlistItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a product to the wishlist
export const addItemToWishlist = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId } = req.body;
    let wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      // Create a new document if none exists
      wishlistCart = new CustomerWishlistCartModel({
        customer: customerId,
        wishlistItems: [productId],
      });
    } else {
      // Avoid duplicates
      if (!wishlistCart.wishlistItems.includes(productId)) {
        wishlistCart.wishlistItems.push(productId);
      }
    }

    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the entire wishlist items array
export const updateWishlistItems = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { wishlistItems } = req.body; // expects an array of product IDs
    let wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      wishlistCart = new CustomerWishlistCartModel({
        customer: customerId,
        wishlistItems,
      });
    } else {
      wishlistCart.wishlistItems = wishlistItems;
    }

    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a product from the wishlist
export const removeItemFromWishlist = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId } = req.body;
    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Wishlist not found for this customer" });
    }

    wishlistCart.wishlistItems.pull(productId);
    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Cart Operations ---

export const getCartItems = async (req, res) => {
  try {
    const { customerId } = req.params;

    // 1) Find the cart and populate only the product
    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    }).populate({
      path: "cartItems.product",
      model: "Product",
    });

    // 2) If not found, return 404
    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Cart not found for this customer" });
    }

    // 3) For each cartItem, find the variant in product.variants
    const updatedCartItems = wishlistCart.cartItems.map((item) => {
      // If there's a product with variants, find the one whose _id matches item.variant
      if (item.product && item.product.variants && item.variant) {
        const matchedVariant = item.product.variants.find(
          (v) => v._id.toString() === item.variant.toString()
        );

        // Return a plain JS object with the matched variant
        return {
          ...item.toObject(), // convert Mongoose doc to plain object
          variant: matchedVariant || null, // attach the matched variant (or null if not found)
        };
      }

      // If no matching variant or no product, return the item as-is
      return item.toObject();
    });

    // 4) Respond with the modified cartItems array
    res.status(200).json(updatedCartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a product to the cart
export const addItemToCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId, variantId, quantity } = req.body;

    let wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      wishlistCart = new CustomerWishlistCartModel({
        customer: customerId,
        cartItems: [{ product: productId, variant: variantId, quantity }],
      });
    } else {
      const existingItem = wishlistCart.cartItems.find(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        wishlistCart.cartItems.push({
          product: productId,
          variant: variantId,
          quantity,
        });
      }
    }

    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the entire cart items array
export const updateCartItems = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { cartItems } = req.body; // Expects an array of { product, variant, quantity }

    let wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      wishlistCart = new CustomerWishlistCartModel({
        customer: customerId,
        cartItems,
      });
    } else {
      wishlistCart.cartItems = cartItems;
    }

    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a product from the cart
export const removeItemFromCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId, variantId } = req.body;

    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Cart not found for this customer" });
    }

    wishlistCart.cartItems = wishlistCart.cartItems.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variant.toString() === variantId
        )
    );

    await wishlistCart.save();
    res.status(200).json(wishlistCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear all cart items for a customer
export const clearCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    const wishlistCart = await CustomerWishlistCartModel.findOne({
      customer: customerId,
    });

    if (!wishlistCart) {
      return res
        .status(404)
        .json({ message: "Cart not found for this customer" });
    }

    // Clear the cartItems array
    wishlistCart.cartItems = [];
    await wishlistCart.save();

    res
      .status(200)
      .json({ message: "Cart cleared successfully", wishlistCart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
};
