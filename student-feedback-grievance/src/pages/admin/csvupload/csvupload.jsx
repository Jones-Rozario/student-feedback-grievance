import React, { useState } from "react";
import { FaUpload, FaDownload, FaFileCsv } from "react-icons/fa";
import "./csvupload.css";

const CSVUpload = () => {
  const [uploadType, setUploadType] = useState("student");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [courseSemester, setCourseSemester] = useState(1);
  const [courseFile, setCourseFile] = useState(null);
  const [courseUploading, setCourseUploading] = useState(false);
  const [courseUploadStatus, setCourseUploadStatus] = useState("");
  const [coursePreviewData, setCoursePreviewData] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setUploadStatus("");
      previewCSV(selectedFile);
    } else {
      setUploadStatus("Please select a valid CSV file");
      setFile(null);
      setPreviewData(null);
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((header) => header.trim());
      const previewRows = lines.slice(1, 6).map((line) => {
        const values = line.split(",").map((value) => value.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });
      setPreviewData({ headers, rows: previewRows });
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      // Simulate API call - replace with actual backend endpoint
      const endpoint =
        uploadType === "student"
          ? "http://localhost:5000/api/students/upload-csv"
          : "http://localhost:5000/api/faculties/upload-csv";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      console.log(response);
      if (response.ok) {
        setUploadStatus(
          "File uploaded successfully! Data has been imported to the database."
        );
        setFile(null);
        setPreviewData(null);
        // Reset file input
        document.getElementById("csv-file-input").value = "";
      } else {
        setUploadStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      setUploadStatus(
        "Upload failed. Please check your connection and try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    let template = "";
    let filename = "";
    if (uploadType === "student") {
      template = `Student_ID,Student_Name,Email,Semester,Batch,Joined_Year\n2023103001,John Doe,john.doe@example.com,5,A,2021\n2023103002,Jane Smith,jane.smith@example.com,5,A,2021`;
      filename = "student_template.csv";
    } else {
      template = `Faculty_ID,Faculty_Name,Email,Designation\nF001,Dr. Smith,smith@example.com,Professor\nF002,Prof. Johnson,johnson@example.com,Associate Professor`;
      filename = "faculty_template.csv";
    }
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCourseFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setCourseFile(selectedFile);
      setCourseUploadStatus("");
      previewCourseCSV(selectedFile);
    } else {
      setCourseUploadStatus("Please select a valid CSV file");
      setCourseFile(null);
      setCoursePreviewData(null);
    }
  };

  const previewCourseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((header) => header.trim());
      const previewRows = lines.slice(1, 6).map((line) => {
        const values = line.split(",").map((value) => value.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });
      setCoursePreviewData({ headers, rows: previewRows });
    };
    reader.readAsText(file);
  };

  const handleCourseUpload = async () => {
    if (!courseFile) {
      setCourseUploadStatus("Please select a file first");
      return;
    }
    setCourseUploading(true);
    setCourseUploadStatus("Uploading...");
    try {
      const formData = new FormData();
      formData.append("file", courseFile);
      const response = await fetch("http://localhost:5000/api/courses/upload-csv", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setCourseUploadStatus(
          "Courses uploaded successfully for Semester " + courseSemester + "!"
        );
        setCourseFile(null);
        setCoursePreviewData(null);
        document.getElementById("course-csv-file-input").value = "";
      } else {
        setCourseUploadStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      setCourseUploadStatus(
        "Upload failed. Please check your connection and try again."
      );
    } finally {
      setCourseUploading(false);
    }
  };

  const downloadCourseTemplate = () => {
    const template = `Course_Code,Course_Name,Credits,Department\nCS101,Mathematics I,4,Computer Science\nCS102,Physics,3,Computer Science\nCS103,Chemistry,3,Computer Science`;
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courses_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-upload">
      <div className="csv-upload__header">
        <h2>CSV Data Upload</h2>
        <p>Upload CSV file containing student or faculty information</p>
      </div>

      <div className="csv-upload__content">
        <div className="csv-upload__section">
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="upload-type-select"
              style={{ fontWeight: 500, marginRight: 8 }}
            >
              Select Upload Type:
            </label>
            <select
              id="upload-type-select"
              value={uploadType}
              onChange={(e) => {
                setUploadType(e.target.value);
                setFile(null);
                setPreviewData(null);
                setUploadStatus("");
                document.getElementById("csv-file-input").value = "";
              }}
              style={{
                padding: "0.5rem",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            >
              <option value="student">Student Details</option>
              <option value="faculty">Faculty Details</option>
            </select>
          </div>
          <h2>Upload CSV File for student and faculty details</h2>
          <div className="csv-upload__upload-area">
            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="csv-upload__file-input"
            />
            <label htmlFor="csv-file-input" className="csv-upload__file-label">
              <FaFileCsv className="csv-upload__icon" />
              <span>Choose CSV file or drag and drop</span>
            </label>
          </div>

          {file && (
            <div className="csv-upload__file-info">
              <p>
                <strong>Selected file:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="csv-upload__upload-btn"
          >
            <FaUpload /> {uploading ? "Uploading..." : "Upload to Database"}
          </button>

          {uploadStatus && (
            <div
              className={`csv-upload__status ${
                uploadStatus.includes("successfully") ? "success" : "error"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        <div className="csv-upload__section">
          <h3>Download Template</h3>
          <p>
            Download the CSV template to see the required format for the
            selected type
          </p>
          <button
            onClick={downloadTemplate}
            className="csv-upload__template-btn"
          >
            <FaDownload /> Download Template
          </button>
        </div>

        {previewData && (
          <div className="csv-upload__section">
            <h3>Data Preview (First 5 rows)</h3>
            <div className="csv-upload__preview">
              <table>
                <thead>
                  <tr>
                    {previewData.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="csv-upload__section">
          <h3>Instructions</h3>
          <div className="csv-upload__instructions">
            <ul>
              {uploadType === "student" ? (
                <>
                  <li>
                    CSV file should contain columns: id, name, current_semester,
                    batch, joined_year
                  </li>
                  <li>Each subsequent row should contain student data</li>
                </>
              ) : (
                <>
                  <li>
                    CSV file should contain columns: id, name, designation
                  </li>
                  <li>Each subsequent row should contain faculty data</li>
                </>
              )}
              <li>First row should contain column headers</li>
              <li>Make sure all required fields are filled</li>
              <li>Email addresses should be valid format</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="csv-upload__section">
          <h1>Upload Courses for Semester</h1>
          <div className="csv-upload__upload-area">
            <input
              type="file"
              id="course-csv-file-input"
              accept=".csv"
              onChange={handleCourseFileChange}
              className="csv-upload__file-input"
            />
            <label
              htmlFor="course-csv-file-input"
              className="csv-upload__file-label"
            >
              <FaFileCsv className="csv-upload__icon" />
              <span>Choose CSV file or drag and drop</span>
            </label>
          </div>
          {courseFile && (
            <div className="csv-upload__file-info">
              <p>
                <strong>Selected file:</strong> {courseFile.name}
              </p>
              <p>
                <strong>Size:</strong> {(courseFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
          <button
            onClick={handleCourseUpload}
            disabled={!courseFile || courseUploading}
            className="csv-upload__upload-btn"
          >
            <FaUpload /> {courseUploading ? "Uploading..." : "Upload Courses"}
          </button>
          {courseUploadStatus && (
            <div
              className={`csv-upload__status ${
                courseUploadStatus.includes("successfully")
                  ? "success"
                  : "error"
              }`}
            >
              {courseUploadStatus}
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <h4>Download Courses CSV Template</h4>
            <button
              onClick={downloadCourseTemplate}
              className="csv-upload__template-btn"
            >
              <FaDownload /> Download Template
            </button>
          </div>
          {coursePreviewData && (
            <div className="csv-upload__preview">
              <h4>Data Preview (First 5 rows)</h4>
              <table>
                <thead>
                  <tr>
                    {coursePreviewData.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coursePreviewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {coursePreviewData.headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div
            className="csv-upload__instructions"
            style={{ marginTop: "1rem" }}
          >
            <ul>
              <li>
                CSV file should contain columns: code, name, semester
              </li>
              <li>First row should contain column headers</li>
              <li>
                Each subsequent row should contain course data for the selected
                semester
              </li>
              <li>Make sure all required fields are filled</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
