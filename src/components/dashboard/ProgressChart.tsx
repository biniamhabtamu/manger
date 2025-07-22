import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TaskStats } from '../../types/task';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProgressChartProps {
  stats: TaskStats;
  type: 'bar' | 'doughnut';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ stats, type }) => {
  if (type === 'bar') {
    const data = {
      labels: ['Code Tasks', 'Learning', 'Relationships', 'Self Dev', 'Projects'],
      datasets: [
        {
          label: 'Tasks',
          data: [
            stats.byCategory['code-tasks'],
            stats.byCategory['learning'],
            stats.byCategory['relationship'],
            stats.byCategory['self-development'],
            stats.byCategory['project-improvement'],
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 101, 101, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(249, 115, 22, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Tasks by Category',
          font: {
            size: 16,
            weight: 'bold' as const,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return <Bar data={data} options={options} />;
  }

  const data = {
    labels: ['Completed', 'In Progress', 'Todo'],
    datasets: [
      {
        data: [stats.completed, stats.inProgress, stats.total - stats.completed - stats.inProgress],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Task Status',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};