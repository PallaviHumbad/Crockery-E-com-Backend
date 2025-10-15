import customerInquiry from "../CustomerModels/customerInquiry.js";

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const inquiryData = req.body;
    const newInquiry = new customerInquiry(inquiryData);
    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all inquiries
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await customerInquiry.find();
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
