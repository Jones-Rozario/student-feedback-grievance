import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaComments,
  FaUpload,
  FaBook,
  FaGraduationCap,
  FaWpforms,
} from "react-icons/fa";
import "./sidebar.css";

const Sidebar = ({ open }) => (
  <div className={`sidebar ${open ? "open" : "closed"}`}>
    <div className="sidebar__profile">
      <div className="sidebar__profile-info">
        <div className="sidebar__name">Admin</div>
        <div className="sidebar__role">HOD</div>
      </div>
    </div>
    <nav>
      <Link to="/admin/dashboard" className="sidebar__link">
        <FaHome className="sidebar__icon" /> <span>Dashboard</span>
      </Link>
      <Link to="/admin/students" className="sidebar__link">
        <FaGraduationCap className="sidebar__icon" /> <span>Students</span>
      </Link>
      <Link to="/admin/courses" className="sidebar__link">
        <FaBook className="sidebar__icon" /> <span>Courses</span>
      </Link>
      <Link to="/admin/faculties" className="sidebar__link">
        <FaUsers className="sidebar__icon" /> <span>Faculties</span>
      </Link>
      <Link to="/admin/grievances" className="sidebar__link">
        <FaComments className="sidebar__icon" /> <span>Grievances</span>
      </Link>
      <Link to="/admin/csvupload" className="sidebar__link">
        <FaUpload className="sidebar__icon" /> <span>CSV Upload</span>
      </Link>
      <Link to="/admin/assigncourses" className="sidebar__link">
        <FaUsers className="sidebar__icon" /> <span>Assign Courses</span>
      </Link>
    </nav>
  </div>
);

export default Sidebar;
