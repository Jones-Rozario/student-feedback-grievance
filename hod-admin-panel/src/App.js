import React, { useState } from "react";
import NavBar from "./components/navbar/navbar";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./pages/dashboard/dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import FacultyTable from "./pages/faculties/Faculties";
import Grievances from "./pages/grievances/Grievances";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Sidebar open={sidebarOpen} />
      <div className="right-content">
        <NavBar onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/faculties" element={<FacultyTable />} />
            <Route path="/grievances" element={<Grievances />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
