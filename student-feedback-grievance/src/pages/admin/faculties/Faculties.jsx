import React, { useEffect, useState } from "react";
import styles from "./FacultyTable.module.css";
import { apiAxios } from '../../../utils/api';
import BarChart from '../../../components/barchart';


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
            `/faculties/${faculty._id}/performance/course/${assignment.course._id}/batch/${assignment.batch}?academic_year=${encodeURIComponent(assignment.academic_year)}`
          );
          if (res.data) {
            const data = res.data;
            stats[`${assignment.course._id}_${assignment.batch}_${assignment.academic_year}`] = data;
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
  const filteredCourses = facultyCourses.filter(
    (c) => c.academic_year === selectedAcademicYear
  );
  // Compute total feedbacks for selected year  
  const totalFeedbacks = filteredCourses.reduce((sum, assignment) => {
    const stat = courseBatchStats[
      `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}`
    ];
    return sum + (stat?.totalFeedbacks || 0);
  }, 0);
  // Compute overall average question-wise ratings for selected year
  const questionSums = [];
  const questionCounts = [];
  let questionTexts = [];
  filteredCourses.forEach((assignment) => {
    const stat = courseBatchStats[
      `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}`
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
                  `${assignment.course?._id}_${assignment.batch}_${assignment.academic_year}`
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
                        <span>Semester: {assignment.semester}</span>
                      )}
                      <span>Batch: {assignment.batch}</span>
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
          <option value="HOD">HOD</option>
        </select>
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
          {filteredData.map((fac, idx) => (
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
