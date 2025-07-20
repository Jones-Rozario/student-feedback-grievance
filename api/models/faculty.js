import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  designation: { type: String},
  mustChangePassword: { type: Boolean, default: true },
});

export default mongoose.model("Faculty", facultySchema);