import Customer from "../Models/CustomerModel.js";
import CustomerOrder from "../Models/customerOrderModel.js";
import Product from "../Models/productModel.js";
import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    console.log(orderData);
    // Get the last order to determine the next invoice number
    const lastOrder = await CustomerOrder.findOne().sort({ createdAt: -1 });
    let newInvoiceNumber = "MKNIND1"; // Default if no orders exist

    if (lastOrder && lastOrder.invoiceDetails[0]?.invoiceNo) {
      const lastInvoiceNo = lastOrder.invoiceDetails[0].invoiceNo; // e.g., "MKNIND1"
      const numberPart = parseInt(lastInvoiceNo.replace("MKNIND", "")); // Extract the number (e.g., 1)
      newInvoiceNumber = `MKNIND${numberPart + 1}`; // Increment and add prefix (e.g., "MKNIND2")
    }

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Add invoice details to orderData
    orderData.invoiceDetails = [
      {
        invoiceNo: newInvoiceNumber,
        invoiceDate: currentDate,
      },
    ];
    orderData.orderNote = orderData.orderNote || "";
    orderData.discount = orderData.discount || "0";
    const newOrder = new CustomerOrder(orderData);
    const savedOrder = await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", data: savedOrder });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const createOrderByCustomer = async (req, res) => {
  try {
    const orderData = req.body;
    console.log("Received orderData:", orderData);

    // Get the last order to determine the next invoice number
    const lastOrder = await CustomerOrder.findOne().sort({ createdAt: -1 });
    let newInvoiceNumber = "MKNIND1"; // Default if no orders exist

    if (lastOrder && lastOrder.invoiceDetails[0]?.invoiceNo) {
      const lastInvoiceNo = lastOrder.invoiceDetails[0].invoiceNo; // e.g., "MKNIND1"
      const numberPart = parseInt(lastInvoiceNo.replace("MKNIND", "")) || 0; // Extract number, default to 0 if NaN
      newInvoiceNumber = `MKNIND${numberPart + 1}`; // Increment
    }

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Add invoice details to orderData
    orderData.invoiceDetails = [
      {
        invoiceNo: newInvoiceNumber,
        invoiceDate: currentDate,
      },
    ];

    // Ensure optional fields are set if not provided (though frontend now sends them)
    orderData.ordernote = orderData.ordernote || ""; // Corrected from orderNote
    orderData.discount = orderData.discount || "0";
    orderData.orderStatus = orderData.orderStatus || "Pending";
    orderData.paymentStatus = orderData.paymentStatus || "Pending";
    orderData.additionalCharges = orderData.additionalCharges || [
      { packagingCharge: "0", shippingCharge: "0" },
    ];

    console.log("Attempting to save order:", orderData);
    const newOrder = new CustomerOrder(orderData);
    const savedOrder = await newOrder.save();
    console.log("Order saved successfully:", savedOrder);

    res
      .status(201)
      .json({ message: "Order created successfully", data: savedOrder });
  } catch (error) {
    console.error("Error saving order:", error);
    res
      .status(400)
      .json({ message: "Error creating order", error: error.message });
  }
};
// Get all orders with filters
export const getAllOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, customerId } = req.query;
    const query = {};
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId) query.customer = customerId;

    const orders = await CustomerOrder.find(query)
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email phone addresses",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName price variants images",
      });

    const processedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        // Populate billing and shipping addresses
        const customerDoc = await Customer.findById(order.customer._id);
        if (customerDoc && customerDoc.addresses) {
          const billingId = new mongoose.Types.ObjectId(order.billingAddress);
          orderObj.billingAddress =
            customerDoc.addresses.find((addr) => addr._id.equals(billingId)) ||
            null;

          const shippingId = new mongoose.Types.ObjectId(order.shippingAddress);
          orderObj.shippingAddress =
            customerDoc.addresses.find((addr) => addr._id.equals(shippingId)) ||
            null;
        } else {
          orderObj.billingAddress = null;
          orderObj.shippingAddress = null;
        }

        // Process products and ensure no null product references
        orderObj.products = orderObj.products.map((prod) => {
          if (!prod.product) {
            // Product not found in population
            prod.product = { error: "Product not found in database" };
            prod.variant = null;
          } else if (prod.product.variants && prod.variant) {
            const variantId = new mongoose.Types.ObjectId(prod.variant);
            const variantDetails = prod.product.variants.find((varItem) =>
              varItem._id.equals(variantId)
            );
            prod.variant = variantDetails || { error: "Variant not found" };
          } else {
            prod.variant = null; // No variants available
          }
          return prod;
        });

        return orderObj;
      })
    );

    // Filter out orders with invalid products (optional)
    const validOrders = processedOrders.filter((order) =>
      order.products.every((prod) => !prod.product.error)
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: validOrders, // or processedOrders if you want to include invalid ones
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};
// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    // Fetch the order by ID and populate customer and product details
    const order = await CustomerOrder.findById(req.params.id)
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses phone", // Include addresses for manual processing
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName price variants images", // Include variants for manual processing
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Convert the order to a plain JavaScript object for easier manipulation
    const orderObj = order.toObject();

    // Manually populate billingAddress and shippingAddress from customer's addresses array
    if (order.customer && order.customer.addresses) {
      const billingId = new mongoose.Types.ObjectId(order.billingAddress);
      orderObj.billingAddress = order.customer.addresses.find((addr) =>
        addr._id.equals(billingId)
      ) || { error: "Billing address not found" };

      const shippingId = new mongoose.Types.ObjectId(order.shippingAddress);
      orderObj.shippingAddress = order.customer.addresses.find((addr) =>
        addr._id.equals(shippingId)
      ) || { error: "Shipping address not found" };
    } else {
      orderObj.billingAddress = { error: "Customer addresses not available" };
      orderObj.shippingAddress = { error: "Customer addresses not available" };
    }

    // Manually process products and ensure no null product references
    orderObj.products = orderObj.products.map((prod) => {
      if (!prod.product) {
        // Product not found in population
        prod.product = { error: "Product not found in database" };
        prod.variant = null;
      } else if (prod.product.variants && prod.variant) {
        const variantId = new mongoose.Types.ObjectId(prod.variant);
        const variantDetails = prod.product.variants.find((varItem) =>
          varItem._id.equals(variantId)
        );
        prod.variant = variantDetails || { error: "Variant not found" };
      } else {
        prod.variant = { error: "No variants available for this product" };
      }
      return prod;
    });

    // Return the fully processed order object
    res.status(200).json({
      message: "Order retrieved successfully",
      data: orderObj,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    res.status(500).json({
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

// Get all orders by customer ID
export const getOrdersByCustomerId = async (req, res) => {
  try {
    const { id } = req.params; // Get customer ID from URL params

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Fetch all orders for the customer with population
    const orders = await CustomerOrder.find({ customer: id })
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses phone",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName price variants images",
      });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer" });
    }

    // Process orders similar to getAllOrders and getOrderById
    const processedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        // Populate billing and shipping addresses
        const customerDoc = await Customer.findById(order.customer._id);
        if (customerDoc && customerDoc.addresses) {
          const billingId = new mongoose.Types.ObjectId(order.billingAddress);
          orderObj.billingAddress = customerDoc.addresses.find((addr) =>
            addr._id.equals(billingId)
          ) || { error: "Billing address not found" };

          const shippingId = new mongoose.Types.ObjectId(order.shippingAddress);
          orderObj.shippingAddress = customerDoc.addresses.find((addr) =>
            addr._id.equals(shippingId)
          ) || { error: "Shipping address not found" };
        } else {
          orderObj.billingAddress = {
            error: "Customer addresses not available",
          };
          orderObj.shippingAddress = {
            error: "Customer addresses not available",
          };
        }

        // Process products and handle variants
        orderObj.products = orderObj.products.map((prod) => {
          if (!prod.product) {
            prod.product = { error: "Product not found in database" };
            prod.variant = null;
          } else if (prod.product.variants && prod.variant) {
            const variantId = new mongoose.Types.ObjectId(prod.variant);
            const variantDetails = prod.product.variants.find((varItem) =>
              varItem._id.equals(variantId)
            );
            prod.variant = variantDetails || { error: "Variant not found" };
          } else {
            prod.variant = { error: "No variants available for this product" };
          }
          return prod;
        });

        return orderObj;
      })
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: processedOrders,
    });
  } catch (error) {
    console.error("Error in getOrdersByCustomerId:", error);
    res.status(500).json({
      message: "Error retrieving customer orders",
      error: error.message,
    });
  }
};

// Update an order (PATCH)
export const updateOrder = async (req, res) => {
  try {
    // Update the order with the provided fields
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Partial update with provided fields
      { new: true, runValidators: true } // Return the updated document, validate fields
    )
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName price variants",
      });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Convert to plain object for manual processing
    const orderObj = updatedOrder.toObject();

    // Manually populate billingAddress and shippingAddress from customer's addresses array
    if (orderObj.customer && orderObj.customer.addresses) {
      const billingId = new mongoose.Types.ObjectId(orderObj.billingAddress);
      orderObj.billingAddress = orderObj.customer.addresses.find((addr) =>
        addr._id.equals(billingId)
      ) || { error: "Billing address not found" };

      const shippingId = new mongoose.Types.ObjectId(orderObj.shippingAddress);
      orderObj.shippingAddress = orderObj.customer.addresses.find((addr) =>
        addr._id.equals(shippingId)
      ) || { error: "Shipping address not found" };
    } else {
      orderObj.billingAddress = { error: "Customer addresses not available" };
      orderObj.shippingAddress = { error: "Customer addresses not available" };
    }

    // Manually process products and ensure no null product references
    orderObj.products = orderObj.products.map((prod) => {
      if (!prod.product) {
        // Product not found in population
        prod.product = { error: "Product not found in database" };
        prod.variant = null;
      } else if (prod.product.variants && prod.variant) {
        const variantId = new mongoose.Types.ObjectId(prod.variant);
        const variantDetails = prod.product.variants.find((varItem) =>
          varItem._id.equals(variantId)
        );
        prod.variant = variantDetails || { error: "Variant not found" };
      } else {
        prod.variant = { error: "No variants available for this product" };
      }
      return prod;
    });

    // Return the updated order
    res.status(200).json({
      message: "Order updated successfully",
      data: orderObj,
    });
  } catch (error) {
    console.error("Error in updateOrder:", error);
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
    });
  }
};
// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};
// Change Order Status and/or Payment Status (PATCH)
export const changeOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, cancellationReason } = req.body;

    // Build the update object with only status fields
    const updateFields = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (cancellationReason) updateFields.cancellationReason = cancellationReason;
    // Check if there’s anything to update
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No status fields provided to update" });
    }

    // Update the order in the database
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    // Return only a success message
    res.status(200).json({
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error in changeOrderStatus:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};
// Generate Invoice
export const generateInvoice = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id)
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email",
      })
      .populate({
        path: "billingAddress",
        model: Customer,
        select: "addresses",
        populate: {
          path: "addresses",
          select: "address city pincode country",
        },
      })
      .populate({
        path: "shippingAddress",
        model: Customer,
        select: "addresses",
        populate: {
          path: "addresses",
          select: "address city pincode country",
        },
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName price",
      })
      .populate({
        path: "products.variant",
        model: Product,
        select: "variants",
        populate: {
          path: "variants",
          select: "weights price",
        },
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const invoice = {
      invoiceNo: order.invoiceDetails[0]?.invoiceNo || "N/A",
      invoiceDate: order.invoiceDetails[0]?.invoiceDate || "N/A",
      customer: `${order.customer.firstName} ${order.customer.lastName}`,
      billingAddress: order.billingAddress?.addresses[0] || {}, // Access first address
      products: order.products.map((p) => ({
        name: p.product.productName,
        variant: p.variant?.variants[0]?.weights || "N/A", // Access first variant
        price: p.variant?.variants[0]?.price || 0,
        quantity: p.quantity,
      })),
      additionalCharges: order.additionalCharges.map((charge) => ({
        packagingCharge: charge.packagingCharge,
        transactionCharge: charge.transactionCharge,
      })),
      deliveryInstructions: order.deliveryInstructions || "", // New field
      discount: order.discount || "0",
      total: order.paymentTotal,
    };
    res.status(200).json({ message: "Invoice generated", data: invoice });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating invoice", error: error.message });
  }
};
// Get Order Summary
export const getOrderSummary = async (req, res) => {
  try {
    const totalOrders = await CustomerOrder.countDocuments();
    const ordersByStatus = await CustomerOrder.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);
    const totalRevenue = await CustomerOrder.aggregate([
      {
        $group: { _id: null, total: { $sum: { $toDouble: "$paymentTotal" } } },
      },
    ]);

    const summary = {
      totalOrders,
      ordersByStatus,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
    res.status(200).json({ message: "Order summary retrieved", data: summary });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving summary", error: error.message });
  }
};

// Controller function to get order summaries for all customers
export const getAllCustomerOrdersSummary = async (req, res) => {
  try {
    // Use projection to select only the needed fields:
    // invoiceDetails, paymentStatus, orderStatus, and paymentTotal.
    const orders = await CustomerOrder.find(
      {}
      // "customer invoiceDetails paymentStatus orderStatus paymentTotal"
    ).exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
