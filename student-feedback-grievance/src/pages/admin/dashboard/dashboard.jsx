import React, { useEffect, useState } from "react";
import "./dashboard.css";
import StatCard from "../../../components/statcard/statcard";
import BarChart from "../../../components/barchart.jsx";
import PieChart from "../../../components/piechart.jsx";
import { useAuth } from "../../../contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    feedbacks: 0,
    grievances: 0,
    students: 0,
    faculties: 0,
    grievanceDetails: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://localhost:5000/api/feedback").then((res) => res.json()),
      fetch("http://localhost:5000/api/grievances/stats/overview").then((res) => res.json()),
      fetch("http://localhost:5000/api/students").then((res) => res.json()),
      fetch("http://localhost:5000/api/faculties").then((res) => res.json()),
    ])
      .then(([feedbacks, grievanceStats, students, faculties]) => {
        setStats({
          feedbacks: Array.isArray(feedbacks) ? feedbacks.length : 0,
          grievances: grievanceStats.total || 0,
          students: Array.isArray(students) ? students.length : 0,
          faculties: Array.isArray(faculties) ? faculties.length : 0,
          grievanceDetails: grievanceStats,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard stats");
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding: 40}}>Loading dashboard stats...</div>;
  if (error) return <div style={{padding: 40, color: 'red'}}>{error}</div>;

  return (
    <div className="dashboard">
      {/* User Info Section */}
      <div className="dashboard__user-info" style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: "0 0 15px 0", color: "#333" }}>
          Welcome, {currentUser?.name}!
        </h2>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ 
            background: "#f8f9fa", 
            padding: "10px 15px", 
            borderRadius: "4px",
            border: "1px solid #dee2e6"
          }}>
            <strong>Role:</strong> {currentUser?.role?.toUpperCase()}
          </div>
          <div style={{ 
            background: "#f8f9fa", 
            padding: "10px 15px", 
            borderRadius: "4px",
            border: "1px solid #dee2e6"
          }}>
            <strong>ID:</strong> {currentUser?.id}
          </div>
          {currentUser?.designation && (
            <div style={{ 
              background: "#f8f9fa", 
              padding: "10px 15px", 
              borderRadius: "4px",
              border: "1px solid #dee2e6"
            }}>
              <strong>Designation:</strong> {currentUser.designation}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard__stats">
        <StatCard title="Feedbacks Submitted" value={stats.feedbacks} icon="fa-users" color="green" />
        <StatCard title="Grievances Filed" value={stats.grievances} icon="fa-comments" color="red" />
        <StatCard title="Students" value={stats.students} icon="fa-graduation-cap" color="blue" />
        <StatCard title="Faculties" value={stats.faculties} icon="fa-chalkboard-teacher" color="purple" />
        {/* <div className="dashboard__pie">
          <PieChart />
        </div> */}
      </div>
      <div className="dashboard__main">
        {/* <div className="dashboard__bar">
          <BarChart />
        </div> */}
        <div className="dashboard__recent">
          <h3>Recent Grievances:</h3>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Pending</td><td>{stats.grievanceDetails.pending}</td></tr>
              <tr><td>In Progress</td><td>{stats.grievanceDetails.inProgress}</td></tr>
              <tr><td>Resolved</td><td>{stats.grievanceDetails.resolved}</td></tr>
              <tr><td>Rejected</td><td>{stats.grievanceDetails.rejected}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
