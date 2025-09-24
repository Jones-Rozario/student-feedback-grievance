import React, { useEffect, useState } from "react";
import styles from "./FacultyTable.module.css";
import { apiAxios } from '../../../utils/api';
import BarChart from '../../../components/barchart';
import FeedbackReportButton from '../../../components/FeedbackReportButton';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logoPng from "../../../assests/anna_univ_logo.png";

const performanceColors = {
  High: styles.badgeHigh,
  Good: styles.badgeGood,
  Medium: styles.badgeMedium,
  Low: styles.badgeLow,
};

function FacultyPerformanceView({ faculty, onBack }) {
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});
  const [yearlyPerformance, setYearlyPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [courseBatchStats, setCourseBatchStats] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [semesterType, setSemesterType] = useState(""); 

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        // Fetch all courses assigned to this faculty (regular and elective, unified)
        const coursesResponse = await apiAxios().get(
          `/assignments/faculty/${faculty._id}`
        );
        let allAssignments = [];
        if (coursesResponse.data) {
          allAssignments = coursesResponse.data;
        }
        // Map assignments to include academic_year, batch, semester, isElective, etc.
        const allCourses = allAssignments.map((a) => ({
          course: a.course,
          batch: a.batch,
          semester: a.semester,
          academic_year: a.academic_year,
          isElective: a.course?.isElective,
        }));
        setFacultyCourses(allCourses);
        // Fetch yearly performance data (already includes all feedbacks)
        const yearlyResponse = await apiAxios().get(
          `/feedback/faculty/yearly/${faculty._id}`
        );
        if (yearlyResponse.data) {
          const yearlyData = yearlyResponse.data;
          setYearlyPerformance(yearlyData);
          // Set default academic year to latest if not set
          const years = Object.keys(yearlyData).sort();
          if (years.length > 0 && !selectedAcademicYear) {
            setSelectedAcademicYear(years[years.length - 1]);
          }
        }
        // Fetch per-course, per-batch, per-year stats for all courses
        const stats = {};
        for (const assignment of allCourses) {
          if (!assignment.course?._id || !assignment.batch || !assignment.academic_year) continue;
          const res = await apiAxios().get(
            `/faculties/${faculty._id}/performance/course/${assignment.course._id}/batch/${assignment.batch}/semester/${assignment.semester}?academic_year=${encodeURIComponent(assignment.academic_year)}`
          );
          if (res.data) {
            const data = res.data;
            stats[`${assignment.course._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`] = data;
          }
        }
        setCourseBatchStats(stats);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyData();
    // eslint-disable-next-line
  }, [faculty._id]);

  // Academic year options
  const academicYearOptions = Array.from(new Set(facultyCourses.map(c => c.academic_year))).sort();

  // Filter courses and stats by selected academic year
//  const filteredCourses = facultyCourses.filter(
 //   (c) => c.academic_year === selectedAcademicYear
 // );
  // Filter courses and stats by selected academic year + semester type
  const filteredCourses = facultyCourses.filter((c) => {
  const matchesYear = c.academic_year === selectedAcademicYear;
  if (!semesterType) return matchesYear; // no filter applied
  const sem = parseInt(c.semester, 10);
  if (semesterType === "odd") {
    return matchesYear && sem % 2 !== 0;
   } else if (semesterType === "even") {
    return matchesYear && sem % 2 === 0;
   }
   return matchesYear;
   });

  // Compute total feedbacks for selected year  
  const totalFeedbacks = filteredCourses.reduce((sum, assignment) => {
    const stat = courseBatchStats[
      `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
    ];
    return sum + (stat?.totalFeedbacks || 0);
  }, 0);
  // Compute overall average question-wise ratings for selected year
  const questionSums = [];
  const questionCounts = [];
  let questionTexts = [];
  filteredCourses.forEach((assignment) => {
    const stat = courseBatchStats[
      `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
    ];
    if (stat?.questionRatings && stat?.questionTexts) {
      stat.questionRatings.forEach((rating, i) => {
        if (!questionSums[i]) {
          questionSums[i] = 0;
          questionCounts[i] = 0;
          questionTexts[i] = stat.questionTexts[i];
        }
        questionSums[i] += rating;
        questionCounts[i] += 1;
      });
    }
  });
  const overallQuestionAverages = questionSums.map((sum, i) =>
    questionCounts[i] ? (sum / questionCounts[i]).toFixed(2) : "N/A"
  );

  console.log(courseRatings);

  // Convert question ratings array to object with actual question text
  const questionRatingsWithLabels = faculty.questionRatings
    ? faculty.questionRatings.map((rating, index) => ({
        label: faculty.questionTexts?.[index] || `Question ${index + 1}`,
        value: rating,
      }))
    : [];

  // Helper function to get performance level
  const getPerformanceLevel = (score) => {
    if (score >= 22) return "High";
    if (score >= 18) return "Good";
    if (score >= 15) return "Medium";
    return "Low";
  };

  // Helper function to get performance color
  const getPerformanceColor = (score) => {
    if (score >= 22) return "#1cc88a";
    if (score >= 18) return "#36b9cc";
    if (score >= 15) return "#f6c23e";
    return "#e74a3b";
  };
/*const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();

  filteredCourses.forEach((assignment, index) => {
    if (index !== 0) {
      doc.addPage();
    }

    const stat =
      courseBatchStats[
        `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
      ];

    // Header & Logo
    doc.addImage(logoPng, "PNG", 10, 10, 30, 28);
    doc.setFontSize(14);
    doc.text("ANNA UNIVERSITY :: CHENNAI - 600025", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("STUDENTS FEEDBACK FORM", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text("(Based on Higher Education G.O(Ms).No.19, dt 14/1/20)", 105, 34, {
      align: "center",
    });

    // Program name string
    let programStr = "";
    if (assignment.semester > 10) {
      if (assignment.batch === 1)
        programStr = "M.E - COMPUTER SCIENCE AND ENGINEERING";
      else if (assignment.batch === 2)
        programStr = "M.E - SOFTWARE ENGINEERING";
      else if (assignment.batch === 3)
        programStr = "M.E - CSE SPLN.IN BIG DATA ANALYTICS";
      else
        programStr =
          "M.E - CSE SPLN.IN CYBER SECURITY AND DATA SCIENCE";
    } else {
      programStr = "B.E - COMPUTER SCIENCE AND ENGINEERING [FULL TIME]";
    }

    const bodyRows = [
      ["Course", ":", programStr],
      [
        "Academic Year & Semester",
        ":",
        assignment.academic_year +
          " - " +
          (assignment.semester > 10
            ? assignment.semester - 10
            : assignment.semester || "-"),
      ],
      ["Subject", ":", assignment.course?.name || "-"],
      ["Instructor", ":", currentUser?.name || "-"],
      ["Batch", ":", assignment.batch || "-"],
    ];

    autoTable(doc, {
      startY: 40,
      theme: "plain",
      styles: { fontSize: 10 },
      body: bodyRows,
      tableLineWidth: 0.1,
      tableLineColor: [0, 0, 0],
      margin: { left: 20, right: 20 },
    });

    // Feedback table
    const feedbackRows = (stat?.questionTexts || []).map((q, i) => [
      `${i + 1}. ${q}`,
      typeof stat?.questionRatings?.[i] === "number"
        ? stat.questionRatings[i].toFixed(2)
        : "N/A",
    ]);

    feedbackRows.push([
      "Average Score",
      stat?.questionRatings
        ? (
            stat.questionRatings.reduce((sum, q) => sum + q, 0) /
            stat.questionRatings.length
          ).toFixed(2)
        : "N/A",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [["", "Out of 5"]],
      body: feedbackRows,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "center" } },
      margin: { left: 20, right: 20, top: 20 },
    });

    // Footer with timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(
      `This is system generated report from DCSE, Anna University, Chennai-25, and does not require signature. ${timestamp}`,
      105,
      pageHeight - 10,
      { align: "center" }
    );
  });

  const safeFacultyName = (currentUser?.name || "faculty").replace(/\s+/g, "_");
  doc.save(`Faculty_Report_${safeFacultyName}_${selectedAcademicYear}.pdf`);
};

const handleDownloadPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor = "#4e73df"; // blue for headers
  const secondaryColor = "#f1f3f7"; // light grey background for rows
  const textColor = "#333333";

  // Fonts
  const fontNormal = "helvetica";
  const fontBold = "helvetica";
  
  // Helper function: draw section header with background and icon
  const drawSectionHeader = (y, text) => {
    const padding = 2;
    const fontSize = 12;
    doc.setFillColor(primaryColor);
    doc.setDrawColor(primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontBold, "bold");
    doc.setFontSize(fontSize);
    
    const textX = 10; // icon + margin
    const textWidth = doc.getTextWidth(text);
    const rectWidth = textWidth + 10;

    // Background rectangle
    doc.rect(10, y - fontSize, rectWidth,  7, "F");

    // Icon
    //doc.text(icon, 12, y);

    // Text
    doc.text(text, textX, y);

    // Reset color for text below
    doc.setTextColor(textColor);
  };

  // Add logo
  const imgProps = doc.getImageProperties(logoPng);
  const logoWidth = 40;
  const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
  doc.addImage(logoPng, "PNG", 10, 10, logoWidth, logoHeight);

  let y = logoHeight + 20;

  // Faculty Info Section
  doc.setFont(fontBold, "bold");
  doc.text(`Faculty Performance Report - ${faculty.name}`, 12 , y);
  y += 12;
  doc.setFontSize(12);
  doc.setFont(fontNormal, "normal");
  doc.text(`Designation: ${faculty.designation}`, 12, y);
  y += 7;
  //doc.text(`Faculty ID: ${faculty.id}`, 12, y);
  y += 14;

  // Academic Year & Semester Section
  doc.setFont(fontBold, "bold");
  doc.text("Academic Details", 12, y);
  y += 12;
  doc.text(`Academic Year: ${selectedAcademicYear}`, 12, y);
  doc.text(`Semester: ${semesterType || "All"}`, pageWidth / 2, y);
  y += 14;

  // Overall Performance Section
  doc.setFont(fontBold, "bold");
  doc.text("Overall Performance", 12, y);
  y += 12;
  const overallScore = yearlyPerformance[selectedAcademicYear];
  doc.setFontSize(13);
  doc.text(
    `Overall Performance Score: ${
      typeof overallScore === "number" ? overallScore.toFixed(2) : "N/A"
    } / 25`,
    12,
    y
  );
  y += 12;

  // Overall Question-wise Average Ratings - table style
  doc.setFontSize(12);
  doc.setFont(fontBold, "bold");
  doc.text("Average Question-wise Ratings:", 12, y);
  y += 8;

  // Draw table headers background
  doc.setFillColor(primaryColor);
  doc.rect(12, y - 7, pageWidth - 24, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.text("Question", 14, y);
  doc.text("Avg Rating", pageWidth - 40, y);
  doc.setTextColor(textColor);
  y += 10;

  doc.setFont(fontNormal, "normal");
  overallQuestionAverages.forEach((avg, i) => {
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
    // Alternating row shading
    if (i % 2 === 0) {
      doc.setFillColor(secondaryColor);
      doc.rect(12, y - 6, pageWidth - 24, 8, "F");
    }
    doc.text(questionTexts[i], 14, y);
    doc.text(`${avg} / 5`, pageWidth - 40, y);
    y += 8;
  });

  y += 12;

  // Courses Section
  doc.setFont(fontBold, "bold");
  doc.text(`Course-wise Performance (${filteredCourses.length})`, 12, y);
  y += 14;

  filteredCourses.forEach((assignment, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 10;
    }

    const stat =
      courseBatchStats[
        `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
      ];

    // Course Title
    doc.setFont(fontBold, "bold");
    doc.setFontSize(13);
    doc.setTextColor(primaryColor);
    const courseTitle = `${idx + 1}. ${assignment.course?.name || "Unknown Course"} ${
      assignment.isElective ? "(Elective)" : ""
    }`;
    doc.text(courseTitle, 12, y);
    y += 9;

    doc.setFont(fontNormal, "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.text(`Course Code: ${assignment.course?.code || "N/A"}`, 14, y);
    y += 6;

    doc.text(
      `Semester: ${
        assignment.semester > 10 ? assignment.semester - 10 : assignment.semester
      }`,
      14,
      y
    );
    y += 6;

    doc.text(
      `Batch: ${
        assignment.semester > 10
          ? {
              1: "M.E CSE",
              2: "M.E SE",
              3: "M.E CSE (SP.) BDA",
              4: "M.E CSE (SP.) Cyber security and Data Science",
            }[assignment.batch] || assignment.batch
          : assignment.batch
      }`,
      14,
      y
    );
    y += 6;

    doc.text(`Academic Year: ${assignment.academic_year}`, 14, y);
    y += 6;

    doc.text(
      `Total Feedbacks: ${stat?.totalFeedbacks ?? "N/A"}`,
      14,
      y
    );
    y += 8;

    if (stat?.avgScore) {
      doc.text(
        `Batch Avg Score: ${stat.avgScore.toFixed(2)} / 25`,
        14,
        y
      );
      y += 6;
    }

    if (stat?.questionRatings && stat?.questionTexts) {
      // Draw question ratings in table form
      doc.setFont(fontBold, "bold");
      doc.text("Question Ratings:", 14, y);
      y += 8;

      // Header background for ratings
      doc.setFillColor(primaryColor);
      doc.rect(14, y - 6, pageWidth - 28, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Question", 16, y);
      doc.text("Rating", pageWidth - 50, y);
      doc.setTextColor(textColor);
      y += 8;

      doc.setFont(fontNormal, "normal");
      stat.questionRatings.forEach((rating, i) => {
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
        if (i % 2 === 0) {
          doc.setFillColor(secondaryColor);
          doc.rect(14, y - 6, pageWidth - 28, 8, "F");
        }
        doc.text(stat.questionTexts[i], 16, y);
        doc.text(rating.toFixed(1), pageWidth - 50, y);
        y += 8;
      });
      y += 8;
    }

    // Divider line
    doc.setDrawColor("#cccccc");
    doc.line(12, y, pageWidth - 12, y);
    y += 12;
  });

  // Save file with filename safe format
  const safeFacultyName = faculty.name.replace(/\s+/g, "_");
  doc.save(`Faculty_Report_${safeFacultyName}_${selectedAcademicYear}.pdf`);
};*/

const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();

  filteredCourses.forEach((assignment, index) => {
    if (index !== 0) {
      doc.addPage();
    }

    const stat =
      courseBatchStats[
        `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
      ];

    // Header & Logo
    doc.addImage(logoPng, "PNG", 10, 10, 30, 28);
    doc.setFontSize(14);
    doc.text("ANNA UNIVERSITY :: CHENNAI - 600025", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("STUDENTS FEEDBACK FORM", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text("(Based on Higher Education G.O(Ms).No.19, dt 14/1/20)", 105, 34, {
      align: "center",
    });

    // Program name string
    let programStr = "";
    if (assignment.semester > 10) {
      if (assignment.batch === 1)
        programStr = "M.E - COMPUTER SCIENCE AND ENGINEERING";
      else if (assignment.batch === 2)
        programStr = "M.E - SOFTWARE ENGINEERING";
      else if (assignment.batch === 3)
        programStr = "M.E - CSE SPLN.IN BIG DATA ANALYTICS";
      else
        programStr = "M.E - CSE SPLN.IN CYBER SECURITY AND DATA SCIENCE";
    } else {
      programStr = "B.E - COMPUTER SCIENCE AND ENGINEERING [FULL TIME]";
    }

    const bodyRows = [
      ["Course", ":", programStr],
      [
        "Academic Year & Semester",
        ":",
        assignment.academic_year +
          " - " +
          (assignment.semester > 10
            ? assignment.semester - 10
            : assignment.semester || "-"),
      ],
      ["Subject", ":", assignment.course?.name || "-"],
      ["Instructor", ":", faculty?.name || "-"],
      ["Designation", ":", faculty?.designation || "-"],
      ["Batch", ":", assignment.batch || "-"],
    ];

    autoTable(doc, {
      startY: 40,
      theme: "plain",
      styles: { fontSize: 10 },
      body: bodyRows,
      tableLineWidth: 0.1,
      tableLineColor: [0, 0, 0],
      margin: { left: 20, right: 20 },
    });

    // Feedback table
    const feedbackRows = (stat?.questionTexts || []).map((q, i) => [
      `${i + 1}. ${q}`,
      typeof stat?.questionRatings?.[i] === "number"
        ? stat.questionRatings[i].toFixed(2)
        : "N/A",
    ]);

    // Add overall average
    feedbackRows.push([
      "Average Score",
      stat?.questionRatings
        ? (
            stat.questionRatings.reduce((sum, q) => sum + q, 0) /
            stat.questionRatings.length
          ).toFixed(2)
        : "N/A",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [["", "Out of 5"]],
      body: feedbackRows,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "center" } },
      margin: { left: 20, right: 20, top: 20 },
    });

    // Footer with timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(
      `This is system generated report from DCSE, Anna University, Chennai-25, and does not require signature. ${timestamp}`,
      105,
      pageHeight - 10,
      { align: "center" }
    );
  });

  const safeFacultyName = (faculty?.name || "faculty").replace(/\s+/g, "_");
  doc.save(`Faculty_Report_${safeFacultyName}_${selectedAcademicYear}.pdf`);
};

  if (loading) {
    return (
      <div className={styles.performanceViewWrapper}>
        <button className={styles.backButton} onClick={onBack}>
          &larr; Back to List
        </button>
        <div className={styles.loadingMessage}>Loading faculty data...</div>
      </div>
    );
  }

  return (
    <div className={styles.performanceViewWrapper}>
      <button className={styles.backButton} onClick={onBack}>
        &larr; Back to List
      </button>

      {/* Faculty Header */}
      <div className={styles.performanceHeader}>
        <div className={styles.performanceAvatar}>
          {faculty.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className={styles.performanceName}>{faculty.name}</div>
          <div className={styles.performanceDesignation}>
            {faculty.designation}
          </div>
          <div className={styles.performanceId}>ID: {faculty.id}</div>
        </div>
      </div>
      {/* Academic Year Selector */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <label htmlFor="academicYearSelect" style={{ fontWeight: 600, marginRight: 8 }}>
          Academic Year:
        </label>
        <select
          id="academicYearSelect"
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          style={{ padding: "8px 16px", borderRadius: 4, fontSize: 16 }}
        >
          {academicYearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
   
	  <label htmlFor="semesterSelect" style={{ marginLeft: "16px", fontWeight: 600 }}>Semester:</label>
  		<select value={semesterType} onChange={(e) => setSemesterType(e.target.value)}  style={{ padding: "8px 16px", borderRadius: 4, fontSize: 16 }}>
    			<option value="">All</option>
              		  <option value="odd">Odd</option>
                           <option value="even">Even</option>
                </select>
	<div style={{ textAlign: "center", marginBottom: "20px" }}>
	  <button className={styles.downloadButton} onClick={handleDownloadPDF}>
    		Download Report PDF for {selectedAcademicYear}
  	  </button>
	</div>
      </div>
      {/* Overall Performance Score */}
      <div className={styles.overallScoreSection}>
        <h3>Overall Performance Score</h3>
        <div className={styles.scoreCard}>
          <div className={styles.scoreValue}>
            {(() => {
              const score = yearlyPerformance[selectedAcademicYear];
              if (typeof score !== "number") return "0.00";
              return Number(score).toFixed(2);
            })()}
            <span className={styles.scoreMax}>/25</span>
          </div>
          <div className={styles.scoreLabel}>
            <span
              className={`${styles.badge} ${
                styles[`badge${getPerformanceLevel(faculty.avgScore)}`]
              }`}
            >
              {getPerformanceLevel(faculty.avgScore)} Performance
            </span>
          </div>
        </div>
      </div>
      {/* Question Ratings */}
      {overallQuestionAverages.length > 0 && (
        <div className={styles.section}>
          <h3>Average Question-wise Ratings (Selected Academic Year)</h3>
          <div className={styles.metricsGrid}>
            {overallQuestionAverages.map((avg, i) => (
              <div className={styles.metricCard} key={i}>
                <div className={styles.metricLabel}>{questionTexts[i]}</div>
                <div className={styles.metricStars}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span
                      key={j}
                      className={
                        j < Math.round(Number(avg))
                          ? styles.starFilled
                          : styles.starEmpty
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className={styles.metricValue}>{avg}/5</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Courses Taken */}
      {filteredCourses.length > 0 && (
        <div className={styles.section}>
          <h3>Courses Taken</h3>
          <div className={styles.coursesGrid}>
            {filteredCourses.map((assignment, index) => {
              const stat =
                courseBatchStats[
                  `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}_${assignment.semester}`
                ];
              const avgRating =
                stat && stat.questionRatings && stat.questionRatings.length > 0
                  ? stat.questionRatings.reduce((a, b) => a + b, 0) /
                    stat.questionRatings.length
                  : 0;
              const isExpanded = expandedIndex === index;
              return (
                <div
                  className={
                    styles.courseCard +
                    (isExpanded ? " " + styles.expandedCourseCard : "")
                  }
                  key={index}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  style={{
                    cursor: "pointer",
                    boxShadow: isExpanded
                      ? "0 4px 16px rgba(52, 152, 219, 0.25)"
                      : "0 2px 4px rgba(0,0,0,0.08)",
                    border: isExpanded
                      ? "2px solid #3498db"
                      : "1px solid #e0e0e0",
                    transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
                    marginBottom: "1rem",
                  }}
                >
                  <div className={styles.courseHeader}>
                    <h4 style={{ color: isExpanded ? "#3498db" : undefined }}>
                      {assignment.course?.name || "Unknown Course"}
                      {assignment.isElective && (
                        <span
                          style={{
                            color: "#e67e22",
                            fontSize: 13,
                            marginLeft: 8,
                          }}
                        >
                          (Elective)
                        </span>
                      )}
                    </h4>
                    <span className={styles.courseCode}>
                      {assignment.course?.code || "N/A"}
                    </span>
                  </div>
                  <div className={styles.courseDetails}>
                    <div className={styles.courseInfo}>
                      {!assignment.isElective && (
                        <span>Semester: {assignment.semester>10?(assignment.semester-10):assignment.semester}</span>
                      )}
                     
                      <span>
      Batch:{" "}
      {assignment.semester > 10 ? (
        {
          1: "M.E CSE",
          2: "M.E SE",
          3: "M.E CSE (SP.) BDA",
          4: "M.E CSE (SP.) Cyber security and Data Science",
        }[assignment.batch] || assignment.batch
      ) : (
        assignment.batch
      )}
    </span>

			<span>Academic Year: {assignment.academic_year}</span>
                      <span>
                        Total Feedbacks: {stat?.totalFeedbacks ?? "N/A"}
                      </span>
                    </div>
                    <div className={styles.courseRating}>
                      <div className={styles.ratingStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < avgRating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className={styles.ratingValue}>
                        {avgRating.toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                  {/* Per-course, per-batch stats, only show if expanded */}
                  {isExpanded && stat && (
                    <div
                      className={styles.courseBatchStats}
                      style={{
                        background: "#f4faff",
                        borderRadius: "8px",
                        marginTop: "1rem",
                        padding: "1rem",
                        border: "1px solid #d0e6f7",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "#2980b9" }}>
                        Batch Avg Score: {" "}
                        {stat.avgScore ? stat.avgScore.toFixed(2) : "N/A"}/25
                      </div>
                      {stat.questionRatings &&
                        stat.questionRatings.length > 0 && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <strong>Question Ratings:</strong>
                            <ol style={{ margin: 0, paddingLeft: 20 }}>
                              {stat.questionRatings.map((rating, i) => (
                                <li key={i} style={{ marginBottom: 4 }}>
                                  <span style={{ color: "#34495e" }}>
                                    {stat.questionTexts[i]}
                                  </span>
                                  :
                                  <span
                                    style={{ color: "black", fontWeight: 500 }}
                                  >
                                    {"  " + rating.toFixed(1)}/5
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                    </div>
                  )}
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <span style={{ color: "#3498db", fontSize: 13 }}>
                      {isExpanded ? "Click to collapse ▲" : "Click to expand ▼"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Yearly Performance Graph */}
      {academicYearOptions.length > 0 && (
        <div className={styles.section}>
          <h3>Performance by Year</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BarChart
              labels={academicYearOptions}
              data={academicYearOptions.map((year) => yearlyPerformance[year])}
              label="Performance"
              backgroundColor="#4e73df"
            />
          </div>
        </div>
      )}
      {/* No Data Message */}
      {filteredCourses.length === 0 && (
        <div className={styles.noDataMessage}>
          <p>
            No course assignments or performance data available for the selected
            academic year.
          </p>
        </div>
      )}
    </div>
  );
}

const FacultyTable = () => {
  const [faculties, setFaculties] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    designation: "",
    performance: "",
  });
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("");

  console.log(styles);

  const getFaculties = async () => {
    try {
      setLoading(true);
      // Get all faculties
      let response = await apiAxios().get("/faculties");
      if (response.data) {
        const facultiesData = response.data;
        console.log("Faculties data:", facultiesData);

        // Fetch average scores and ratings for each faculty
        const facultiesWithStats = await Promise.all(
          facultiesData.map(async (faculty) => {
            try {
              // Get average score for this faculty
              const avgResponse = await apiAxios().get(
                `/feedback/faculty/avg/${faculty._id}`
              );
              let avgScore = 0;
              if (avgResponse.data) {
                const avgData = avgResponse.data;
                avgScore = avgData.averageScore || 0;
              }

              // Get average ratings for each question
              const ratingsResponse = await apiAxios().get(
                `/feedback/faculty/ratings/${faculty._id}`
              );
              let questionRatings = [];
              let questionTexts = [];
              if (ratingsResponse.data) {
                const ratingsData = ratingsResponse.data;
                questionRatings = ratingsData.ratings || [];
                questionTexts = ratingsData.questions || [];
              }
              
              return {
                ...faculty,
                avgScore: avgScore,
                questionRatings: questionRatings,
                questionTexts: questionTexts,
              };
            } catch (error) {
              console.error(
                `Error fetching stats for faculty ${faculty._id}:`,
                error
              );
              return {
                ...faculty,
                avgScore: 0,
                questionRatings: [],
                questionTexts: [],
              };
            }
          })
        );
        
        setFaculties(facultiesWithStats);
        console.log("Faculties with stats:", facultiesWithStats);
      } else {
        throw new Error("Failed to fetch faculties");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFaculties();
  }, []);

  const handleEdit = (faculty) => {
    setEditingFaculty({ ...faculty });
  };

  const handleUpdate = async () => {
    if (!editingFaculty) return;

    try {
      const response = await apiAxios().put(`/faculties/${editingFaculty._id}`, {
        name: editingFaculty.name,
        designation: editingFaculty.designation,
      });

      if (response.data) {
        const updatedFaculty = response.data;
        setFaculties(faculties.map(f => (f._id === updatedFaculty._id ? updatedFaculty : f)));
        setEditingFaculty(null);
        alert("Faculty updated successfully.");
      } else {
        const err = response.data;
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to update faculty:", error);
      alert("An error occurred while updating the faculty.");
    }
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm("Are you sure you want to delete this faculty? This will also remove all their feedback scores and course assignments.")) {
      try {
        const response = await apiAxios().delete(`/faculties/${facultyId}`);

        if (response.data) {
          setFaculties(faculties.filter(f => f._id !== facultyId));
          alert("Faculty deleted successfully.");
        } else {
          const err = response.data;
          alert(`Error: ${err.error}`);
        }
      } catch (error) {
        console.error("Failed to delete faculty:", error);
        alert("An error occurred while deleting the faculty.");
      }
    }
  };

  const filteredData = faculties.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.id.toLowerCase().includes(search.toLowerCase());
    const matchesDesignation = filter.designation
      ? fac.designation && fac.designation.toLowerCase() === filter.designation.toLowerCase()
      : true;
    const matchesPerformance = filter.performance
      ? (() => {
          if (filter.performance === "High" && fac.avgScore >= 22) return true;
          if (filter.performance === "Good" && fac.avgScore >= 18 && fac.avgScore < 22) return true;
          if (filter.performance === "Medium" && fac.avgScore >= 15 && fac.avgScore < 18) return true;
          if (filter.performance === "Low" && fac.avgScore < 15) return true;
          return false;
        })()
      : true;
    return matchesSearch && matchesDesignation && matchesPerformance;
  });

  // Helper function to get performance level based on average score
  const getPerformanceLevel = (score) => {
    if (score >= 22) return "High";
    if (score >= 18) return "Good";
    if (score >= 15) return "Medium";
    return "Low";
  };

  // Helper function to get average rating from question ratings
  const getAverageRating = (questionRatings) => {
    if (!questionRatings || questionRatings.length === 0) return 0;
    const total = questionRatings.reduce((sum, rating) => sum + rating, 0);
    return total / questionRatings.length;
  };

  if (selectedFaculty) {
    return (
      <FacultyPerformanceView
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
    );
  }



const generateAllFacultyReport = async (academicYearInput) => {
  const doc = new jsPDF();

  // Step 1: Fetch all faculties
 const faculties = await apiAxios().get("/faculties").then(res => res.data);

  for (let fIndex = 0; fIndex < faculties.length; fIndex++) {
    const faculty = faculties[fIndex];

    // Add new page for each faculty except first
    if (fIndex !== 0) doc.addPage();

    
    doc.addImage(logoPng, "PNG", 10, 10, 30, 28);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("ANNA UNIVERSITY :: CHENNAI - 600025", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("STUDENTS FEEDBACK FORM", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text("(Based on Higher Education G.O(Ms).No.19, dt 14/1/20)", 105, 34, {
      align: "center",
    });

    // Faculty details section
    const facultyDetails = [
      ["Faculty Name", ":", faculty.name || "-"],
      ["Designation", ":", faculty.designation || "-"],
      ["Academic Year", ":", academicYearInput],
    ];

    autoTable(doc, {
      startY: 45,
      theme: "plain",
      styles: { fontSize: 10 },
      body: facultyDetails,
      margin: { left: 20, right: 20 },
    });

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("STUDENTS FEEDBACK REPORT", 105, doc.lastAutoTable.finalY + 10, {
      align: "center",
    });

    // Step 2: Fetch faculty assignments
    
    const assignments = await apiAxios()
  .get(`/assignments/faculty/${faculty._id}`)
  .then(res => res.data);

    
    const tableRows = [];
    let total = 0;
    let count = 0;

    // Step 3: For each assignment, fetch batch performance
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      const perf = await apiAxios()
  .get(`/faculties/${faculty._id}/performance/course/${assignment.course?._id}/batch/${assignment.batch}/semester/${assignment.semester}?academic_year=${academicYearInput}`)
  .then(res => res.data);

      const avgScore = perf?.avgScore || 0;
      total += avgScore;
      count++;

      tableRows.push([
        i + 1,
        assignment.academic_year || academicYearInput,
        assignment.semester > 10 ? assignment.semester - 10 : assignment.semester,
        assignment.course?.code || "-",
        assignment.course?.name || "-",
        assignment.semester > 10 ? (
        {
          1: "M.E CSE",
          2: "M.E SE",
          3: "M.E CSE (SP.) BDA",
          4: "M.E CSE (SP.) Cyber security and Data Science",
        }[assignment.batch] || assignment.batch
      ) : (
        assignment.batch
      )
 || "-",
        
        avgScore.toFixed(2) == 0.00 ? "N/A" : avgScore.toFixed(2),
      ]);
    }

    // Step 4: Build Feedback Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [
        [
          "S.No",
          "Academic Year",
          "Semester",
          "Subject Code",
          "Subject Name",
          "Batch",
          
          "Avg Feedback (/25)",
        ],
      ],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      margin: { left: 15, right: 15 },
    });

    // Step 5: Totals
    const finalY = doc.lastAutoTable.finalY + 8;
    const timestamp = new Date().toLocaleString()
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${total.toFixed(2) == 0 ? "N/A" : total.toFixed(2)}`, 20, finalY);
    doc.text(
      `AVERAGE RATING: ${(count > 0 ? ((total / count) == 0.0 ? "N/A": (total/count).toFixed(2)) : "N/A")}`,
      120,
      finalY
    );

    // Step 6: Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `This is system generated report from DCSE, Anna University, Chennai - 25, and doesn't require a signature, ${timestamp}`,
      105,
      285,
      { align: "center" }
    );
  }

  // Save final PDF
  doc.save(`Faculty_Report_${academicYearInput}.pdf`);
};

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3 style={{ color: "grey", fontWeight: "400" }}>
          Loading faculties...
        </h3>
      </div>
    );
  }

  return (
    <div className={styles.facultyTableWrapper}>
      <div className={styles.headerRow}>
        <h2>Faculties</h2>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filter.performance}
          onChange={(e) =>
            setFilter((f) => ({ ...f, performance: e.target.value }))
          }
        >
          <option value="">Performance</option>
          <option value="High">High</option>
          <option value="Good">Good</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filter.designation}
          onChange={(e) =>
            setFilter((f) => ({ ...f, designation: e.target.value }))
          }
        >
          <option value="">Designation</option>
          <option value="Professor">Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
	  <option value="Associate Professor">Associate Professor</option>
	  <option value="Assistant Professor(Sr. Gr.)">Assistant Professor(Sr. Gr.)</option>
	  <option value="Assistant Professor(Sl. Gr.)">Assistant Professor(Sl. Gr.)</option>
          <option value="Teaching Fellow">Teaching Fellow</option> 
	  <option value="HOD">HOD</option>
        </select>
	
	<div style={{ textAlign: "center", margin: "20px" }}>
      <label style={{ fontWeight: 600, marginRight: "10px" }}>
        Academic Year:
      </label>
      <input
        type="text"
        placeholder="e.g. 2024 - 2025"
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
        style={{
          padding: "8px 16px",
          borderRadius: "6px",
          fontSize: 14,
          border: "1px solid #ccc",
          outline: "none",
          width: "160px",
        }}
      />

      <button
         onClick={() => {
    if (!academicYear) {
      alert("Please enter an academic year before downloading.");
      return;
    }
    generateAllFacultyReport(academicYear);
  }}
        style={{
          marginLeft: "15px",
          padding: "8px 20px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#3498db",
          color: "white",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.3s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2c80b4")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3498db")}
      >
        Download Consolidated Report
      </button>
    </div>

      </div>
      {editingFaculty && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h2>Edit Faculty</h2>
            <input
              type="text"
              value={editingFaculty.name}
              onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
              placeholder="Name"
            />
            <input
              type="text"
              value={editingFaculty.designation}
              onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
              placeholder="Designation"
            />
            <div className={styles.modalActions}>
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditingFaculty(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <table className={styles.facultyTable}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Avg Score</th>
            <th>Performance</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>


          {filteredData.sort((a,b)=> a.id-b.id).map((fac, idx) => (
            <tr
              key={idx}
              className={styles.tableRow}
            >
	
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>{idx + 1}</td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>{fac.id}</td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>
                <span className={styles.avatar}>
                  {fac.name.charAt(0).toUpperCase()}
                </span>{" "}
                {fac.name}
              </td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>{fac.designation}</td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>{fac.avgScore ? fac.avgScore.toFixed(2) : "0.00"}/25</td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>
                <span
                  className={`${styles.badge} ${
                    performanceColors[getPerformanceLevel(fac.avgScore)]
                  }`}
                >
                  {getPerformanceLevel(fac.avgScore)}
                </span>
              </td>
              <td onClick={() => setSelectedFaculty(fac)} style={{cursor: 'pointer'}}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < getAverageRating(fac.questionRatings)
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  >
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: "5px", fontSize: "12px" }}>
                  ({getAverageRating(fac.questionRatings).toFixed(1)}/5)
                </span>
              </td>
              <td>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleEdit(fac)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(fac._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyTable;
