import mongoose, { Schema, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    title: String,
    type: String,
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    processId: { type: Schema.Types.ObjectId, ref: "Case", default: null },
    url: String,
    description: String,
    tags: [String],
    fileUrl: String,
    date: String,
  },
  { timestamps: true }
);

export default models.Document || mongoose.model("Document", DocumentSchema);
