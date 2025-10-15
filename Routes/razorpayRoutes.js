import express from "express";
import {createOrder} from "../Controller/RazorPayController.js";

const razorpayRoutes = express.Router();

// CRUD Routes
razorpayRoutes.post("/create-order", createOrder);

export default razorpayRoutes;
