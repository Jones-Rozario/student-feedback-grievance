import React, { useState } from 'react';
import styles from './FacultyTable.module.scss';

const facultyData = [
  {
    id: '622356',
    name: 'Priya',
    avatar: 'A',
    course: 'Database Management System',
    batch: 'P',
    designation: 'Teaching Faculty',
    performance: 'Low',
    rating: 2,
    courses: [
      {
        name: 'Course 1',
        metrics: {
          'Teaching Efficiency': 4,
          'Course Content Quality': 4,
          'Communication Skills': 4,
          'Student Engagement': 4,
          'Innovative': 4,
        },
        yearlyStats: { '2020': 3, '2021': 4, '2022': 4 },
      },
    ],
  },
  {
    id: '622356',
    name: 'Amudha',
    avatar: 'A',
    course: 'Database Management System',
    batch: 'P',
    designation: 'Teaching Faculty',
    performance: 'High',
    rating: 5,
    courses: [
      {
        name: 'Course 1',
        metrics: {
          'Teaching Efficiency': 5,
          'Course Content Quality': 5,
          'Communication Skills': 5,
          'Student Engagement': 5,
          'Innovative': 5,
        },
        yearlyStats: { '2020': 4, '2021': 5, '2022': 5 },
      },
    ],
  },
  {
    id: '622356',
    name: 'Saradha',
    avatar: 'S',
    course: 'Database Management System',
    batch: 'P',
    designation: 'Teaching Faculty',
    performance: 'High',
    rating: 5,
    courses: [
      {
        name: 'Course 1',
        metrics: {
          'Teaching Efficiency': 5,
          'Course Content Quality': 5,
          'Communication Skills': 5,
          'Student Engagement': 5,
          'Innovative': 5,
        },
        yearlyStats: { '2020': 4, '2021': 5, '2022': 5 },
      },
    ],
  },
  {
    id: '622356',
    name: 'Ganesh',
    avatar: 'G',
    course: 'Database Management System',
    batch: 'P',
    designation: 'Teaching Faculty',
    performance: 'Medium',
    rating: 3,
    courses: [
      {
        name: 'Course 1',
        metrics: {
          'Teaching Efficiency': 3,
          'Course Content Quality': 3,
          'Communication Skills': 3,
          'Student Engagement': 3,
          'Innovative': 3,
        },
        yearlyStats: { '2020': 2, '2021': 3, '2022': 3 },
      },
    ],
  },
  {
    id: '622356',
    name: 'Kirthicka',
    avatar: 'K',
    course: 'Database Management System',
    batch: 'P',
    designation: 'Teaching Faculty',
    performance: 'Medium',
    rating: 4,
    courses: [
      {
        name: 'Course 1',
        metrics: {
          'Teaching Efficiency': 4,
          'Course Content Quality': 4,
          'Communication Skills': 4,
          'Student Engagement': 4,
          'Innovative': 4,
        },
        yearlyStats: { '2020': 3, '2021': 4, '2022': 4 },
      },
    ],
  },
];

const performanceColors = {
  High: styles.badgeHigh,
  Medium: styles.badgeMedium,
  Low: styles.badgeLow,
};

function FacultyPerformanceView({ faculty, onBack }) {
  const [courseIdx, setCourseIdx] = useState(0);
  const course = faculty.courses[courseIdx];
  const metrics = Object.entries(course.metrics);
  const years = Object.keys(course.yearlyStats);
  const maxStat = 5;

  return (
    <div className={styles.performanceViewWrapper}>
      <button className={styles.backButton} onClick={onBack}>&larr; Back to List</button>
      <div className={styles.performanceHeader}>
        <div className={styles.performanceAvatar}>{faculty.avatar}</div>
        <div>
          <div className={styles.performanceName}>{faculty.name}</div>
          <div className={styles.performanceDesignation}>{faculty.designation}</div>
        </div>
      </div>
      <div className={styles.performanceCourseRow}>
        <label>Courses Taken: </label>
        <select
          className={styles.performanceCourseSelect}
          value={courseIdx}
          onChange={e => setCourseIdx(Number(e.target.value))}
        >
          {faculty.courses.map((c, idx) => (
            <option key={c.name} value={idx}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.metricsGrid}>
        {metrics.map(([label, value]) => (
          <div className={styles.metricCard} key={label}>
            <div className={styles.metricLabel}>{label}</div>
            <div className={styles.metricStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < value ? styles.starFilled : styles.starEmpty}>★</span>
              ))}
            </div>
            <div className={styles.metricValue}>{value}</div>
          </div>
        ))}
      </div>
      <div className={styles.barChartWrapper}>
        <div className={styles.barChartTitle}>Yearly Stats</div>
        <div className={styles.barChart}>
          {years.map(year => (
            <div className={styles.barChartBarWrapper} key={year}>
              <div
                className={styles.barChartBar}
                style={{
                  height: `${(course.yearlyStats[year] / maxStat) * 100}%`,
                  background: '#4e73df',
                  transition: 'height 0.6s cubic-bezier(.4,2,.6,1)',
                }}
              ></div>
              <div className={styles.barChartYear}>{year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FacultyTable = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ batch: '', designation: '', performance: '' });
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const filteredData = facultyData.filter(fac => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.id.includes(search) ||
      fac.course.toLowerCase().includes(search.toLowerCase());
    const matchesBatch = filter.batch ? fac.batch === filter.batch : true;
    const matchesDesignation = filter.designation ? fac.designation === filter.designation : true;
    const matchesPerformance = filter.performance ? fac.performance === filter.performance : true;
    return matchesSearch && matchesBatch && matchesDesignation && matchesPerformance;
  });

  if (selectedFaculty) {
    return <FacultyPerformanceView faculty={selectedFaculty} onBack={() => setSelectedFaculty(null)} />;
  }

  return (
    <div className={styles.facultyTableWrapper}>
      <div className={styles.headerRow}>
        <h2>Faculties</h2>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filter.performance}
          onChange={e => setFilter(f => ({ ...f, performance: e.target.value }))}
        >
          <option value="">Performance</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filter.designation}
          onChange={e => setFilter(f => ({ ...f, designation: e.target.value }))}
        >
          <option value="">Designation</option>
          <option value="Teaching Faculty">Teaching Faculty</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filter.batch}
          onChange={e => setFilter(f => ({ ...f, batch: e.target.value }))}
        >
          <option value="">Batch</option>
          <option value="P">P</option>
        </select>
      </div>
      <table className={styles.facultyTable}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Batch</th>
            <th>Designation</th>
            <th>Performance</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((fac, idx) => (
            <tr key={idx} className={styles.tableRow} onClick={() => setSelectedFaculty(fac)} style={{ cursor: 'pointer' }}>
              <td>{idx + 1}</td>
              <td>{fac.id}</td>
              <td>
                <span className={styles.avatar}>{fac.avatar}</span> {fac.name}
              </td>
              <td>{fac.course}</td>
              <td>{fac.batch}</td>
              <td>{fac.designation}</td>
              <td>
                <span className={`${styles.badge} ${performanceColors[fac.performance]}`}>{fac.performance}</span>
              </td>
              <td>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < fac.rating ? styles.starFilled : styles.starEmpty}>★</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyTable; 