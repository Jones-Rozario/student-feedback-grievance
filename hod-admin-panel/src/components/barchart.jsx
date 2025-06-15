import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const data = {
  labels: ['Fac 1', 'Fac 2', 'Fac 3', 'Fac 4'],
  datasets: [
    { label: '2020', data: [90, 60, 80, 20], backgroundColor: '#4e73df' },
    { label: '2021', data: [50, 40, 60, 30], backgroundColor: '#1cc88a' },
    { label: '2022', data: [20, 30, 100, 40], backgroundColor: '#36b9cc' },
  ],
};

const options = { responsive: true, plugins: { legend: { position: 'bottom' } } };

const BarChart = () => <Bar data={data} options={options} />;

export default BarChart;
