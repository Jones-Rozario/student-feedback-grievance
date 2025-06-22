import React, { useEffect, useState } from "react";
import styles from "./FacultyTable.module.css";

const facultyData = [
  {
    id: "622356",
    name: "Priya",
    avatar: "A",
    course: "Database Management System",
    batch: "P",
    designation: "Teaching Faculty",
    performance: "Low",
    rating: 2,
    courses: [
      {
        name: "Course 1",
        metrics: {
          "Teaching Efficiency": 4,
          "Course Content Quality": 4,
          "Communication Skills": 4,
          "Student Engagement": 4,
          Innovative: 4,
        },
        yearlyStats: { 2020: 3, 2021: 4, 2022: 4 },
      },
    ],
  },
  {
    id: "622356",
    name: "Amudha",
    avatar: "A",
    course: "Database Management System",
    batch: "P",
    designation: "Teaching Faculty",
    performance: "High",
    rating: 5,
    courses: [
      {
        name: "Course 1",
        metrics: {
          "Teaching Efficiency": 5,
          "Course Content Quality": 5,
          "Communication Skills": 5,
          "Student Engagement": 5,
          Innovative: 5,
        },
        yearlyStats: { 2020: 4, 2021: 5, 2022: 5 },
      },
    ],
  },
  {
    id: "622356",
    name: "Saradha",
    avatar: "S",
    course: "Database Management System",
    batch: "P",
    designation: "Teaching Faculty",
    performance: "High",
    rating: 5,
    courses: [
      {
        name: "Course 1",
        metrics: {
          "Teaching Efficiency": 5,
          "Course Content Quality": 5,
          "Communication Skills": 5,
          "Student Engagement": 5,
          Innovative: 5,
        },
        yearlyStats: { 2020: 4, 2021: 5, 2022: 5 },
      },
    ],
  },
  {
    id: "622356",
    name: "Ganesh",
    avatar: "G",
    course: "Database Management System",
    batch: "P",
    designation: "Teaching Faculty",
    performance: "Medium",
    rating: 3,
    courses: [
      {
        name: "Course 1",
        metrics: {
          "Teaching Efficiency": 3,
          "Course Content Quality": 3,
          "Communication Skills": 3,
          "Student Engagement": 3,
          Innovative: 3,
        },
        yearlyStats: { 2020: 2, 2021: 3, 2022: 3 },
      },
    ],
  },
  {
    id: "622356",
    name: "Kirthicka",
    avatar: "K",
    course: "Database Management System",
    batch: "P",
    designation: "Teaching Faculty",
    performance: "Medium",
    rating: 4,
    courses: [
      {
        name: "Course 1",
        metrics: {
          "Teaching Efficiency": 4,
          "Course Content Quality": 4,
          "Communication Skills": 4,
          "Student Engagement": 4,
          Innovative: 4,
        },
        yearlyStats: { 2020: 3, 2021: 4, 2022: 4 },
      },
    ],
  },
];

const performanceColors = {
  High: styles.badgeHigh,
  Medium: styles.badgeMedium,
  Low: styles.badgeLow,
};

function FacultyPerformanceView({ faculty, onBack }) {
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});
  const [yearlyPerformance, setYearlyPerformance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses assigned to this faculty
        const coursesResponse = await fetch(
          `http://localhost:5000/api/assignments/faculty/${faculty._id}`
        );
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setFacultyCourses(coursesData);
        }

        // Fetch yearly performance data
        const yearlyResponse = await fetch(
          `http://localhost:5000/api/feedback/faculty/yearly/${faculty._id}`
        );
        if (yearlyResponse.ok) {
          const yearlyData = await yearlyResponse.json();
          setYearlyPerformance(yearlyData);
        }

        // Fetch course-specific ratings
        const courseRatingsResponse = await fetch(
          `http://localhost:5000/api/feedback/faculty/courses/${faculty._id}`
        );
        if (courseRatingsResponse.ok) {
          const courseRatingsData = await courseRatingsResponse.json();
          setCourseRatings(courseRatingsData);
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [faculty._id]);

  const years = Object.keys(yearlyPerformance).sort();

  // Convert question ratings array to object with actual question text
  const questionRatingsWithLabels = faculty.questionRatings ? 
    faculty.questionRatings.map((rating, index) => ({
      label: faculty.questionTexts?.[index] || `Question ${index + 1}`,
      value: rating
    })) : [];

  // Helper function to get performance level
  const getPerformanceLevel = (score) => {
    if (score >= 20) return "High";
    if (score >= 15) return "Medium";
    return "Low";
  };

  // Helper function to get performance color
  const getPerformanceColor = (score) => {
    if (score >= 20) return "#1cc88a";
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

      {/* Overall Performance Score */}
      <div className={styles.overallScoreSection}>
        <h3>Overall Performance Score</h3>
        <div className={styles.scoreCard}>
          <div className={styles.scoreValue}>
            {faculty.avgScore ? faculty.avgScore.toFixed(2) : "0.00"}
            <span className={styles.scoreMax}>/25</span>
          </div>
          <div className={styles.scoreLabel}>
            <span className={`${styles.badge} ${styles[`badge${getPerformanceLevel(faculty.avgScore)}`]}`}>
              {getPerformanceLevel(faculty.avgScore)} Performance
            </span>
          </div>
        </div>
      </div>

      {/* Question Ratings */}
      {questionRatingsWithLabels.length > 0 && (
        <div className={styles.section}>
          <h3>Question-wise Ratings</h3>
          <div className={styles.metricsGrid}>
            {questionRatingsWithLabels.map(({ label, value }, index) => (
              <div className={styles.metricCard} key={index}>
                <div className={styles.metricLabel}>{label}</div>
                <div className={styles.metricStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < value ? styles.starFilled : styles.starEmpty}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className={styles.metricValue}>{value.toFixed(1)}/5</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses Taken */}
      {facultyCourses.length > 0 && (
        <div className={styles.section}>
          <h3>Courses Taken</h3>
          <div className={styles.coursesGrid}>
            {facultyCourses.map((assignment, index) => {
              const courseRating = courseRatings[assignment.course?._id] || 0;
              return (
                <div className={styles.courseCard} key={index}>
                  <div className={styles.courseHeader}>
                    <h4>{assignment.course?.name || 'Unknown Course'}</h4>
                    <span className={styles.courseCode}>
                      {assignment.course?.code || 'N/A'}
                    </span>
                  </div>
                  <div className={styles.courseDetails}>
                    <div className={styles.courseInfo}>
                      <span>Semester: {assignment.semester}</span>
                      <span>Batch: {assignment.batch}</span>
                    </div>
                    <div className={styles.courseRating}>
                      <div className={styles.ratingStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < courseRating ? styles.starFilled : styles.starEmpty}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className={styles.ratingValue}>
                        {courseRating.toFixed(1)}/5
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yearly Performance Graph */}
      {years.length > 0 && (
        <div className={styles.section}>
          <h3>Performance by Year</h3>
          <div className={styles.barChartWrapper}>
            <div className={styles.barChart}>
              {years.map((year) => {
                const value = yearlyPerformance[year];
                const displayValue = typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : 'N/A';
                return (
                  <div className={styles.barChartBarWrapper} key={year}>
                    <div
                      className={styles.barChartBar}
                      style={{
                        height: value && typeof value === 'number' ? `${(value / 25) * 100}%` : '0%',
                        background: getPerformanceColor(value),
                        transition: "height 0.6s cubic-bezier(.4,2,.6,1)",
                      }}
                    ></div>
                    <div className={styles.barChartValue}>
                      {displayValue}
                    </div>
                    <div className={styles.barChartYear}>{year}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {facultyCourses.length === 0 && years.length === 0 && questionRatingsWithLabels.length === 0 && (
        <div className={styles.noDataMessage}>
          <p>No course assignments or performance data available for this faculty.</p>
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

  useEffect(() => {
    const getFaculties = async () => {
      try {
        // Get all faculties
        let response = await fetch("http://localhost:5000/api/faculties");
        if (response.ok) {
          const facultiesData = await response.json();
          console.log("Faculties data:", facultiesData);

          // Fetch average scores and ratings for each faculty
          const facultiesWithStats = await Promise.all(
            facultiesData.map(async (faculty) => {
              try {
                // Get average score for this faculty
                const avgResponse = await fetch(
                  `http://localhost:5000/api/feedback/faculty/avg/${faculty._id}`
                );
                let avgScore = 0;
                if (avgResponse.ok) {
                  const avgData = await avgResponse.json();
                  avgScore = avgData.averageScore || 0;
                }

                // Get average ratings for each question
                const ratingsResponse = await fetch(
                  `http://localhost:5000/api/feedback/faculty/ratings/${faculty._id}`
                );
                let questionRatings = [];
                let questionTexts = [];
                if (ratingsResponse.ok) {
                  const ratingsData = await ratingsResponse.json();
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
      }
    };

    getFaculties();
  }, []);

  const filteredData = faculties.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.id.toLowerCase().includes(search.toLowerCase());
    const matchesDesignation = filter.designation
      ? fac.designation === filter.designation
      : true;
    const matchesPerformance = filter.performance
      ? (() => {
          if (filter.performance === "High" && fac.avgScore >= 20) return true;
          if (
            filter.performance === "Medium" &&
            fac.avgScore >= 15 &&
            fac.avgScore < 20
          )
            return true;
          if (filter.performance === "Low" && fac.avgScore < 15) return true;
          return false;
        })()
      : true;
    return matchesSearch && matchesDesignation && matchesPerformance;
  });

  // Helper function to get performance level based on average score
  const getPerformanceLevel = (score) => {
    if (score >= 20) return "High";
    if (score >= 15) return "Medium";
    return "Low";
  };

  // Helper function to get average rating from question ratings
  const getAverageRating = (questionRatings) => {
    if (!questionRatings || questionRatings.length === 0) return 0;
    const total = questionRatings.reduce((sum, rating) => sum + rating, 0);
    return total / questionRatings.length;
  };

  console.log(selectedFaculty);

  if (selectedFaculty) {
    return (
      <FacultyPerformanceView
        faculty={selectedFaculty}
        onBack={() => setSelectedFaculty(null)}
      />
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
          <option value="Teaching Faculty">Teaching Faculty</option>
        </select>
      </div>
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
          </tr>
        </thead>
        <tbody>
          {filteredData.map((fac, idx) => (
            <tr
              key={idx}
              className={styles.tableRow}
              onClick={() => setSelectedFaculty(fac)}
              style={{ cursor: "pointer" }}
            >
              <td>{idx + 1}</td>
              <td>{fac.id}</td>
              <td>
                <span className={styles.avatar}>
                  {fac.name.charAt(0).toUpperCase()}
                </span>{" "}
                {fac.name}
              </td>
              <td>{fac.designation}</td>
              <td>{fac.avgScore ? fac.avgScore.toFixed(2) : "0.00"}/25</td>
              <td>
                <span
                  className={`${styles.badge} ${
                    performanceColors[getPerformanceLevel(fac.avgScore)]
                  }`}
                >
                  {getPerformanceLevel(fac.avgScore)}
                </span>
              </td>
              <td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyTable;
