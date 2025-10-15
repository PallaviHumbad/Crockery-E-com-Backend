import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  changeOrderStatus,
  generateInvoice,
  getOrderSummary,
  getAllCustomerOrdersSummary,
  getOrdersByCustomerId,
  createOrderByCustomer,
} from "../Controller/customerOrderController.js";

const customerOrderRouter = express.Router();

customerOrderRouter.post("/createOrder", createOrder);
customerOrderRouter.post("/createOrderByCustomer", createOrderByCustomer);
customerOrderRouter.get("/getAllOrders", getAllOrders);
customerOrderRouter.get("/getOrders/:id", getOrderById);
customerOrderRouter.patch("/updateOrdersById/:id", updateOrder);
customerOrderRouter.delete("/orders/:id", deleteOrder);
customerOrderRouter.patch("/updateOrdersStatus/:id/status", changeOrderStatus);
customerOrderRouter.get("/orders/:id/invoice", generateInvoice);
customerOrderRouter.get("/orders/summary", getOrderSummary);
// Define the route: GET /api/orders/customer/:customerId
customerOrderRouter.get("/customer", getAllCustomerOrdersSummary);
// In your routes file (e.g., orderRoutes.js)
customerOrderRouter.get("/getOrdersByCustomerId/:id", getOrdersByCustomerId);

export default customerOrderRouter;
