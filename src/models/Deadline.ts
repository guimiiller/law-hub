import mongoose, { Schema } from "mongoose";

const DeadlineSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  date: Date,
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deadline || mongoose.model("Deadline", DeadlineSchema);
