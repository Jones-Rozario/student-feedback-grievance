import React from "react";
import "./dashboard.css";
import StatCard from "../../../components/statcard/statcard";
import BarChart from "../../../components/barchart.jsx";
import PieChart from "../../../components/piechart.jsx";
import { useAuth } from "../../../contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();

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
        <StatCard title="Feedbacks Submitted" value={235} icon="fa-users" color="green" />
        <StatCard title="Grievances Filed" value={235} icon="fa-comments" color="red" />
        <div className="dashboard__pie">
          <PieChart />
        </div>
      </div>
      <div className="dashboard__main">
        <div className="dashboard__bar">
          <BarChart />
        </div>
        <div className="dashboard__recent">
          <h3>Recent Grievances:</h3>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Register No</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1.</td><td>2023103077</td><td>Academic</td></tr>
              <tr><td>2.</td><td>2023103071</td><td>Hostel</td></tr>
              <tr><td>3.</td><td>2023103077</td><td>Academic</td></tr>
              <tr><td>4.</td><td>Anonymous</td><td>Academic</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
