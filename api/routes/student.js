import express from "express";
import Student from "../models/student.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get student by id
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update student
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(String(req.params.id), req.body, {
      new: true,
    });
    res.status(200).json({ message: "Student updated", student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// delete student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete students by semester
router.delete("/semester/:semester", async (req, res) => {
  try {
    const result = await Student.deleteMany({ current_semester: req.params.semester });
    res.status(200).json({ 
      message: `${result.deletedCount} students deleted from semester ${req.params.semester}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload students from CSV
router.post("/upload-csv", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const studentsToInsert = [];
  const allStudentIdsInCsv = [];

  const processFile = async () => {
    const parser = fs
      .createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }));

    parser.on("data", (row) => {
      // Only process the columns: id, name, batch, joined_year
      const idValue = row["id"];
      const studentData = {
        id: idValue !== undefined ? String(idValue) : undefined,
        name: row["name"] || undefined,
        batch: row["batch"] || undefined,
        joined_year: row["joined_year"] || undefined,
      };
      
      if (studentData.id) {
        allStudentIdsInCsv.push(studentData.id);
        studentsToInsert.push(studentData);
      }
    });

    parser.on("end", async () => {
      try {
        // Find existing students from the CSV in one query
        const existingStudents = await Student.find({
          id: { $in: allStudentIdsInCsv },
        }).select("id");

        const existingStudentIds = new Set(
          existingStudents.map((s) => String(s.id))
        );

        // Filter out students that already exist
        const newStudents = studentsToInsert.filter(
          (student) => !existingStudentIds.has(String(student.id))
        );

        if (newStudents.length > 0) {
          const created = await Student.insertMany(newStudents, { ordered: false });
          res.status(201).json({
            message: `${created.length} new students uploaded successfully.`,
            students: created,
          });
        } else {
          res.status(200).json({
            message: "No new students to upload. All students in the CSV already exist.",
          });
        }
      } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to insert students into database." });
      } finally {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
      }
    });

    parser.on("error", (err) => {
      console.error("CSV parse error:", err);
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Error parsing CSV file." });
    });
  };

  processFile();
});

export default router;
