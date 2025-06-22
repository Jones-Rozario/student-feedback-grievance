import express from "express";
import User from "../models/user.js";
import Student from "../models/student.js";
import Faculty from "../models/faculty.js";

const router = express.Router();

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

  return semester; // cap at 8
}

// Generate password based on role
const generatePassword = (role, id, name) => {
  switch (role) {
    case "student":
      // Last digit of student ID
      return id.slice(-1);
    case "faculty":
      // First 4 characters of name + ID + predefined number (123)
      const namePrefix = name.substring(0, 4).toLowerCase();
      return `${namePrefix}${id}123`;
    case "admin":
      // Predefined admin password
      return "admin123";
    default:
      return "";
  }
};

// Create user accounts for existing students and faculties
router.post("/setup-users", async (req, res) => {
  try {
    // Create admin user
    const existingAdmin = await User.findOne({ id: "admin" });
    if (!existingAdmin) {
      const adminUser = new User({
        id: "admin",
        name: "Administrator",
        role: "admin",
        password: generatePassword("admin"),
        email: "admin@college.edu",
      });
      await adminUser.save();
    }

    // Create user accounts for all students
    const students = await Student.find();
    for (const student of students) {
      const existingUser = await User.findOne({ id: student.id });
      if (!existingUser) {
        const studentUser = new User({
          id: student.id,
          name: student.name,
          role: "student",
          password: generatePassword("student", student.id),
          studentRef: student._id,
        });
        await studentUser.save();
      }
    }

    // Create user accounts for all faculties
    const faculties = await Faculty.find();
    for (const faculty of faculties) {
      const existingUser = await User.findOne({ id: faculty.id });
      if (!existingUser) {
        const facultyUser = new User({
          id: faculty.id,
          name: faculty.name,
          role: "faculty",
          password: generatePassword("faculty", faculty.id, faculty.name),
          facultyRef: faculty._id,
        });
        await facultyUser.save();
      }
    }

    res.status(200).json({ message: "User accounts created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { id, password, role } = req.body;

    if (!id || !password || !role) {
      return res
        .status(400)
        .json({ error: "ID, password, and role are required" });
    }

    const user = await User.findOne({ id, role });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Fetch additional information based on role
    let additionalInfo = {};

    if (role === "student") {
      const studentInfo = await Student.findById(user.studentRef);
      if (studentInfo) {
        // Calculate current semester
        const calculatedSemester = calculateSemester(
          studentInfo.joined_year || Number(studentInfo.name.slice(0, 4))
        );

        // Check if calculated semester differs from stored semester
        if (calculatedSemester !== studentInfo.current_semester) {
          // Update the student's semester and reset feedback status
          await Student.findByIdAndUpdate(user.studentRef, {
            current_semester: calculatedSemester,
            isFeedbackGiven: false,
          });

          // Update the studentInfo object for response
          studentInfo.current_semester = calculatedSemester;
          studentInfo.isFeedbackGiven = false;
        }

        additionalInfo = {
          batch: studentInfo.batch,
          current_semester: studentInfo.current_semester,
          joined_year: studentInfo.joined_year,
          isFeedbackGiven: studentInfo.isFeedbackGiven,
        };
      }
    } else if (role === "faculty") {
      const facultyInfo = await Faculty.findById(user.facultyRef);
      if (facultyInfo) {
        additionalInfo = {
          designation: facultyInfo.designation,
        };
      }
    }

    // Return user info without password, including additional role-specific data
    const { password: _, ...userInfo } = user.toObject();
    const responseData = {
      ...userInfo,
      ...additionalInfo,
    };

    res.status(200).json({
      message: "Login successful",
      user: responseData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get password hint for a user
router.get("/password-hint/:id/:role", async (req, res) => {
  try {
    const { id, role } = req.params;

    if (role === "student") {
      const student = await Student.findOne({ id });
      if (student) {
        res.status(200).json({
          hint: `Password is the last digit of your ID: ${id.slice(-1)}`,
        });
      } else {
        res.status(404).json({ error: "Student not found" });
      }
    } else if (role === "faculty") {
      const faculty = await Faculty.findOne({ id });
      if (faculty) {
        const namePrefix = faculty.name.substring(0, 4).toLowerCase();
        res.status(200).json({
          hint: `Password format: ${namePrefix}[your_id]123`,
        });
      } else {
        res.status(404).json({ error: "Faculty not found" });
      }
    } else if (role === "admin") {
      res.status(200).json({ hint: "Admin password is predefined" });
    } else {
      res.status(400).json({ error: "Invalid role" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
