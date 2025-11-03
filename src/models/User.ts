import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória"],
      minlength: [6, "A senha deve ter pelo menos 6 caracteres"],
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["advogado", "assistente", "admin"],
      default: "advogado",
    },

    avatar: {
      type: String,
      default: "",
    },

    officeName: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
