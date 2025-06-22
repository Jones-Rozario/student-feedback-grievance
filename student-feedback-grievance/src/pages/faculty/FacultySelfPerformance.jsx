import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import styles from "./FacultySelfPerformance.module.css";

const FacultySelfPerformance = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(currentUser);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/api/faculties/${currentUser.facultyRef}/performance`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load performance data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load performance data");
        setLoading(false);
      });
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  const {
    faculty,
    avgScore,
    questionRatings,
    questionTexts,
    courses,
    yearlyPerformance,
  } = data;

  // Prepare bar chart data
  const years = Object.keys(yearlyPerformance).sort();
  const yearScores = years.map((y) => yearlyPerformance[y]);
  const bestYear = years.length
    ? years[yearScores.indexOf(Math.max(...yearScores))]
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>{faculty.name[0]}</div>
        <div>
          <h2>{faculty.name}</h2>
          <p>{faculty.designation}</p>
        </div>
      </div>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3>Overall Score</h3>
          <div className={styles.score}>
            {avgScore ? avgScore.toFixed(2) : "N/A"}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Best Year</h3>
          <div>{bestYear || "-"}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Courses Taken</h3>
          <div>{courses.length}</div>
        </div>
      </div>
      <div className={styles.section}>
        <h3>Question-wise Ratings</h3>
        <ul>
          {questionTexts.map((q, i) => (
            <li key={i}>
              <strong>{q}:</strong>{" "}
              {typeof questionRatings[i] === "number"
                ? questionRatings[i].toFixed(2)
                : "N/A"}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.section}>
        <h3>Courses</h3>
        <table className={styles.coursesTable}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Batch</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={i}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.batch}</td>
                <td>{c.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.section}>
        <h3>Yearly Performance</h3>
        {years.length ? (
          <Bar
            data={{
              labels: years,
              datasets: [
                {
                  label: "Average Score",
                  data: yearScores,
                  backgroundColor: "#4e73df",
                },
              ],
            }}
            options={{
              scales: {
                y: { beginAtZero: true, max: 10 },
              },
            }}
          />
        ) : (
          <div>No yearly data available.</div>
        )}
      </div>
    </div>
  );
};

export default FacultySelfPerformance;
