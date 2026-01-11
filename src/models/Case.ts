import mongoose, { Schema } from "mongoose";

const CaseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  title: String,
  number: String,
  status: String,
  court: String,
  createdAt: { type: Date, default: Date.now },
  name: String
});

export default mongoose.models.Case || mongoose.model("Case", CaseSchema);
