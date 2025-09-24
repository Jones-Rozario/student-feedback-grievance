import React, { useState, useEffect } from "react";
import "./Students.css";
import { apiAxios } from '../../../utils/api';
import logoPng from "../../../assests/anna_univ_logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("");
  // Edit states
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    id: "",
    batch: "",
    current_semester: "",
    joined_year: "",
  });

  // Bulk delete state
  const [bulkDeleteSemester, setBulkDeleteSemester] = useState("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, nameFilter, idFilter, batchFilter, semesterFilter,feedbackFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiAxios().get("/students");
      if (response.data.error) {
        throw new Error("Failed to fetch students");
      }
      setStudents(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch students");
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (nameFilter) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (idFilter) {
      filtered = filtered.filter((student) =>
        student.id.toLowerCase().includes(idFilter.toLowerCase())
      );
    }

    if (batchFilter) {
      filtered = filtered.filter((student) =>
        student.batch == Number(batchFilter)
      );
    }

    if (semesterFilter && semesterFilter !== "") {
      filtered = filtered.filter(
        (student) => student.current_semester === parseInt(semesterFilter)
      );
    }
    if (feedbackFilter) {   
      filtered = filtered.filter(
        (student) =>
          (feedbackFilter === "Yes" && student.isFeedbackGiven) ||
          (feedbackFilter === "No" && !student.isFeedbackGiven)
      );
    }
    setFilteredStudents(filtered);
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      name: student.name,
      id: student.id,
      batch: student.batch,
      current_semester: student.current_semester,
      joined_year: student.joined_year,
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await apiAxios().put(
        `/students/${editingStudent}`,
        editForm
      );

      if (response.data.error) {
        throw new Error("Failed to update student");
      }

      setEditingStudent(null);
      setEditForm({
        name: "",
        id: "",
        batch: "",
        current_semester: "",
        joined_year: "",
      });
      fetchStudents();
    } catch (err) {
      setError("Failed to update student");
      console.error("Error updating student:", err);
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await apiAxios().delete(
          `/students/${studentId}`
        );

        if (response.data.error) {
          throw new Error("Failed to delete student");
        }

        fetchStudents();
      } catch (err) {
        setError("Failed to delete student");
        console.error("Error deleting student:", err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteSemester) {
      setError("Please select a semester");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete all students from semester ${bulkDeleteSemester}?`
      )
    ) {
      try {
        const response = await apiAxios().delete(
          `/students/semester/${bulkDeleteSemester}`
        );

        if (response.data.error) {
          throw new Error("Failed to delete students");
        }

        setShowBulkDeleteModal(false);
        setBulkDeleteSemester("");
        fetchStudents();
      } catch (err) {
        setError("Failed to delete students");
        console.error("Error bulk deleting students:", err);
      }
    }
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setEditForm({
      name: "",
      id: "",
      batch: "",
      current_semester: "",
      joined_year: "",
    });
  };
  const handleDownloadPDF = () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header logo + text
  doc.addImage(logoPng, "PNG", 10, 10, 25, 25);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("ANNA UNIVERSITY :: CHENNAI - 600025", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("STUDENTS FEEDBACK FORM", 105, 28, { align: "center" });
  doc.setFontSize(10);
  doc.text("(Based on Higher Education G.O(Ms).No.19, dt 14/1/20)", 105, 34, { align: "center" });

  // Department header
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", 105, 50, { align: "center" });
  doc.text("COLLEGE OF ENGINEERING GUINDY CAMPUS", 105, 58, { align: "center" });

  // Show filters if applied
  let filterY = 72;
  doc.setFontSize(10);
  doc.setFont("times", "normal");
  if (batchFilter) {
    doc.text(`Batch: ${batchFilter}`, 20, filterY);
    filterY += 6;
  }
  if (semesterFilter) {
    doc.text(`Semester: ${semesterFilter}`, 20, filterY);
    filterY += 6;
  }
  if (feedbackFilter) {
    doc.text(`Feedback Status: ${feedbackFilter}`, 20, filterY);
    filterY += 6;
  }

  // Build table data
  const tableData = filteredStudents.map((s, i) => [
    i + 1,
    s.id,
    s.name,
    s.isFeedbackGiven ? "Yes" : "No",
    s.current_semester,
    s.batch,
  ]);

  autoTable(doc, {
    startY: filterY + 6,
    head: [["S.No", "Roll Number", "Name", "Feedback Status", "Semester", "Batch"]],
    body: tableData,
    styles: { font: "times", fontSize: 10, halign: "center", valign: "middle" },
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0],
  });

  // Footer
  const timestamp = new Date().toLocaleString();
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text(
    `This is System Generated PDF from DCSE, Anna University, Chennai-25. ${timestamp}`,
    105,
    pageHeight - 10,
    { align: "center" }
  );

  // File name
  const filename = `Feedback_List_${batchFilter || "all"}_${semesterFilter || "all"}.pdf`;
  doc.save(filename);
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="students-container">
      <div className="header">
        <h1>Student Management</h1>
        <button
          className="bulk-delete-btn"
          onClick={() => setShowBulkDeleteModal(true)}
        >
          Bulk Delete by Semester
        </button>
      <button
    className="download-btn"
    onClick={handleDownloadPDF}
    style={{ marginLeft: "10px", backgroundColor: "#007bff", color: "white", padding: "8px 12px", borderRadius: "5px", border: "none", cursor: "pointer" }}
  >
    Download Filtered Students
  </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Search by Name:</label>
          <input
            type="text"
            placeholder="Student name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Search by ID:</label>
          <input
            type="text"
            placeholder="Student ID..."
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Filter by Batch:</label>
          <input
            type="text"
            placeholder="Batch..."
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Filter by Semester:</label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      <div className="filter-group">   
          <label>Feedback Status:</label>
          <select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
	</div>       
      </div>
      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>S.no</th>
              <th>Name</th>
              <th>ID</th>
              <th>Batch</th>
              <th>Current Semester</th>
              <th>Joined Year</th>
              <th>Feedback Given</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, i) => (
              <tr key={student._id}>
                <td>{i + 1}</td>
                <td>
                  {editingStudent === student._id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    student.name
                  )}
                </td>
                <td>
                  {editingStudent === student._id ? (
                    <input
                      type="text"
                      value={editForm.id}
                      onChange={(e) =>
                        setEditForm({ ...editForm, id: e.target.value })
                      }
                    />
                  ) : (
                    student.id
                  )}
                </td>
                <td>
                  {editingStudent === student._id ? (
                    <input
                      type="text"
                      value={editForm.batch}
                      onChange={(e) =>
                        setEditForm({ ...editForm, batch: e.target.value })
                      }
                    />
                  ) : (
                    student.batch
                  )}
                </td>
                <td>
                  {editingStudent === student._id ? (
                    <select
                      value={editForm.current_semester}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          current_semester: e.target.value,
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14].map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  ) : (
                    student.current_semester
                  )}
                </td>
                <td>
                  {editingStudent === student._id ? (
                    <input
                      type="number"
                      value={editForm.joined_year}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          joined_year: e.target.value,
                        })
                      }
                    />
                  ) : (
                    student.joined_year
                  )}
                </td>
                <td>
                  <span
                    className={`feedback-status ${
                      student.isFeedbackGiven ? "given" : "not-given"
                    }`}
                  >
                    {student.isFeedbackGiven ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  {editingStudent === student._id ? (
                    <div className="action-buttons">
                      <button onClick={handleUpdate} className="save-btn">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(student)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Bulk Delete Students by Semester</h3>
            <p>
              This will permanently delete all students from the selected
              semester.
            </p>
            <div className="modal-content">
              <label>Select Semester:</label>
              <select
                value={bulkDeleteSemester}
                onChange={(e) => setBulkDeleteSemester(e.target.value)}
              >
                <option value="">Choose semester...</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleBulkDelete} className="delete-btn">
                Delete All
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
