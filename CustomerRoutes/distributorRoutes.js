import express from "express";
import {
  createDistributor,
  getAllDistributors,
  getDistributorById,
  updateDistributor,
  deleteDistributor,
} from "../CustomerController/distributorController.js";

const router = express.Router();

// Create a new distributor
router.post("/createdistributor", createDistributor);

// Get all distributors
router.get("/getAlldistributors", getAllDistributors);

// Get a distributor by ID
router.get("/getdistributorById/:distributorId", getDistributorById);

// Update a distributor by ID
router.put("/:distributorId", updateDistributor);

// Delete a distributor by ID
router.delete("/:distributorId", deleteDistributor);

export default router;
