import mongoose, { Schema } from "mongoose";

const DeadlineSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  processId: { type: Schema.Types.ObjectId, ref: "Process", default: null },
  status: {
    type: String,
    enum: ["pendente", "concluido", "concluído"], 
    default: "pendente",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deadline || mongoose.model("Deadline", DeadlineSchema);
