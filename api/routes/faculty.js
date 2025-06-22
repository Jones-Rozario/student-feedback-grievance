import express from "express";
import Faculty from "../models/faculty.js";
import CourseFacultyAssignment from "../models/courseFacultyAssignment.js";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get all faculties
router.get("/", async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get faculty by id
router.get("/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update faculty
router.put("/:id", async (req, res) => {
  try {
    const { name, id, designation } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, id, designation },
      { new: true }
    );
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete faculty
router.delete("/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    
    // Delete related assignments
    const deletedAssignments = await CourseFacultyAssignment.deleteMany({ faculty: String(faculty._id) });
    
    res.status(200).json({ 
      message: "Faculty deleted successfully",
      deletedAssignments: deletedAssignments.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload faculties from CSV
router.post("/upload-csv", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const facultiesToInsert = [];
  const allFacultyIdsInCsv = [];

  const processFile = async () => {
    const parser = fs
      .createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }));

    parser.on("data", (row) => {
      // Map frontend headers to backend schema fields
      const facultyData = {
        id: row["Faculty_ID"] || row["id"],
        name: row["Faculty_Name"] || row["name"],
        email: row["Email"] || row["email"],
        designation: row["Designation"] || row["designation"],
      };
      
      if (facultyData.id) {
        allFacultyIdsInCsv.push(facultyData.id);
        facultiesToInsert.push(facultyData);
      }
    });

    parser.on("end", async () => {
      try {
        // Find existing faculties from the CSV in one query
        const existingFaculties = await Faculty.find({
          id: { $in: allFacultyIdsInCsv },
        }).select("id");

        const existingFacultyIds = new Set(
          existingFaculties.map((f) => f.id)
        );

        // Filter out faculties that already exist
        const newFaculties = facultiesToInsert.filter(
          (faculty) => !existingFacultyIds.has(faculty.id)
        );

        if (newFaculties.length > 0) {
          const created = await Faculty.insertMany(newFaculties, { ordered: false });
          res.status(201).json({
            message: `${created.length} new faculties uploaded successfully.`,
            faculties: created,
          });
        } else {
          res.status(200).json({
            message: "No new faculties to upload. All faculties in the CSV already exist.",
          });
        }
      } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to insert faculties into database." });
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
