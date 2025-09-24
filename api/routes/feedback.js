import express from "express";
import Feedback from "../models/feedback.js";
import { requireRole, requireRoles, verifyToken } from "../middleware/auth.js";
import faculty from "../models/faculty.js";
import Assignments from "../models/courseFacultyAssignment.js";

const router = express.Router();

// Submit feedback
router.post("/", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const {
      academic_year,
      student,
      faculty,
      course,
      batch,
      semester,
      questionRating,
      additionalComments,
    } = req.body;

    // Check if feedback already exists for this student-course combination
    const existing = await Feedback.findOne({
      student,
      course,
      batch,
      semester,
    });

    if (existing) {
      return res.status(400).json({
        error: "Feedback already submitted for this course",
      });
    }

    // Calculate score: (sum of ratings / 55) * 25
    const totalRating = questionRating.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    const score = (totalRating / 55) * 25;

    console.log(
      `Score calculation: Total rating = ${totalRating}, Score = ${score.toFixed(
        2
      )}`
    );

    const feedback = new Feedback({
      academic_year,
      student,
      faculty,
      course,
      batch,
      semester,
      questionRating,
      additionalComments,
      score,
    });

    await feedback.save();
    res.status(201).json({
      message: "Feedback Submitted Successfully",
      feedback,
      score,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback by student
// router.get("/student/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const feedback = await Feedback.find({ student: studentId })
//       .populate("faculty", "name designation")
//       .populate("course", "name code")
//       .sort({ createdAt: -1 });

//     res.json(feedback);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get feedback by faculty
router.get(
  "/faculty/:facultyId",
  verifyToken,
  requireRoles("admin", "faculty"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const feedbacks = await Feedback.find({ faculty: facultyId })
        .populate("course", "name code")
        .sort({ createdAt: -1 });

      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// get avg score by faculty
router.get(
  "/faculty/avg/:facultyId",
  verifyToken,
  requireRoles("admin", "faculty"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const feedbacks = await Feedback.find({ faculty: facultyId })
        .populate("course", "name code")
        .sort({ createdAt: -1 });

      if (feedbacks.length === 0) {
        return res.json({
          averageScore: 0,
          message: "No feedback found for this faculty",
        });
      }

      const avgScore =
        feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;

      return res.json({
        averageScore: Math.round(avgScore * 100) / 100, // Round to 2 decimal places
      });
    } catch (error) {
      console.error("Error getting faculty average score:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);

// get avg ratings for questions
router.get(
  "/faculty/ratings/:facultyId",
  verifyToken,
  requireRoles("admin", "faculty"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const feedbacks = await Feedback.find(
        { faculty: facultyId },
        { questionRating: 1 }
      )
        .populate("course", "name code")
        .sort({ createdAt: -1 });

      if (feedbacks.length === 0) {
        return res.json({
          ratings: [],
          questions: [],
          message: "No feedback found for this faculty",
        });
      }

      // Get question text from the first feedback (all feedbacks should have same questions)
      const questionTexts = feedbacks[0].questionRating.map((q) => q.question);

      // Calculate average ratings for each question
      const questionCount = feedbacks[0].questionRating.length; // Number of questions
      const ratings = [];

      for (let i = 0; i < questionCount; i++) {
        const totalRating = feedbacks.reduce((sum, feedback) => {
          return sum + (feedback.questionRating[i]?.rating || 0);
        }, 0);
        ratings[i] = totalRating / feedbacks.length;
      }

      console.log("Average ratings for faculty:", facultyId, ratings);

      res.json({
        ratings,
        questions: questionTexts,
      });
    } catch (error) {
      console.error("Error getting faculty ratings:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get faculty courses with ratings
router.get(
  "/faculty/courses/:facultyId",
  verifyToken,
  requireRoles("admin", "faculty"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const feedbacks = await Feedback.find({ faculty: facultyId })
        .populate("course", "name code")
        .sort({ createdAt: -1 });

      if (feedbacks.length === 0) {
        return res.json({
          message: "No feedback found for this faculty",
        });
      }

      // Group feedbacks by course and calculate average ratings
      const courseRatings = {};
      const courseGroups = {};

      feedbacks.forEach((feedback) => {
        const courseId = feedback.course._id.toString();
        if (!courseGroups[courseId]) {
          courseGroups[courseId] = [];
        }
        courseGroups[courseId].push(feedback);
      });

      // Calculate average rating for each course
      Object.keys(courseGroups).forEach((courseId) => {
        const courseFeedbacks = courseGroups[courseId];
        const totalRating = courseFeedbacks.reduce((sum, feedback) => {
          const avgRating =
            feedback.questionRating.reduce((qSum, q) => qSum + q.rating, 0) /
            feedback.questionRating.length;
          return sum + avgRating;
        }, 0);
        courseRatings[courseId] = totalRating / courseFeedbacks.length;
      });

      res.json(courseRatings);
    } catch (error) {
      console.error("Error getting faculty course ratings:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get yearly performance data for faculty
router.get(
  "/faculty/yearly/:facultyId",
  verifyToken,
  requireRoles("admin", "faculty"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const feedbacks = await Feedback.find({ faculty: facultyId }).sort({
        createdAt: -1,
      });

      if (feedbacks.length === 0) {
        return res.json({
          message: "No feedback found for this faculty",
        });
      }

      // Group feedbacks by academic_year and calculate average scores
      const yearlyData = {};

      feedbacks.forEach((feedback) => {
        const year = feedback.academic_year;
        if (!year) return; // skip if missing
        if (!yearlyData[year]) {
          yearlyData[year] = [];
        }
        yearlyData[year].push(feedback.score);
      });

      // Calculate average score for each academic_year
      const yearlyPerformance = {};
      Object.keys(yearlyData).forEach((year) => {
        const scores = yearlyData[year];
        const avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        yearlyPerformance[year] = Math.round(avgScore * 100) / 100; // Round to 2 decimal places
      });

      res.json(yearlyPerformance);
    } catch (error) {
      console.error("Error getting faculty yearly performance:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get feedback by course
// router.get("/course/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const feedback = await Feedback.find({ course: courseId })
//       .populate("student", "name rollNumber")
//       .populate("faculty", "name designation")
//       .sort({ createdAt: -1 });

//     res.json(feedback);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Route to get consolidated feedback report data (JSON)
router.get("/faculty-feedback-report",verifyToken, requireRoles("admin"),  async (req, res) => {
  const academic_year = req.query.academic_year;

  try {
    const faculties = await faculty.find();

    const facultyReports = [];

    for (let i = 0; i < faculties.length; i++) {
      const faculty = faculties[i];

      // Get assignments for this faculty in that academic year
      const assignments = await Assignments.find({
        faculty: faculty._id,
        academic_year: academic_year,
      }).populate("course");

      const assignmentData = [];

      for (let j = 0; j < assignments.length; j++) {
        const a = assignments[j];

        // Find feedbacks matching assignment
        const feedbacks = await Feedback.find({
          faculty: faculty._id,
          course: a.course._id,
          batch: a.batch,
          semester: a.semester,
          academic_year,
        });

        // Compute average feedback
        let avgFeedback = 0;
        if (feedbacks.length > 0) {
          const sum = feedbacks.reduce((acc, fb) => acc + (fb.totalScore || 0), 0);
          avgFeedback = sum / feedbacks.length;
        }

        assignmentData.push({
          semester: a.semester,
          batch: a.batch,
          course: {
            code: a.course.code,
            name: a.course.name,
            regulation: a.course.regulation,
          },
          avgFeedback: Number(avgFeedback.toFixed(2)),
        });
      }

      // Compute totals
      const total = assignmentData.reduce((sum, a) => sum + a.avgFeedback, 0);
      const avg =
        assignmentData.length > 0 ? total / assignmentData.length : 0;

      facultyReports.push({
        name: faculty.name,
        designation: faculty.designation,
        academic_year,
        assignments: assignmentData,
        total: Number(total.toFixed(2)),
        average: Number(avg.toFixed(2)),
      });
    }

    res.json({
      success: true,
      data: facultyReports,
    });
  } catch (err) {
    console.error("Error fetching report data:", err);
    res.status(500).json({ message: "Error fetching report data", error: err });
  }
});



// Check if feedback already given for student-course combination
router.get(
  "/check/:studentId/:courseId/:batch/:semester",
  verifyToken,
  requireRoles("student", "admin"),
  async (req, res) => {
    try {
      const { studentId, courseId, batch, semester } = req.params;

      const existingFeedback = await Feedback.findOne({
        student: studentId,
        course: courseId,
        batch,
        semester: parseInt(semester),
      });

      if (existingFeedback) {
        res.json({
          exists: true,
          message: "Feedback already given for this course",
          feedback: existingFeedback,
        });
      } else {
        res.json({
          exists: false,
          message: "No feedback given yet",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all feedback (for admin)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("student", "name rollNumber")
      .populate("faculty", "name designation")
      .populate("course", "name code")
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
