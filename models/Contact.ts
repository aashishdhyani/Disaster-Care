import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  userId: String,
  name: String,
  phone: String,
  email: String,
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);