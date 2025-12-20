import mongoose, { Schema, models } from "mongoose";

const FinanceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["entrada", "saida"],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default models.Finance || mongoose.model("Finance", FinanceSchema);
