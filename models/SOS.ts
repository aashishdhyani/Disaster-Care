import mongoose from "mongoose";

const SOSSchema = new mongoose.Schema({
  userId: String,
  lat: Number,
  lng: Number,
  time: String,
});

export default mongoose.models.SOS || mongoose.model("SOS", SOSSchema);