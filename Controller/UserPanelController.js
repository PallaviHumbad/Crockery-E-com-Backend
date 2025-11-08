import UserPanel from "../Models/UserPanel.js";
import bcrypt from "bcryptjs";

// Create User Panel
export const createUserPanel = async (req, res) => {
  try {
    const { name, email, password, modules } = req.body;

    // Check if user already exists
    const existingUser = await UserPanel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User panel already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user panel
    const userPanel = new UserPanel({
      name,
      email,
      password: hashedPassword,
      modules: modules || undefined, // Use default if not provided
    });

    await userPanel.save();

    res.status(201).json({
      message: "User panel created successfully",
      data: {
        id: userPanel._id,
        name: userPanel.name,
        email: userPanel.email,
        modules: userPanel.modules,
        isActive: userPanel.isActive,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user panel", error: error.message });
  }
};

// Get All User Panels
export const getAllUserPanels = async (req, res) => {
  try {
    const userPanels = await UserPanel.find().select("-password");
    res.status(200).json({ data: userPanels });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user panels", error: error.message });
  }
};

// Get Single User Panel
export const getUserPanelById = async (req, res) => {
  try {
    const userPanel = await UserPanel.findById(req.params.id).select(
      "-password"
    );

    if (!userPanel) {
      return res.status(404).json({ message: "User panel not found" });
    }

    res.status(200).json({ data: userPanel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user panel", error: error.message });
  }
};

// Update User Panel
export const updateUserPanel = async (req, res) => {
  try {
    const { name, email, password, modules } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (modules) updateData.modules = modules;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const userPanel = await UserPanel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!userPanel) {
      return res.status(404).json({ message: "User panel not found" });
    }

    res.status(200).json({
      message: "User panel updated successfully",
      data: userPanel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user panel", error: error.message });
  }
};

// Toggle Active/Inactive Status
export const toggleUserPanelStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const userPanel = await UserPanel.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!userPanel) {
      return res.status(404).json({ message: "User panel not found" });
    }

    res.status(200).json({
      message: `User panel ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: userPanel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

// Delete User Panel
export const deleteUserPanel = async (req, res) => {
  try {
    const userPanel = await UserPanel.findByIdAndDelete(req.params.id);

    if (!userPanel) {
      return res.status(404).json({ message: "User panel not found" });
    }

    res.status(200).json({ message: "User panel deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user panel", error: error.message });
  }
};
