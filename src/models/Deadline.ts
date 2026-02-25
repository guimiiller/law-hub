import mongoose, { Schema, models } from "mongoose";

const DeadlineSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: String,

    processId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      default: null,
    },

    status: {
      type: String,
      enum: ["pendente", "concluido", "concluído"],
      default: "pendente",
    },
  },
  { timestamps: true }
);

export default models.Deadline || mongoose.model("Deadline", DeadlineSchema);