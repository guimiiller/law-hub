import mongoose, { Schema } from "mongoose";

const FinanceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["entrada", "saida"] },
  description: String,
  value: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);
