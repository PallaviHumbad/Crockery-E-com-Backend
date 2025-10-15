import mongoose from "mongoose";

const InquiryFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const customerInquiry =
  mongoose.models.InquiryForm ||
  mongoose.model("InquiryForm", InquiryFormSchema);

export default customerInquiry;
