import express from "express";
import Student from "../models/student.js";
import User from "../models/user.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import bcrypt from "bcrypt";
import { verifyToken, requireRole, requireRoles, allowSelfOrAdmin } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Protect all routes

// getSemester Function
function calculateSemester(joinYear) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based month

  // Treat July of join year as semester 1
  const joinStart = new Date(joinYear, 6); // July = month 6 (0-based)
  const monthsElapsed =
    (now.getFullYear() - joinStart.getFullYear()) * 12 +
    (now.getMonth() - joinStart.getMonth());

  // Every 6 months = 1 semester
  const semester = Math.floor(monthsElapsed / 6) + 1;

  return semester > 8 ? 8 : semester; // cap at 8
}

// get all students
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  // Only admin can view all students
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get student by id
router.get("/:id",verifyToken,requireRoles("student", "admin"),allowSelfOrAdmin(Student, 'id'),
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      res.status(200).json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// update student
router.put("/:id", verifyToken, requireRoles("admin", "student"), allowSelfOrAdmin(Student, 'id'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      String(req.params.id),
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Student updated", student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// delete student
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    // also delete user
    await User.findOneAndDelete({ id: student.id, role: "student" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete students by semester
router.delete("/semester/:semester",verifyToken,requireRole("admin"),
  async (req, res) => {
    try {
      const studentsToDelete = await Student.find({
        current_semester: req.params.semester,
      }).select("id");
      const studentIdsToDelete = studentsToDelete.map((s) => s.id);

      // Delete students
      const result = await Student.deleteMany({
        current_semester: req.params.semester,
      });

      // Delete corresponding users
      if (studentIdsToDelete.length > 0) {
        await User.deleteMany({
          id: { $in: studentIdsToDelete },
          role: "student",
        });
      }

      res.status(200).json({
        message: `${result.deletedCount} students deleted from semester ${req.params.semester}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Bulk upload students from CSV
router.post("/upload-csv",verifyToken,requireRole("admin"),upload.single("file"),(req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const studentsToInsert = [];
    const allStudentIdsInCsv = [];
    const errors = [];

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

    const processFile = async () => {
      const parser = fs
        .createReadStream(req.file.path)
        .pipe(parse({ columns: true, trim: true }));

      parser.on("data", (row, index) => {
        // Only process the columns: id, name, batch, joined_year, email
        const idValue = row["id"];
        const nameValue = row["name"];
        const batchValue = row["batch"];
        const joinedYearValue = row["joined_year"];
        const emailValue = row["email"];
        
        const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row
        
        // Validate required fields
        if (!idValue) {
          errors.push({ row: rowNumber, error: "Student ID is required" });
          return;
        }
        if (!nameValue) {
          errors.push({ row: rowNumber, error: "Student name is required" });
          return;
        }
        if (!batchValue) {
          errors.push({ row: rowNumber, error: "Batch is required" });
          return;
        }
        if (!joinedYearValue) {
          errors.push({ row: rowNumber, error: "Joined year is required" });
          return;
        }
        // Validate email format if provided
        if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          errors.push({ row: rowNumber, error: "Invalid email format" });
          return;
        }

        // Validate joined_year format
        const joinedYear = Number(joinedYearValue);
        if (isNaN(joinedYear) || joinedYear < 2000 || joinedYear > new Date().getFullYear()) {
          errors.push({ row: rowNumber, error: "Invalid joined year (must be between 2000 and current year)" });
          return;
        }

        const studentData = {
          id: String(idValue),
          name: String(nameValue),
          email: emailValue && emailValue.trim() !== '' ? String(emailValue) : `${idValue}@student.annauniv.edu`,
          batch: Number(batchValue),
          joined_year: joinedYear,
          current_semester: calculateSemester(joinedYear),
        };

        allStudentIdsInCsv.push(studentData.id);
        studentsToInsert.push(studentData);
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

          // Filter out students that already exist and add to errors
          const newStudents = [];
          studentsToInsert.forEach((student, index) => {
            if (existingStudentIds.has(String(student.id))) {
              errors.push({ row: index + 2, error: `Student with ID '${student.id}' already exists` });
            } else {
              newStudents.push(student);
            }
          });

          let createdStudents = [];
          if (newStudents.length > 0) {
            createdStudents = await Student.insertMany(newStudents, {
              ordered: false,
            });

            // Now, create user accounts for these new students
            const studentUsers = await Promise.all(
              createdStudents.map(async (student) => {
                const firstName = student.name.split(" ")[0].toLowerCase();
                const lastFourOfId = student.id.slice(-4);
                const plainPassword = `${firstName}${lastFourOfId}`;
                const hashedPassword = await bcrypt.hash(plainPassword, 10);

                return {
                  id: student.id,
                  name: student.name,
                  role: "student",
                  password: hashedPassword,
                  studentRef: student._id,
                  mustChangePassword: true,
                  email: student.email,
                };
              })
            );

            await User.insertMany(studentUsers, { ordered: false });
          }

          deleteFile();
          res.status(errors.length > 0 ? 207 : 201).json({
            message: `${createdStudents.length} new students uploaded and user accounts created.`,
            students: createdStudents,
            errors: errors,
          });
        } catch (err) {
          console.error("Database error:", err);
          deleteFile();
          res.status(500).json({ error: "Failed to insert students into database." });
        }
      });

      parser.on("error", (err) => {
        console.error("CSV parse error:", err);
        deleteFile();
        res.status(500).json({ error: "Error parsing CSV file." });
      });
    };

    processFile();
  }
);

export default router;
