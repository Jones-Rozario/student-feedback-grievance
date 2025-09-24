import React, { useState } from "react";
import { generateFacultyReport } from "../utils/generateFacultyReport";

export default function FacultyReportButton() {
  const [academicYear, setAcademicYear] = useState("");

  const handleDownload = () => {
    if (!academicYear) {
      alert("Please enter an academic year (e.g., 2024 - 2025)");
      return;
    }
    generateFacultyReport(academicYear);
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <label style={{ fontWeight: 600, marginRight: "10px" }}>
        Academic Year:
      </label>
      <input
        type="text"
        placeholder="e.g. 2024-2025"
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
        onClick={handleDownload}
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
  );
}
