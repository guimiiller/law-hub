import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    name: String,
    email: String,
    phone: String,

    companyName: String,
    cnpj: String,
    address: String,

    theme: {
      type: String,
      default: "light",
    },

    notifications: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
