import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  regulation: { type: String },
  isElective: { type: Boolean, default: false },
});

export default mongoose.model("Course", courseSchema);