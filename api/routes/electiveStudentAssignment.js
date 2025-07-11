import express from "express";
import ElectiveStudentAssignment from "../models/electiveStudentAssignment.js";
import ElectiveCourse from "../models/electiveCourse.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import Student from "../models/student.js";
import { requireRole, requireRoles, verifyToken } from "../middleware/auth.js";
import Course from "../models/course.js";
import CourseFacultyAssignment from "../models/courseFacultyAssignment.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET /: Get all elective assignments with student and course details
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const assignments = await ElectiveStudentAssignment.find().populate(
      "electives.electiveCourse"
    );

    const results = [];
    for (const assignment of assignments) {
      const student = await Student.findOne({ id: assignment.s_id });
      if (student) {
        for (const elective of assignment.electives) {
          results.push({
            _id: `${student.id}-${elective.electiveCourse._id}`,
            electiveCourse: elective.electiveCourse,
            student: {
              _id: student._id,
              name: student.name,
              registerNumber: student.id,
              batch: elective.batch,
            },
          });
        }
      }
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /upload-csv: Assign students to elective courses via CSV
// Expects: multipart/form-data with 'file' (CSV)
// CSV columns: s_id, course_code, batch
router.post(
  "/upload-csv",
  upload.single("file"),
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const assignments = [];
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

    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row, index) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row
        
        const sIdValue = row.s_id;
        const courseCodeValue = row.course_code;
        const batchValue = row.batch;
        
        // Validate required fields
        if (!sIdValue) {
          errors.push({ row: rowNumber, error: "Student ID is required" });
          return;
        }
        if (!courseCodeValue) {
          errors.push({ row: rowNumber, error: "Course code is required" });
          return;
        }
        if (!batchValue) {
          errors.push({ row: rowNumber, error: "Batch is required" });
          return;
        }

        // Validate batch format
        const batch = Number(batchValue);
        if (isNaN(batch) || batch < 1 || batch > 5) {
          errors.push({ row: rowNumber, error: "Invalid batch (must be 1-5)" });
          return;
        }

        if (row.s_id && row.course_code && row.batch) {
          assignments.push({
            s_id: String(row.s_id),
            course_code: String(row.course_code),
            batch: Number(batch),
          });
        }
      })
      .on("end", async () => {
        try {
          let successCount = 0;
          for (let i = 0; i < assignments.length; i++) {
            const { s_id, course_code, batch } = assignments[i];
            const rowNumber = i + 2; // +2 because we start from row 2 (after header)
            
            // 1. Check course exists and is elective
            const course = await Course.findOne({ code: course_code, isElective: true });
            if (!course) {
              errors.push({ row: rowNumber, error: `Course '${course_code}' not found or not elective` });
              continue;
            }
            
            // 2. Check faculty assignment exists for this course and batch
            const facultyAssignment = await CourseFacultyAssignment.findOne({
              course: course._id,
              batch: batch,
            });
            if (!facultyAssignment) {
              errors.push({ row: rowNumber, error: `No faculty assigned for course '${course_code}' and batch ${batch}` });
              continue;
            }
            
            // 3. Check if student exists
            const student = await Student.findOne({ id: s_id });
            if (!student) {
              errors.push({ row: rowNumber, error: `Student with ID '${s_id}' not found` });
              continue;
            }
            
            // 4. Check if assignment already exists
            const existingAssignment = await ElectiveStudentAssignment.findOne({
              s_id: s_id,
              "electives.electiveCourse": course._id,
              "electives.batch": batch
            });
            if (existingAssignment) {
              errors.push({ row: rowNumber, error: `Student '${s_id}' already assigned to course '${course_code}' in batch ${batch}` });
              continue;
            }
            
            // 5. Assign student to elective
            await ElectiveStudentAssignment.findOneAndUpdate(
              { s_id },
              {
                $addToSet: {
                  electives: {
                    electiveCourse: course._id,
                    batch,
                  },
                },
              },
              { upsert: true, new: true }
            );
            successCount++;
          }
          
          deleteFile();
          res.status(errors.length > 0 ? 207 : 201).json({
            message: `${successCount} student-elective assignments uploaded`,
            count: successCount,
            errors,
          });
        } catch (err) {
          deleteFile();
          res.status(500).json({ error: err.message });
        }
      })
      .on("error", (err) => {
        deleteFile();
        res.status(500).json({ error: err.message });
      });
  }
);

// PATCH: Update a student's elective assignment (batch or course)
router.patch(
  "/:studentId/:electiveCourseId",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    const { studentId, electiveCourseId } = req.params;
    const { batch, newElectiveCourseId } = req.body;
    try {
      // Find the assignment
      const assignment = await ElectiveStudentAssignment.findOne({
        s_id: studentId,
      });
      if (!assignment)
        return res.status(404).json({ message: "Assignment not found" });
      const elective = assignment.electives.find(
        (e) => e.electiveCourse.toString() === electiveCourseId
      );
      if (!elective)
        return res
          .status(404)
          .json({ message: "Elective not found for this student" });
      // Update fields
      if (batch) elective.batch = batch;
      if (newElectiveCourseId) elective.electiveCourse = newElectiveCourseId;
      await assignment.save();
      res.json({ message: "Assignment updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE: Remove a student's elective assignment
router.delete(
  "/:studentId/:electiveCourseId",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    const { studentId, electiveCourseId } = req.params;
    try {
      const assignment = await ElectiveStudentAssignment.findOne({
        s_id: studentId,
      });
      if (!assignment)
        return res.status(404).json({ message: "Assignment not found" });
      const initialLength = assignment.electives.length;
      assignment.electives = assignment.electives.filter(
        (e) => e.electiveCourse.toString() !== electiveCourseId
      );
      if (assignment.electives.length === initialLength) {
        return res
          .status(404)
          .json({ message: "Elective not found for this student" });
      }
      await assignment.save();
      res.json({ message: "Assignment deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET elective courses for a particular student
router.get(
  "/student/:id",
  verifyToken,
  requireRoles("student", "admin"),
  async (req, res) => {
    const electiveCourses = await ElectiveStudentAssignment.find(
      {
        s_id: req.params.id,
      },
      { electives: 1 }
    ).populate("electives.electiveCourse");
    if (!electiveCourses)
      return res
        .status(404)
        .json({ error: "No Elective Courses found for the given student id" });

    return res.status(200).json(electiveCourses);
  }
);

export default router;
