import mongoose from "mongoose";

const CustomerOrderSchema = new mongoose.Schema(
  {
    invoiceDetails: [
      {
        invoiceNo: { type: String, required: true },
        invoiceDate: { type: String, required: true },
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    billingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer.addresses",
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer.addresses",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Store price at order time
      },
    ],
    shippingMethod: {
      type: String,
      enum: ["Standard", "Express"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Failed"],
      default: "Pending",
      required: true,
    },
    additionalCharges: [
      {
        packagingCharge: { type: Number, default: 0 },
        shippingCharge: { type: Number, default: 0 },
      },
    ],
    paymentTotal: { type: Number, required: true },
    orderNote: { type: String, default: "" },
    discount: { type: Number, default: 0 },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const CustomerOrder =
  mongoose.models.CustomerOrder ||
  mongoose.model("CustomerOrder", CustomerOrderSchema);

export default CustomerOrder;
