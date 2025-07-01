import React, { useState, useEffect } from "react";
import styles from "./ElectiveCourses.module.css";
import { apiAxios } from '../../../utils/api';

const ElectiveCoursesStudentAssignment = () => {
  const [electiveCourses, setElectiveCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ batch: '', electiveCourseId: '' });
  const [allElectiveCourses, setAllElectiveCourses] = useState([]);

  useEffect(() => {
    fetchElectiveCourses();
    fetchAllElectiveCourses();
  }, []);

  const fetchElectiveCourses = async () => {
    try {
      setLoading(true);
      const response = await apiAxios().get("/elective-student-assignments");
      setElectiveCourses(response.data);
    } catch (error) {
      console.error("Error fetching elective courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllElectiveCourses = async () => {
    try {
      const response = await apiAxios().get("/electives");
      setAllElectiveCourses(response.data);
    } catch (error) {
      console.error("Error fetching all elective courses:", error);
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment._id);
    setEditForm({
      batch: assignment.student.batch,
      electiveCourseId: assignment.electiveCourse?._id || '',
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (assignment) => {
    try {
      await apiAxios().patch(
        `/elective-student-assignments/${assignment.student.registerNumber}/${assignment.electiveCourse._id}`,
        {
          batch: editForm.batch,
          newElectiveCourseId: editForm.electiveCourseId,
        }
      );
      setEditingId(null);
      fetchElectiveCourses();
    } catch (error) {
      alert("Failed to update assignment");
    }
  };

  const handleDelete = async (assignment) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await apiAxios().delete(
          `/elective-student-assignments/${assignment.student.registerNumber}/${assignment.electiveCourse._id}`
        );
        fetchElectiveCourses();
      } catch (error) {
        alert("Failed to delete assignment");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Elective Courses and Students</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Student Name</th>
              <th>Register Number</th>
              <th>Batch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {electiveCourses.map((assignment) => (
              <tr key={assignment._id}>
                {editingId === assignment._id ? (
                  <>
                    <td>
                      <select
                        name="electiveCourseId"
                        value={editForm.electiveCourseId}
                        onChange={handleEditChange}
                      >
                        <option value="">Select Course</option>
                        {allElectiveCourses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{assignment.student?.name || "N/A"}</td>
                    <td>{assignment.student?.registerNumber || "N/A"}</td>
                    <td>
                      <input
                        type="number"
                        name="batch"
                        value={editForm.batch}
                        min="1"
                        max="5"
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleUpdate(assignment)} style={{marginRight: 8}}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{assignment.electiveCourse?.name || "N/A"}</td>
                    <td>{assignment.student?.name || "N/A"}</td>
                    <td>{assignment.student?.registerNumber || "N/A"}</td>
                    <td>{assignment.student?.batch || "N/A"}</td>
                    <td>
                      <button onClick={() => handleEdit(assignment)} style={{marginRight: 8}}>Edit</button>
                      <button onClick={() => handleDelete(assignment)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ElectiveCoursesStudentAssignment; 