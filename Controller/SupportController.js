import Support from "../Models/Support.js";
import Customer from "../Models/CustomerModel.js";

// Create Support Ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { title, description, customerId } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create support ticket with customer info
    const supportTicket = new Support({
      title,
      description,
      customerId,
      customerInfo: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });

    await supportTicket.save();

    res.status(201).json({
      message: "Support ticket created successfully",
      data: supportTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating support ticket",
      error: error.message,
    });
  }
};

// Get All Support Tickets
export const getAllSupportTickets = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};

    const tickets = await Support.find(filter)
      .populate("customerId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching support tickets",
      error: error.message,
    });
  }
};

// Get Single Support Ticket
export const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id).populate(
      "customerId",
      "firstName lastName email phone addresses"
    );

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json({ data: ticket });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching support ticket",
      error: error.message,
    });
  }
};

// Get Support Tickets by Customer
export const getSupportTicketsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const tickets = await Support.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer support tickets",
      error: error.message,
    });
  }
};

// Update Support Ticket
export const updateSupportTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    const ticket = await Support.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json({
      message: "Support ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating support ticket",
      error: error.message,
    });
  }
};

// Change Support Ticket Status
export const changeSupportTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'pending' or 'resolved'",
      });
    }

    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json({
      message: `Support ticket marked as ${status}`,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error changing ticket status",
      error: error.message,
    });
  }
};

// Delete Support Ticket
export const deleteSupportTicket = async (req, res) => {
  try {
    const ticket = await Support.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json({
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting support ticket",
      error: error.message,
    });
  }
};
