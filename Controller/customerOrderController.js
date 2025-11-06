import Customer from "../Models/CustomerModel.js";
import CustomerOrder from "../Models/customerOrderModel.js";
import Product from "../Models/productModel.js";
import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Get the last order to determine the next invoice number
    const lastOrder = await CustomerOrder.findOne().sort({ createdAt: -1 });
    let newInvoiceNumber = "MKNIND1";

    if (lastOrder && lastOrder.invoiceDetails[0]?.invoiceNo) {
      const lastInvoiceNo = lastOrder.invoiceDetails[0].invoiceNo;
      const numberPart = parseInt(lastInvoiceNo.replace("MKNIND", ""));
      newInvoiceNumber = `MKNIND${numberPart + 1}`;
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
    orderData.discount = orderData.discount || 0;

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

    // Get the last order to determine the next invoice number
    const lastOrder = await CustomerOrder.findOne().sort({ createdAt: -1 });
    let newInvoiceNumber = "MKNIND1";

    if (lastOrder && lastOrder.invoiceDetails[0]?.invoiceNo) {
      const lastInvoiceNo = lastOrder.invoiceDetails[0].invoiceNo;
      const numberPart = parseInt(lastInvoiceNo.replace("MKNIND", "")) || 0;
      newInvoiceNumber = `MKNIND${numberPart + 1}`;
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

    // Ensure optional fields are set
    orderData.orderNote = orderData.orderNote || "";
    orderData.discount = orderData.discount || 0;
    orderData.orderStatus = orderData.orderStatus || "Pending";
    orderData.paymentStatus = orderData.paymentStatus || "Pending";
    orderData.additionalCharges = orderData.additionalCharges || [
      { packagingCharge: 0, shippingCharge: 0 },
    ];

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
        select: "productName originalPrice discountPrice productImages",
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

        return orderObj;
      })
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: processedOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id)
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses phone",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName originalPrice discountPrice productImages",
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderObj = order.toObject();

    // Manually populate billingAddress and shippingAddress
    if (order.customer && order.customer.addresses) {
      const billingId = new mongoose.Types.ObjectId(order.billingAddress);
      orderObj.billingAddress = order.customer.addresses.find((addr) =>
        addr._id.equals(billingId)
      ) || { error: "Billing address not found" };

      const shippingId = new mongoose.Types.ObjectId(order.shippingAddress);
      orderObj.shippingAddress = order.customer.addresses.find((addr) =>
        addr._id.equals(shippingId)
      ) || { error: "Shipping address not found" };
    }

    res.status(200).json({
      message: "Order retrieved successfully",
      data: orderObj,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

// Get all orders by customer ID
export const getOrdersByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const orders = await CustomerOrder.find({ customer: id })
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses phone",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName originalPrice discountPrice productImages",
      });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer" });
    }

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
        }

        return orderObj;
      })
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: processedOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving customer orders",
      error: error.message,
    });
  }
};

// Update an order (PATCH)
export const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate({
        path: "customer",
        model: Customer,
        select: "firstName lastName email addresses",
      })
      .populate({
        path: "products.product",
        model: Product,
        select: "productName originalPrice discountPrice",
      });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
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

    const updateFields = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (cancellationReason)
      updateFields.cancellationReason = cancellationReason;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No status fields provided to update" });
    }

    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Order status updated successfully",
    });
  } catch (error) {
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
        path: "products.product",
        model: Product,
        select: "productName",
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const invoice = {
      invoiceNo: order.invoiceDetails[0]?.invoiceNo || "N/A",
      invoiceDate: order.invoiceDetails[0]?.invoiceDate || "N/A",
      customer: `${order.customer.firstName} ${order.customer.lastName}`,
      products: order.products.map((p) => ({
        name: p.product.productName,
        price: p.price,
        quantity: p.quantity,
        total: p.price * p.quantity,
      })),
      additionalCharges: order.additionalCharges.map((charge) => ({
        packagingCharge: charge.packagingCharge,
        shippingCharge: charge.shippingCharge,
      })),
      discount: order.discount || 0,
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
        $group: { _id: null, total: { $sum: "$paymentTotal" } },
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
    const orders = await CustomerOrder.find({}).exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
