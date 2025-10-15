import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  loginCustomer,
  auth,
  logout,
} from "../Controller/customerController.js";
import authenticate from "../Middleware/authenticate.js";

const router = express.Router();

router.post("/create", createCustomer); // Create a new customer
router.get("/getAllCustomer", getCustomers); // Get all customers
router.get("/getById/:id", getCustomerById); // Get a single customer by ID
router.put("/update/:id", updateCustomer); // Update customer
router.delete("/delete/:id", deleteCustomer); // Delete customer
router.post("/login", loginCustomer);
router.post("/logout", logout);

// authentication check
router.get("/me", authenticate, auth);

export default router;
