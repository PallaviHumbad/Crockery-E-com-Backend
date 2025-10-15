import CustomerWishlistCartModel from "../CustomerModels/CustmerOrderWishlistCartModel.js";

// 1. Fetch all customers with either cart or wishlist items
export const getCustomersWithCartAndWishlist = async (req, res) => {
  try {
    const customers = await CustomerWishlistCartModel.find({
      $or: [{ wishlistItems: { $ne: [] } }, { cartItems: { $ne: [] } }],
    })
      .populate("customer") // populate customer details
      .populate("wishlistItems") // populate wishlist product details
      .populate("cartItems.product") // populate product details in cart items
      .populate("cartItems.variant"); // populate variant details in cart items

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch customers who have added wishlist products
export const getCustomersWithWishlist = async (req, res) => {
  try {
    const customers = await CustomerWishlistCartModel.find({
      wishlistItems: { $ne: [] },
    })
      .populate("customer") // populate customer details
      .populate("wishlistItems"); // populate wishlist product details

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Fetch customers who have added cart items
export const getCustomersWithCart = async (req, res) => {
  try {
    const customers = await CustomerWishlistCartModel.find({
      cartItems: { $ne: [] },
    })
      .populate("customer") // populate customer details
      .populate("cartItems.product") // populate product details in cart items
      .populate("cartItems.variant"); // populate variant details in cart items

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
