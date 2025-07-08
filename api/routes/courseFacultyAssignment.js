import express from "express";
import CourseFacultyAssignment from "../models/courseFacultyAssignment.js";
import { requireRole, requireRoles, verifyToken } from "../middleware/auth.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import Course from "../models/course.js";
import Faculty from "../models/faculty.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Get all assignments
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const assignments = await CourseFacultyAssignment.find()
      .populate("course", "name code regulation isElective")
      .populate("faculty", "name designation");
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assignments by semester and batch and academic year
router.get(
  "/semester/:semester/batch/:batch",
  verifyToken,
  async (req, res) => {
    try {
      const semester = Number(req.params.semester);
      const batch = req.params.batch;
      const academic_year = req.query.academic_year;
      const isElective = req.query.isElective;

      // Validate semester
      if (isNaN(semester) || semester < 1 || semester > 8) {
        return res
          .status(400)
          .json({ error: "Invalid semester. Must be 1-8." });
      }
      if (!academic_year) {
        return res
          .status(400)
          .json({ error: "academic_year is required as a query parameter" });
      }

      console.log(
        `Fetching assignments for semester: ${semester}, batch: ${batch}, academic_year: ${academic_year}, isElective: ${isElective}`
      );

      // Build query
      const query = {
        semester: semester,
        batch: batch,
        academic_year: academic_year,
      };
      if (isElective !== undefined) {
        query["isElective"] = isElective === "true";
      }

      // Find assignments and populate course (to check isElective)
      let assignments = await CourseFacultyAssignment.find(query)
        .populate("course", "name code regulation isElective")
        .populate("faculty", "name designation");

      // If isElective filter is set, filter by course.isElective
      if (isElective !== undefined) {
        assignments = assignments.filter(
          (a) => a.course && a.course.isElective === (isElective === "true")
        );
      }

      console.log(`Found ${assignments.length} assignments`);
      res.status(200).json(assignments);
    } catch (err) {
      console.error("Error in semester/batch/academic_year route:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Assign faculty to course for a semester and batch
router.post("/assign", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { course, faculty, academic_year, semester, batch } = req.body;
    if (!course || !faculty || !academic_year || !semester || !batch) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingAssignment = await CourseFacultyAssignment.findOne({
      course: String(course),
      faculty: String(faculty),
      academic_year: academic_year,
      semester: Number(semester),
      batch: String(batch),
    });
    if (existingAssignment) {
      return res
        .status(400)
        .json({ error: "Faculty already assigned to this course" });
    }
    const assignment = new CourseFacultyAssignment({
      course: String(course),
      faculty: String(faculty),
      academic_year: academic_year,
      semester: Number(semester),
      batch: String(batch),
    });
    await assignment.save();
    res.status(201).json({ message: "Faculty assigned to course", assignment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Update assignment
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { course, faculty, academic_year, semester, batch } = req.body;

    if (!course || !faculty || !academic_year || !semester || !batch) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the new assignment already exists (excluding current assignment)
    const existingAssignment = await CourseFacultyAssignment.findOne({
      course: String(course),
      faculty: String(faculty),
      academic_year: academic_year,
      semester: Number(semester),
      batch: String(batch),
      _id: { $ne: req.params.id },
    });

    if (existingAssignment) {
      return res.status(400).json({
        error:
          "Faculty already assigned to this course for this academic year, semester, and batch",
      });
    }

    const assignment = await CourseFacultyAssignment.findByIdAndUpdate(
      req.params.id,
      {
        course: String(course),
        faculty: String(faculty),
        academic_year: academic_year,
        semester: Number(semester),
        batch: String(batch),
      },
      { new: true }
    )
      .populate("course", "name code regulation isElective")
      .populate("faculty", "name designation");

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res
      .status(200)
      .json({ message: "Assignment updated successfully", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assignment
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const assignment = await CourseFacultyAssignment.findByIdAndDelete(
      req.params.id
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete assignments by course (for cascading delete)
router.delete(
  "/course/:courseId",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await CourseFacultyAssignment.deleteMany({
        course: req.params.courseId,
      });
      res.status(200).json({
        message: `${result.deletedCount} assignments deleted for course ${req.params.courseId}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete assignments by faculty (for cascading delete)
router.delete(
  "/faculty/:facultyId",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await CourseFacultyAssignment.deleteMany({
        faculty: req.params.facultyId,
      });
      res.status(200).json({
        message: `${result.deletedCount} assignments deleted for faculty ${req.params.facultyId}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get assignments by faculty
router.get("/faculty/:facultyId", verifyToken, async (req, res) => {
  try {
    const { facultyId } = req.params;
    const removeDup = req.query.removedup === "true";

    let assignments = await CourseFacultyAssignment.find({
      faculty: facultyId,
    })
      .populate("course", "name code regulation isElective")
      .populate("faculty", "name designation")
      .sort({ semester: 1, batch: 1 });

    if (removeDup) {
      const courseBatches = [];
      for (const assignment of assignments) {
        const courses = await CourseFacultyAssignment.find({
          faculty: facultyId,
          course: assignment.course._id,
        })
          .populate("course", "name code regulation isElective")
          .sort({ semester: 1, batch: 1 });

        if (!courses.length) continue;

        // Check if this course is already in courseBatches
        let existing = courseBatches.find(
          (cb) => cb.course._id.toString() === courses[0].course._id.toString()
        );
        if (!existing) {
          courseBatches.push({
            course: courses[0].course,
            batches: courses.map((c) => c.batch),
          });
        }
      }
      console.log(courseBatches);
      return res.status(200).json(courseBatches);
    }

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Error getting faculty assignments:", err);
    res.status(500).json({ error: err.message });
  }
});

// CSV upload for course-faculty assignments
router.post(
  "/upload-csv",
  verifyToken,
  requireRole("admin"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const assignments = [];
    const errors = [];
    const headers = ["course", "faculty", "academic_year", "semester", "batch"];

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
        const assignmentData = {};
        headers.forEach((header) => {
          if (row[header] !== undefined) {
            if (header === "semester") {
              assignmentData[header] = Number(row[header]);
            } else if (header === "batch") {
              assignmentData[header] = Number(row[header]);
            } else {
              assignmentData[header] = String(row[header]);
            }
          }
        });
        assignments.push(assignmentData);
      })
      .on("end", async () => {
        try {
          const validAssignments = [];
          for (let i = 0; i < assignments.length; i++) {
            const a = assignments[i];
            console.log(`Processing row ${i + 2}:`, a);
            // Validate all fields
            if (
              !a.course ||
              !a.faculty ||
              !a.academic_year ||
              !a.semester ||
              !a.batch
            ) {
              console.error(`Row ${i + 2}: Missing required fields`, a);
              errors.push({ row: i + 2, error: "Missing required fields" });
              continue;
            }
            // Validate academic_year format
            if (!/^\d{4} - \d{4}$/.test(a.academic_year)) {
              console.error(`Row ${i + 2}: Invalid academic_year format`, a.academic_year);
              errors.push({
                row: i + 2,
                error: "Invalid academic_year format (expected YYYY - YYYY)",
              });
              continue;
            }
            // Validate semester
            if (isNaN(a.semester) || a.semester < 1 || a.semester > 8) {
              console.error(`Row ${i + 2}: Invalid semester`, a.semester);
              errors.push({
                row: i + 2,
                error: "Invalid semester (must be 1-8)",
              });
              continue;
            }
            // Validate course exists
            const courseDoc = await Course.findOne({ code: a.course });
            if (!courseDoc) {
              console.error(`Row ${i + 2}: Course with code '${a.course}' not found`);
              errors.push({
                row: i + 2,
                error: `Course with code '${a.course}' not found`,
              });
              continue;
            }
            // Validate faculty exists
            const facultyDoc = await Faculty.findOne({ id: a.faculty });
            if (!facultyDoc) {
              console.error(`Row ${i + 2}: Faculty with id '${a.faculty}' not found`);
              errors.push({
                row: i + 2,
                error: `Faculty with id '${a.faculty}' not found`,
              });
              continue;
            }
            // Check for duplicate assignment
            const exists = await CourseFacultyAssignment.findOne({
              course: String(courseDoc._id),
              faculty: String(facultyDoc._id),
              academic_year: a.academic_year,
              semester: a.semester,
              batch: a.batch,
            });
            if (exists) {
              console.error(`Row ${i + 2}: Assignment already exists`);
              errors.push({ row: i + 2, error: "Assignment already exists" });
              continue;
            }
            validAssignments.push({
              course: String(courseDoc._id),
              faculty: String(facultyDoc._id),
              academic_year: a.academic_year,
              semester: a.semester,
              batch: a.batch,
            });
          }
          let created = [];
          if (validAssignments.length > 0) {
            created = await CourseFacultyAssignment.insertMany(
              validAssignments
            );
            console.log(`Inserted ${created.length} assignments.`);
          }
          deleteFile();
          res.status(errors.length > 0 ? 207 : 201).json({
            message: `${created.length} assignments uploaded`,
            assignments: created,
            errors,
          });
        } catch (err) {
          console.error("Error during CSV upload processing:", err);
          deleteFile();
          res.status(500).json({ error: err.message });
        }
      })
      .on("error", (err) => {
        console.log("CSV parse error:", err);
        deleteFile();
        res.status(500).json({ error: err.message });
      });
  }
);

// Get unique courses by semester
router.get("/unique-courses/semester/:semester", verifyToken, async (req, res) => {
  try {
    const semester = Number(req.params.semester);
    if (isNaN(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ error: "Invalid semester. Must be 1-8." });
    }
    // Find all assignments for the semester
    const assignments = await CourseFacultyAssignment.find({ semester });
    // Get unique course IDs
    const courseIds = [...new Set(assignments.map(a => a.course))];
    // Fetch course documents
    const courses = await Course.find({ _id: { $in: courseIds } });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
