import React, { useEffect, useState } from "react";
import styles from "./ElectiveCourses.module.css";
import axios from "axios";

const AllElectiveCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', name: '', semester: '' });
  const [filters, setFilters] = useState({ code: '', name: '', semester: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/electives");
      setCourses(res.data);
    } catch (err) {
      alert("Failed to fetch elective courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditId(course._id);
    setEditForm({ code: course.code, name: course.name, semester: course.semester });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (course) => {
    try {
      await axios.put(`http://localhost:5000/api/electives/${course._id}`, editForm);
      setEditId(null);
      fetchCourses();
    } catch (err) {
      alert("Failed to update course");
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm("Delete this elective course and all related assignments?")) {
      try {
        await axios.delete(`http://localhost:5000/api/electives/${course._id}`);
        fetchCourses();
      } catch (err) {
        alert("Failed to delete course");
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCourses = courses.filter((c) => {
    return (
      (filters.code === '' || c.code.toLowerCase().includes(filters.code.toLowerCase())) &&
      (filters.name === '' || c.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.semester === '' || String(c.semester) === String(filters.semester))
    );
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Elective Courses</h1>
      <div className={styles.filters} style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          name="code"
          placeholder="Filter by Code"
          value={filters.code}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="semester"
          placeholder="Filter by Semester"
          value={filters.semester}
          onChange={handleFilterChange}
          min={1}
          max={8}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course._id}>
                {editId === course._id ? (
                  <>
                    <td>
                      <input
                        name="code"
                        value={editForm.code}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        name="semester"
                        type="number"
                        min={1}
                        max={8}
                        value={editForm.semester}
                        onChange={handleEditChange}
                        required
                      />
                    </td>
                    <td>
                      <button onClick={() => handleUpdate(course)} style={{ marginRight: 8 }}>Save</button>
                      <button onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.semester}</td>
                    <td>
                      <button onClick={() => handleEdit(course)} style={{ marginRight: 8 }}>Edit</button>
                      <button onClick={() => handleDelete(course)}>Delete</button>
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

export default AllElectiveCourses; 