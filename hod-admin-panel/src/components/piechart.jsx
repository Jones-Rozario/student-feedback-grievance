import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Positive Feedback', 'Negative Feedback'],
  datasets: [
    {
      data: [145.75, 209.08],
      backgroundColor: ['#4e73df', '#e74a3b'],
    },
  ],
};

const options = { responsive: true, plugins: { legend: { position: 'bottom' } } };

const PieChart = () => <Pie data={data} options={options} />;

export default PieChart;
