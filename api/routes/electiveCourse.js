import express from "express";
import ElectiveCourse from "../models/electiveCourse.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import ElectiveCourseFacultyAssignment from "../models/electiveCourseFacultyAssignment.js";
import ElectiveStudentAssignment from "../models/electiveStudentAssignment.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get all Electives
router.get("/", async (req, res) => {
  try {
    const electiveCourses = await ElectiveCourse.find();
    return res.status(200).json(electiveCourses);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

// Bulk upload courses from CSV
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const courses = [];
  const headers = ["code", "name", "semester"];

  // Helper function to delete file
  const deleteFile = () => {
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log(`Deleted file: ${req.file.path}`);
      }
    } catch (err) {
      console.error(`Error deleting file ${req.file.path}:`, err);
    }
  };

  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on("data", (row) => {
      const courseData = {};
      headers.forEach((header) => {
        if (row[header] !== undefined) {
          if (header === "semester") {
            courseData[header] = Number(row[header]);
          } else {
            courseData[header] = String(row[header]);
          }
        }
      });
      courses.push(courseData);
    })
    .on("end", async () => {
      try {
        const created = await ElectiveCourse.insertMany(courses);
        deleteFile(); // Delete file on success
        res.status(201).json({ message: "Elective Courses uploaded", electiveCourses: created });
      } catch (err) {
        deleteFile(); // Delete file on database error
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
      }
    })
    .on("error", (err) => {
      deleteFile(); // Delete file on parse error
      console.error("CSV parse error:", err);
      res.status(500).json({ error: err.message });
    });
});

// Delete an elective course and all related assignments
router.delete("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    // Delete the elective course
    const deletedCourse = await ElectiveCourse.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res.status(404).json({ error: "Elective course not found" });
    }
    // Delete all faculty assignments for this course
    await ElectiveCourseFacultyAssignment.deleteMany({ electiveCourse: courseId });
    // Delete all student assignments for this course
    await ElectiveStudentAssignment.updateMany(
      {},
      { $pull: { electives: { electiveCourse: courseId } } }
    );
    res.status(200).json({ message: "Elective course and all related assignments deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;