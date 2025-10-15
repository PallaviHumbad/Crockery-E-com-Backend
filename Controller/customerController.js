import Customer from "../Models/CustomerModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authenticate from "../Middleware/authenticate.js";

// Create a new Customer
// export const createCustomer = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, phone, addresses } = req.body;

//     // Check if email already exists
//     const existingEmail = await Customer.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Check if phone already exists
//     const existingPhone = await Customer.findOne({ phone });
//     if (existingPhone) {
//       return res.status(400).json({ message: "Phone number already exists" });
//     }

//     // Validate addresses array
//     if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "At least one address is required" });
//     }

//     let hashedPassword;
//     let token;
//     if (password) {
//       // Hash the password with bcrypt before saving
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // Create new customer with hashed password (if provided)
//     const newCustomer = new Customer({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword, // stored as undefined if not provided
//       phone,
//       addresses: addresses.map((addr) => ({
//         address: addr.address,
//         pincode: addr.pincode,
//         city: addr.city,
//         state: addr.state,
//         country: addr.country,
//       })),
//     });

//     await newCustomer.save();

//     // Generate JWT token if a password was provided
//     if (password) {
//       token = jwt.sign({ id: newCustomer._id }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });
//     }

//     res.status(201).json({
//       message: "Customer created successfully",
//       customer: newCustomer,
//       ...(token && { token }),
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, addresses } = req.body;

    // Check if email already exists
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if phone already exists
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // Validate addresses array
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one address is required" });
    }

    let hashedPassword;
    let token;
    if (password) {
      // Hash the password with bcrypt before saving
      hashedPassword = await bcrypt.hash(password, 10);

      // Create new customer with hashed password
      const newCustomer = new Customer({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        addresses: addresses.map((addr) => ({
          address: addr.address,
          pincode: addr.pincode,
          city: addr.city,
          state: addr.state,
          country: addr.country,
        })),
      });

      await newCustomer.save();

      if (password) {
        // Generate JWT token with 7-day expiration
        token = jwt.sign({ id: newCustomer._id }, process.env.JWT_SECRET, {
          expiresIn: "7d", // Changed from "1d" to "7d"
        });

        // Set the token in an httpOnly cookie
        res.cookie("token", token, {
          httpOnly: true, // Prevents client-side JS access
          secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
      }

      res.status(201).json({
        message: "Customer created successfully",
        customer: newCustomer,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Password is required for signup" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, addresses } = req.body;

    // Check for duplicate email if updating
    if (email) {
      const existingEmail = await Customer.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Check for duplicate phone if updating
    if (phone) {
      const existingPhone = await Customer.findOne({
        phone,
        _id: { $ne: req.params.id },
      });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
    }

    // Construct update object
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (addresses) {
      updateData.addresses = addresses.map((addr) => ({
        address: addr.address,
        pincode: addr.pincode,
        city: addr.city,
        state: addr.state,
        country: addr.country,
      }));
    }
    if (password) {
      // Encrypt new password if provided
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the customer in the database
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a customer by ID
export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Customer Login
// export const loginCustomer = async (req, res) => {
//   try {
//     const { phone, password } = req.body;

//     // Find customer by email
//     const customer = await Customer.findOne({ phone });
//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Check if password is set
//     if (!customer.password) {
//       return res
//         .status(400)
//         .json({ message: "Password not set. Please contact support." });
//     }

//     // Validate password
//     const isMatch = await bcrypt.compare(password, customer.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       customer: {
//         id: customer._id,
//         firstName: customer.firstName,
//         lastName: customer.lastName,
//         email: customer.email,
//         phone: customer.phone,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const loginCustomer = async (req, res) => {
  const { phone, password } = req.body;
  console.log(phone, password);
  try {
    // Find customer by phone
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if password is set
    if (!customer.password) {
      return res
        .status(400)
        .json({ message: "Password not set. Please contact support." });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token with 7-day expiration
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Changed from "1d" to "7d"
    });

    console.log(token);
    // Set the token in an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Current User (Protected Route)
export const auth = async (req, res) => {
  try {
    console.log("user here", req.user);
    const customer = await Customer.findById(req.user.id).select("-password");
    // console.log(customer);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
