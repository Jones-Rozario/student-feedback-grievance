import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaDownload, FaFileCsv } from "react-icons/fa";
import "./csvupload.css";
import { apiAxios } from "../../../utils/api";

const CSVUpload = ({ onUploadSuccess }) => {
  const [uploadType, setUploadType] = useState("student");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadErrors, setUploadErrors] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [courseSemester, setCourseSemester] = useState(1);
  const [courseFile, setCourseFile] = useState(null);
  const [courseUploading, setCourseUploading] = useState(false);
  const [courseUploadStatus, setCourseUploadStatus] = useState("");
  const [courseUploadErrors, setCourseUploadErrors] = useState([]);
  const [coursePreviewData, setCoursePreviewData] = useState(null);
  const [electiveFile, setElectiveFile] = useState(null);
  const [electiveUploading, setElectiveUploading] = useState(false);
  const [electiveUploadStatus, setElectiveUploadStatus] = useState("");
  const [electivePreviewData, setElectivePreviewData] = useState(null);
  const [electiveCourses, setElectiveCourses] = useState([]);
  const [selectedElective, setSelectedElective] = useState("");
  const [studentElectiveFile, setStudentElectiveFile] = useState(null);
  const [studentElectiveUploading, setStudentElectiveUploading] =
    useState(false);
  const [studentElectiveUploadStatus, setStudentElectiveUploadStatus] =
    useState("");
  const [studentElectiveUploadErrors, setStudentElectiveUploadErrors] = useState([]);
  const [studentElectivePreviewData, setStudentElectivePreviewData] =
    useState(null);

  // Add state for course-faculty assignment upload
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentUploading, setAssignmentUploading] = useState(false);
  const [assignmentUploadStatus, setAssignmentUploadStatus] = useState("");
  const [assignmentPreviewData, setAssignmentPreviewData] = useState(null);
  const [assignmentUploadErrors, setAssignmentUploadErrors] = useState([]);

  // Fetch elective courses for dropdown
  useEffect(() => {
    const fetchElectives = async () => {
      const response = await apiAxios().get("/courses?isElective=true");
      if (response.data) {
        setElectiveCourses(response.data);
      }
    };

    fetchElectives();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
      setUploadErrors([]);
      previewCSV(selectedFile);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
      setPreviewData(null);
      setUploadErrors([]);
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

  const uploadUrl =
    uploadType === "student" ? "/students/upload-csv" : "/faculties/upload-csv";

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    setUploadErrors([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await apiAxios().post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
        setUploadErrors(response.data.errors || []);
        onUploadSuccess && onUploadSuccess();
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      setError("Upload failed");
      if (err.response && err.response.data && err.response.data.errors) {
        setUploadErrors(err.response.data.errors);
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    let template = "";
    let filename = "";
    if (uploadType === "student") {
      template = `id,name,batch,joined_year\n`;
      filename = "student_template.csv";
    } else {
      template = `id,name,email,designation\n`;
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
      setCourseUploadErrors([]);
      previewCourseCSV(selectedFile);
    } else {
      setCourseUploadStatus("Please select a valid CSV file");
      setCourseFile(null);
      setCoursePreviewData(null);
      setCourseUploadErrors([]);
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
    setCourseUploadErrors([]);
    try {
      const formData = new FormData();
      formData.append("file", courseFile);
      const response = await apiAxios().post("/courses/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.message) {
        setCourseUploadStatus(response.data.message);
        setCourseUploadErrors(response.data.errors || []);
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
      if (error.response && error.response.data && error.response.data.errors) {
        setCourseUploadErrors(error.response.data.errors);
      }
    } finally {
      setCourseUploading(false);
    }
  };

  const downloadCourseTemplate = () => {
    const template = `code,name,regulation,isElective\n`;
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courses_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Remove all state, handlers, and UI for elective course CSV upload
  // Only keep course-faculty assignment upload logic
  const handleStudentElectiveFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setStudentElectiveFile(selectedFile);
      setStudentElectiveUploadStatus("");
      setStudentElectiveUploadErrors([]);
      previewStudentElectiveCSV(selectedFile);
    } else {
      setStudentElectiveUploadStatus("Please select a valid CSV file");
      setStudentElectiveFile(null);
      setStudentElectivePreviewData(null);
      setStudentElectiveUploadErrors([]);
    }
  };
  const previewStudentElectiveCSV = (file) => {
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
      setStudentElectivePreviewData({ headers, rows: previewRows });
    };
    reader.readAsText(file);
  };
  const handleStudentElectiveUpload = async () => {
    if (!studentElectiveFile) {
      setStudentElectiveUploadStatus("Please select a file");
      return;
    }
    setStudentElectiveUploading(true);
    setStudentElectiveUploadStatus("Uploading...");
    setStudentElectiveUploadErrors([]);
    try {
      const formData = new FormData();
      formData.append("file", studentElectiveFile);
      const response = await apiAxios().post(
        "/elective-student-assignments/upload-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.message) {
        setStudentElectiveUploadStatus(response.data.message);
        setStudentElectiveUploadErrors(response.data.errors || []);
        setStudentElectiveFile(null);
        setStudentElectivePreviewData(null);
        document.getElementById("student-elective-csv-file-input").value = "";
      } else {
        setStudentElectiveUploadStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      setStudentElectiveUploadStatus(
        "Upload failed. Please check your connection and try again."
      );
      if (error.response && error.response.data && error.response.data.errors) {
        setStudentElectiveUploadErrors(error.response.data.errors);
      }
    } finally {
      setStudentElectiveUploading(false);
    }
  };
  const downloadStudentElectiveTemplate = () => {
    const template = `s_id,course_code,batch\n`;
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_elective_assignment_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAssignmentFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setAssignmentFile(selectedFile);
      setAssignmentUploadStatus("");
      setAssignmentUploadErrors([]);
      previewAssignmentCSV(selectedFile);
    } else {
      setAssignmentUploadStatus("Please select a valid CSV file");
      setAssignmentFile(null);
      setAssignmentPreviewData(null);
      setAssignmentUploadErrors([]);
    }
  };

  const previewAssignmentCSV = (file) => {
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
      setAssignmentPreviewData({ headers, rows: previewRows });
    };
    reader.readAsText(file);
  };

  const handleAssignmentUpload = async () => {
    if (!assignmentFile) {
      setAssignmentUploadStatus("Please select a file first");
      return;
    }
    setAssignmentUploading(true);
    setAssignmentUploadStatus("Uploading...");
    setAssignmentUploadErrors([]);
    try {
      const formData = new FormData();
      formData.append("file", assignmentFile);
      const response = await apiAxios().post(
        "/assignments/upload-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.message) {
        setAssignmentUploadStatus(response.data.message);
        setAssignmentFile(null);
        setAssignmentPreviewData(null);
        setAssignmentUploadErrors(response.data.errors || []);
        document.getElementById("assignment-csv-file-input").value = "";
      } else {
        setAssignmentUploadStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      setAssignmentUploadStatus(
        "Upload failed. Please check your connection and try again."
      );
      if (error.response && error.response.data && error.response.data.errors) {
        setAssignmentUploadErrors(error.response.data.errors);
      }
      console.log(error);
    } finally {
      setAssignmentUploading(false);
    }
  };

  const downloadAssignmentTemplate = () => {
    const assignmentTemplate = `academic_year,semester,batch,course,faculty\n`;
    const blob = new Blob([assignmentTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "course_faculty_assignment_template.csv";
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
                setError("");
                setUploadErrors([]);
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
            <label htmlFor="csv-file-input" className="csv-upload__file-label">
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                onChange={handleFileChange}
                className="csv-upload__file-input"
              />
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

          {error && <div className="csv-upload__status error">{error}</div>}
          {success && (
            <div className="csv-upload__status success">{success}</div>
          )}
          {uploadErrors.length > 0 && (
            <div className="csv-upload__status error">
              <h4>Errors:</h4>
              <ul>
                {uploadErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
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
                    CSV file should contain columns: <strong>id</strong> (unique student ID), name, current_semester, batch, joined_year
                  </li>
                  <li><strong>id</strong> is the unique identifier for each student. Do not use email as id.</li>
                  <li>Each subsequent row should contain student data</li>
                </>
              ) : (
                <>
                  <li>
                    CSV file should contain columns: <strong>id</strong> (unique faculty ID), name, <strong>email</strong>, designation
                  </li>
                  <li><strong>id</strong> is the unique identifier for each faculty. Email is required for password reset.</li>
                  <li>Each subsequent row should contain faculty data</li>
                </>
              )}
              <li>First row should contain column headers</li>
              <li>Make sure all required fields are filled</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="csv-upload__section">
          <h1>Upload Courses</h1>
          <div className="csv-upload__upload-area">
            <label
              htmlFor="course-csv-file-input"
              className="csv-upload__file-label"
            >
              <input
                type="file"
                id="course-csv-file-input"
                accept=".csv"
                onChange={handleCourseFileChange}
                className="csv-upload__file-input"
              />
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
          {courseUploadErrors.length > 0 && (
            <div className="csv-upload__status error">
              <h4>Errors:</h4>
              <ul>
                {courseUploadErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
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
              <li>CSV file should contain columns: code, name, regulation, isElective</li>
              <li>First row should contain column headers</li>
              <li>Each subsequent row should contain course data</li>
              <li>isElective should be 'true' or 'false' (case sensitive)</li>
              <li>Make sure all required fields are filled</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="csv-upload__section">
          <h1>Assign Students to Elective Courses</h1>
          <div className="csv-upload__upload-area">
            <label
              htmlFor="student-elective-csv-file-input"
              className="csv-upload__file-label"
            >
              <input
                type="file"
                id="student-elective-csv-file-input"
                accept=".csv"
                onChange={handleStudentElectiveFileChange}
                className="csv-upload__file-input"
              />
              <FaFileCsv className="csv-upload__icon" />
              <span>Choose CSV file or drag and drop</span>
            </label>
          </div>
          {studentElectiveFile && (
            <div className="csv-upload__file-info">
              <p>
                <strong>Selected file:</strong> {studentElectiveFile.name}
              </p>
              <p>
                <strong>Size:</strong> {(studentElectiveFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
          <button
            onClick={handleStudentElectiveUpload}
            disabled={!studentElectiveFile || studentElectiveUploading}
            className="csv-upload__upload-btn"
          >
            <FaUpload /> {studentElectiveUploading ? "Uploading..." : "Assign Students to Electives"}
          </button>
          {studentElectiveUploadStatus && (
            <div
              className={`csv-upload__status ${
                studentElectiveUploadStatus.includes("successfully")
                  ? "success"
                  : "error"
              }`}
            >
              {studentElectiveUploadStatus}
            </div>
          )}
          {studentElectiveUploadErrors.length > 0 && (
            <div className="csv-upload__status error">
              <h4>Errors:</h4>
              <ul>
                {studentElectiveUploadErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <h4>Download Student-Elective Assignment CSV Template</h4>
            <button
              onClick={downloadStudentElectiveTemplate}
              className="csv-upload__template-btn"
            >
              <FaDownload /> Download Template
            </button>
          </div>
          {studentElectivePreviewData && (
            <div className="csv-upload__preview">
              <h4>Data Preview (First 5 rows)</h4>
              <table>
                <thead>
                  <tr>
                    {studentElectivePreviewData.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentElectivePreviewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {studentElectivePreviewData.headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="csv-upload__instructions" style={{ marginTop: "1rem" }}>
            <ul>
              <li>CSV file should contain columns: s_id, course_code, batch</li>
              <li>First row should contain column headers</li>
              <li>Each subsequent row should contain student id, elective course code, and batch</li>
              <li>Batch should be a number between 1 and 5</li>
              <li>Course code must be for an elective course with a faculty assigned for that batch</li>
              <li>Make sure all required fields are filled</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        <div className="csv-upload__section">
          <h2>Upload Course-Faculty Assignments</h2>
          <div className="csv-upload__upload-area">
            <label
              htmlFor="assignment-csv-file-input"
              className="csv-upload__file-label"
            >
              <input
                type="file"
                id="assignment-csv-file-input"
                accept=".csv"
                onChange={handleAssignmentFileChange}
                className="csv-upload__file-input"
              />
              <FaFileCsv className="csv-upload__icon" />
              <span>Choose CSV file or drag and drop</span>
            </label>
          </div>
          {assignmentFile && (
            <div className="csv-upload__file-info">
              <p>
                <strong>Selected file:</strong> {assignmentFile.name}
              </p>
              <p>
                <strong>Size:</strong> {(assignmentFile.size / 1024).toFixed(2)}{" "}
                KB
              </p>
            </div>
          )}
          <button
            onClick={handleAssignmentUpload}
            disabled={!assignmentFile || assignmentUploading}
            className="csv-upload__upload-btn"
          >
            <FaUpload />{" "}
            {assignmentUploading ? "Uploading..." : "Upload Assignments"}
          </button>
          {assignmentUploadStatus && (
            <div
              className={`csv-upload__status ${
                assignmentUploadStatus.includes("success") ? "success" : "error"
              }`}
            >
              {assignmentUploadStatus}
            </div>
          )}
          {assignmentUploadErrors.length > 0 && (
            <div className="csv-upload__status error">
              <h4>Errors:</h4>
              <ul>
                {assignmentUploadErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={downloadAssignmentTemplate}
            className="csv-upload__template-btn"
            style={{ marginTop: 12 }}
          >
            <FaDownload /> Download Assignment Template
          </button>
          {assignmentPreviewData && (
            <div className="csv-upload__section">
              <h3>Data Preview (First 5 rows)</h3>
              <div className="csv-upload__preview">
                <table>
                  <thead>
                    <tr>
                      {assignmentPreviewData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentPreviewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {assignmentPreviewData.headers.map(
                          (header, colIndex) => (
                            <td key={colIndex}>{row[header]}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="csv-upload__instructions" style={{ marginTop: "1rem" }}>
            <h4>Course-Faculty Assignment Format Instructions:</h4>
            <ul>
              <li><strong>CSV file should contain columns:</strong> academic_year, semester, batch, course, faculty</li>
              <li><strong>academic_year:</strong> The academic year (e.g., "2023-2024")</li>
              <li><strong>semester:</strong> Semester number (1-8)</li>
              <li><strong>batch:</strong> Batch number (1-5)</li>
              <li><strong>course:</strong> Course code (must exist in courses table)</li>
              <li><strong>faculty:</strong> Faculty ID (must exist in faculties table)</li>
              <li>First row should contain column headers</li>
              <li>Each subsequent row should contain assignment data</li>
              <li>All fields are required and cannot be empty</li>
              <li>Course code must exist in the courses table</li>
              <li>Faculty ID must exist in the faculties table</li>
              <li>Semester should be a number between 1 and 8</li>
              <li>Batch should be a number between 1 and 5</li>
              <li>Maximum file size: 10MB</li>
            </ul>
            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
              <h5>Example CSV Format:</h5>
              <pre style={{ margin: 0, fontSize: "12px" }}>
{`academic_year,semester,batch,course,faculty
2023-2024,1,1,CS101,F001
2023-2024,1,2,CS101,F002
2023-2024,2,1,CS201,F003`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
