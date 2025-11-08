import mongoose from "mongoose";

const userPanelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    modules: {
      type: [String],
      default: [
        "/categories",
        "/users",
        "/catalogue/product",
        "/sales/orders",
        "/customers",
        "/finance",
        "/report",
        "/support",
        "/settings",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UserPanel = mongoose.model("UserPanel", userPanelSchema);
export default UserPanel;
