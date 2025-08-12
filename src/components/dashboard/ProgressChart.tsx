import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData,
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
  initialType?: 'bar' | 'doughnut';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  stats,
  initialType = 'bar',
}) => {
  const [type, setType] = useState<'bar' | 'doughnut'>(initialType);
  const [hiddenBars, setHiddenBars] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const chartRef = useRef<any>(null);

  const toggleType = () => {
    setType((prev) => (prev === 'bar' ? 'doughnut' : 'bar'));
  };

  // Toggle bar category visibility
  const toggleBarVisibility = (index: number) => {
    setHiddenBars((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  // Prepare data for bar chart with hidden bars filtered
  const barLabels = ['Code Tasks', 'Learning', 'Relationships', 'Self Dev', 'Projects'];
  const barRawData = [
    stats.byCategory['code-tasks'],
    stats.byCategory['learning'],
    stats.byCategory['relationship'],
    stats.byCategory['self-development'],
    stats.byCategory['project-improvement'],
  ];

  const filteredBarLabels = barLabels.filter((_, idx) => !hiddenBars[idx]);
  const filteredBarData = barRawData.filter((_, idx) => !hiddenBars[idx]);

  const barData: ChartData<'bar'> = {
    labels: filteredBarLabels,
    datasets: [
      {
        label: 'Tasks',
        data: filteredBarData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ].filter((_, idx) => !hiddenBars[idx]),
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(249, 115, 22, 1)',
        ].filter((_, idx) => !hiddenBars[idx]),
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Tasks by Category',
        font: { size: 20, weight: 'bold' as const },
        color: '#374151',
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f2937',
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} tasks`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#4b5563', font: { size: 14 } },
        grid: { color: '#e5e7eb' },
      },
      x: {
        ticks: { color: '#4b5563', font: { size: 14 } },
        grid: { display: false },
      },
    },
  };

  // Doughnut chart data & options
  const doughnutLabels = ['Completed', 'In Progress', 'Todo'];
  const doughnutData: ChartData<'doughnut'> = {
    labels: doughnutLabels,
    datasets: [
      {
        data: [
          stats.completed,
          stats.inProgress,
          stats.total - stats.completed - stats.inProgress,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(156, 163, 175, 0.85)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 30,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    animation: { duration: 600 },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 14 }, color: '#374151' },
      },
      title: {
        display: true,
        text: 'Task Status',
        font: { size: 20, weight: 'bold' as const },
        color: '#374151',
      },
      tooltip: {
        backgroundColor: '#1f2937',
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  };

  // Download chart as image
  const downloadChart = () => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const base64Image = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `progress-chart-${type}.png`;
    link.click();
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: '30px auto',
        padding: 24,
        boxShadow:
          '0 8px 20px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.05)',
        borderRadius: 16,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 440,
      }}
    >
      {/* Summary */}
      <div
        style={{
          width: '100%',
          marginBottom: 20,
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>Total Tasks: <strong>{stats.total}</strong></div>
        <div>Completed: <strong>{stats.completed}</strong></div>
        <div>In Progress: <strong>{stats.inProgress}</strong></div>
        <div>Todo: <strong>{stats.total - stats.completed - stats.inProgress}</strong></div>
      </div>

      {/* Buttons */}
      <div
        style={{
          alignSelf: 'flex-end',
          display: 'flex',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          width: '100%',
        }}
      >
        <button
          onClick={toggleType}
          style={{
            padding: '10px 22px',
            fontSize: 16,
            fontWeight: '600',
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#2563eb')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#3b82f6')
          }
          aria-label="Toggle chart type"
          title="Toggle chart type"
        >
          Show {type === 'bar' ? 'Doughnut' : 'Bar'} Chart
        </button>

        <button
          onClick={downloadChart}
          style={{
            padding: '10px 22px',
            fontSize: 16,
            fontWeight: '600',
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#10b981',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#059669')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#10b981')
          }
          aria-label="Download chart image"
          title="Download chart image"
        >
          Download Chart
        </button>
      </div>

      {/* Legend toggles (only for bar chart) */}
      {type === 'bar' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
            width: '100%',
          }}
        >
          {barLabels.map((label, idx) => (
            <button
              key={label}
              onClick={() => toggleBarVisibility(idx)}
              style={{
                padding: '6px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: '2px solid',
                borderColor: hiddenBars[idx] ? '#9ca3af' : 'transparent',
                backgroundColor: hiddenBars[idx]
                  ? '#f3f4f6'
                  : ['#3b82f6', '#10b981', '#f56565', '#8b5cf6', '#f97316'][
                      idx
                    ],
                color: hiddenBars[idx] ? '#6b7280' : 'white',
                cursor: 'pointer',
                boxShadow: hiddenBars[idx]
                  ? 'none'
                  : '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
              }}
              aria-pressed={!hiddenBars[idx]}
              title={`Toggle ${label} visibility`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div
        style={{
          width: '100%',
          flexGrow: 1,
          minHeight: 340,
          position: 'relative',
        }}
      >
        {type === 'bar' ? (
          <Bar ref={chartRef} data={barData} options={barOptions} />
        ) : (
          <Doughnut ref={chartRef} data={doughnutData} options={doughnutOptions} />
        )}
      </div>
    </div>
  );
};
