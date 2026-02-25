import mongoose, { Schema, models } from "mongoose";

const CaseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },

    title: String,
    number: String,
    status: String,
    court: String,
    name: String,
  },
  { timestamps: true }
);

export default models.Case || mongoose.model("Case", CaseSchema);