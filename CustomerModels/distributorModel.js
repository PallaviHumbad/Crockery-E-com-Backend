import mongoose from "mongoose";

const DistributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    companyName: { type: String, required: true },
    storageFacility: { type: String, required: true },
    godownSize: { type: String, required: true },
    transportFacility: { type: Boolean, default: false },
    investmentCapacity: { type: String, required: true },
  },
  { timestamps: true }
);

const Distributor =
  mongoose.models.Distributor ||
  mongoose.model("Distributor", DistributorSchema);

export default Distributor;
