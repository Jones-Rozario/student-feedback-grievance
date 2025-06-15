import React from "react";
import "./dashboard.scss";
import StatCard from "../../components/statcard/statcard";
import BarChart from "../../components/barchart";
import PieChart from "../../components/piechart";

const Dashboard = () => (
  <div className="dashboard">
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

export default Dashboard;
