import mongoose, { Schema } from "mongoose";

const ClientSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true 
  },
  notes: { 
    type: String, 
    default: "" 
  }, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
