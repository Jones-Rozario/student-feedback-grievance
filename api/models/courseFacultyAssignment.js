import mongoose from "mongoose";

const courseFacultyAssignmentSchema = new mongoose.Schema({
  academic_year: { 
    type: String, 
    required: true, 
    match: [/^\d{4}\s*-\s*\d{4}$/, 'Academic year must be in the format YYYY - YYYY'] 
  },
  semester: { type: Number, required: true, min: 1, max: 8 },
  batch: { type: Number, required: true },
  course: { type: String, ref: "Course", required: true },
  faculty: { type: String, ref: "Faculty", required: true },
});

export default mongoose.model(
  "CourseFacultyAssignment",
  courseFacultyAssignmentSchema
);
