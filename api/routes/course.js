import express from "express";
import Course from "../models/course.js";
import CourseFacultyAssignment from "../models/courseFacultyAssignment.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import { requireRole, verifyToken } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get all courses
router.get("/",verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.isElective !== undefined) {
      // Accept 'true' or 'false' as string, convert to boolean
      filter.isElective = req.query.isElective === 'true';
    }
    const courses = await Course.find(filter);
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get course by id
router.get("/:id",verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update course
router.put("/:id",verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { name, code, regulation, isElective } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, regulation, isElective },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete course
router.delete("/:id",verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    // Delete related assignments
    const deletedAssignments = await CourseFacultyAssignment.deleteMany({ course: String(course._id) });
    
    res.status(200).json({ 
      message: "Course deleted successfully",
      deletedAssignments: deletedAssignments.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // Bulk delete courses by semester
// router.delete("/semester/:semester",verifyToken, requireRole("admin"), async (req, res) => {
//   try {
//     const courses = await Course.find({ semester: req.params.semester });
//     const courseCodes = courses.map(course => String(course._id));
    
//     // Delete related assignments for all courses in this semester
//     const deletedAssignments = await CourseFacultyAssignment.deleteMany({ 
//       course: { $in: courseCodes } 
//     });
    
//     const result = await Course.deleteMany({ semester: req.params.semester });
    
//     res.status(200).json({ 
//       message: `${result.deletedCount} courses deleted from semester ${req.params.semester}`,
//       deletedAssignments: deletedAssignments.deletedCount
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// Bulk upload courses from CSV
router.post("/upload-csv",verifyToken, requireRole("admin"), upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const courses = [];
  const errors = [];
  // Remove semester from headers
  const headers = ["code", "name", "regulation", "isElective"];
  
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
    .on("data", (row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row
      
      const codeValue = row["code"];
      const nameValue = row["name"];
      const regulationValue = row["regulation"];
      const isElectiveValue = row["isElective"];
      
      // Validate required fields
      if (!codeValue) {
        errors.push({ row: rowNumber, error: "Course code is required" });
        return;
      }
      if (!nameValue) {
        errors.push({ row: rowNumber, error: "Course name is required" });
        return;
      }
      if (!regulationValue) {
        errors.push({ row: rowNumber, error: "Regulation is required" });
        return;
      }
      if (isElectiveValue === undefined || isElectiveValue === null || isElectiveValue === '') {
        errors.push({ row: rowNumber, error: "isElective field is required" });
        return;
      }

      const courseData = {};
      headers.forEach((header) => {
        if (row[header] !== undefined) {
          if (header === "code") {
            courseData[header] = String(row[header]);
          } else if (header === "isElective") {
            const val = String(row[header]).trim().toLowerCase();
            courseData[header] = val === 'true' || val === '1' || val === 'yes';
          } else {
            courseData[header] = row[header];
          }
        }
      });
      courses.push(courseData);
    })
    .on("end", async () => {
      try {
        // Filter out duplicates by code (existing in DB) and add to errors
        const codes = courses.map(c => c.code);
        const existing = await Course.find({ code: { $in: codes } });
        const existingCodes = new Set(existing.map(c => c.code));
        
        const uniqueCourses = [];
        courses.forEach((course, index) => {
          if (existingCodes.has(course.code)) {
            errors.push({ row: index + 2, error: `Course with code '${course.code}' already exists` });
          } else {
            uniqueCourses.push(course);
          }
        });

        let created = [];
        if (uniqueCourses.length > 0) {
          created = await Course.insertMany(uniqueCourses);
        }
        
        deleteFile();
        res.status(errors.length > 0 ? 207 : 201).json({ 
          message: `${created.length} courses uploaded`, 
          courses: created, 
          skipped: courses.length - uniqueCourses.length,
          errors: errors
        });
      } catch (err) {
        deleteFile();
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
      }
    })
    .on("error", (err) => {
      deleteFile();
      console.error("CSV parse error:", err);
      res.status(500).json({ error: err.message });
    });
});

export default router;

    