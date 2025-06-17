import React, { useState } from 'react';
import styles from './GrievanceTable.module.scss';

const grievanceData = [
  {
    id: 'G001',
    student: 'John Doe',
    subject: 'Exam Re-evaluation',
    status: 'Open',
    date: '2023-05-10',
    description: 'Requesting re-evaluation for DBMS exam.',
    details: 'I believe my DBMS exam was not evaluated correctly. Please review my answer sheet.',
    assignedTo: 'Prof. Smith',
    response: 'We are reviewing your request and will update you soon.'
  },
  {
    id: 'G002',
    student: 'Priya Sharma',
    subject: 'Attendance Issue',
    status: 'Closed',
    date: '2023-04-22',
    description: 'Attendance not updated for March.',
    details: 'My attendance for March is not updated in the portal. Kindly check and update.',
    assignedTo: 'Admin Office',
    response: 'Attendance has been updated. Please check your portal.'
  },
  {
    id: 'G003',
    student: 'Rahul Singh',
    subject: 'Lab Equipment',
    status: 'In Progress',
    date: '2023-05-01',
    description: 'Lab equipment not working.',
    details: 'The computers in Lab 2 are not working properly. Please arrange for repairs.',
    assignedTo: 'Lab Technician',
    response: 'Repair work is underway.'
  },
  {
    id: 'G004',
    student: 'Anjali Kumar',
    subject: 'Library Access',
    status: 'Open',
    date: '2023-05-12',
    description: 'Unable to access library resources online.',
    details: 'I am unable to access online library resources with my student login.',
    assignedTo: 'Library Staff',
    response: 'We are checking your account access.'
  },
];

const statusColors = {
  Open: styles.statusOpen,
  'In Progress': styles.statusProgress,
  Closed: styles.statusClosed,
};
const statusIcons = {
  Open: '🟢',
  'In Progress': '🟡',
  Closed: '🔴',
};

function GrievanceDetail({ grievance, onBack }) {
  return (
    <div className={styles.detailWrapper}>
      <button className={styles.backButton} onClick={onBack}>&larr; Back to List</button>
      <div className={styles.detailHeader}>
        <div className={styles.detailId}>{grievance.id}</div>
        <div className={styles.detailStatus + ' ' + statusColors[grievance.status]}>
          {statusIcons[grievance.status]} {grievance.status}
        </div>
      </div>
      <div className={styles.detailBody}>
        <div><strong>Student:</strong> {grievance.student}</div>
        <div><strong>Subject:</strong> {grievance.subject}</div>
        <div><strong>Date:</strong> {grievance.date}</div>
        <div><strong>Description:</strong> {grievance.description}</div>
        <div><strong>Details:</strong> {grievance.details}</div>
        <div><strong>Assigned To:</strong> {grievance.assignedTo}</div>
        <div><strong>Response:</strong> {grievance.response}</div>
      </div>
    </div>
  );
}

const Grievances = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredData = grievanceData.filter(g => {
    const matchesSearch =
      g.student.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? g.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (selected) {
    return <GrievanceDetail grievance={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className={styles.grievanceTableWrapper}>
      <h2>Grievances</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by student, subject, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <table className={styles.grievanceTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((g, idx) => (
            <tr key={g.id} className={styles.tableRow} onClick={() => setSelected(g)} style={{ cursor: 'pointer' }}>
              <td>{g.id}</td>
              <td>{g.student}</td>
              <td>{g.subject}</td>
              <td><span className={styles.status + ' ' + statusColors[g.status]}>{statusIcons[g.status]} {g.status}</span></td>
              <td>{g.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grievances; 