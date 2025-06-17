import React from 'react';
import { FaHome, FaUsers, FaComments } from 'react-icons/fa';
import './sidebar.scss';

const Sidebar = ({ open }) => (
  <div className={`sidebar ${open ? 'open' : 'closed'}`}>
    <div className="sidebar__profile">
      <img src="/profile.jpg" alt="Admin" />
      <div>
        <div className="sidebar__name">Admin</div>
        <div className="sidebar__role">HOD</div>
      </div>
    </div>
    <nav>
      <a href="/" className="sidebar__link"><FaHome className="sidebar__icon" /> Dashboard</a>
      <a href="/faculties" className="sidebar__link"><FaUsers className="sidebar__icon" /> Faculties</a>
      <a href="/grievances" className="sidebar__link"><FaComments className="sidebar__icon" /> Grievances</a>
    </nav>
  </div>
);

export default Sidebar;
