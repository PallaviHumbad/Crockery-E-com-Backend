import Distributor from "../CustomerModels/distributorModel.js";

// Create a new distributor
export const createDistributor = async (req, res) => {
  try {
    const distributorData = req.body;
    const newDistributor = new Distributor(distributorData);
    await newDistributor.save();
    res.status(201).json(newDistributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all distributors
export const getAllDistributors = async (req, res) => {
  try {
    const distributors = await Distributor.find();
    res.status(200).json(distributors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single distributor by ID
export const getDistributorById = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const distributor = await Distributor.findById(distributorId);
    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.status(200).json(distributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a distributor by ID
export const updateDistributor = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const updatedDistributor = await Distributor.findByIdAndUpdate(
      distributorId,
      req.body,
      { new: true }
    );
    if (!updatedDistributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.status(200).json(updatedDistributor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a distributor by ID
export const deleteDistributor = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const deletedDistributor = await Distributor.findByIdAndDelete(
      distributorId
    );
    if (!deletedDistributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.status(200).json({ message: "Distributor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
