import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import '../styles/EngagementChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EngagementChart = ({ event }) => {
  if (!event) return null;

  const views = event.views || 0;
  const clicks = event.clicks || 0;
  const totalInteractions = views + clicks;
  const engagementRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : 0;

  // Bar chart data for engagement metrics
  const barData = {
    labels: ['Views', 'Clicks', 'Total Interactions'],
    datasets: [
      {
        label: 'Engagement Metrics',
        data: [views, clicks, totalInteractions],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Doughnut chart data for engagement distribution
  const doughnutData = {
    labels: ['Views', 'Clicks'],
    datasets: [
      {
        data: [views, clicks],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Engagement Metrics',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Engagement Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <div className="engagement-chart-container">
      <div className="engagement-header">
        <h3>📊 Event Engagement Analytics</h3>
        <div className="engagement-stats">
          <div className="stat-item">
            <span className="stat-value">{views}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{clicks}</span>
            <span className="stat-label">Clicks</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{engagementRate}%</span>
            <span className="stat-label">Engagement Rate</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="chart-container">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      <div className="engagement-insights">
        <h4>💡 Insights</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-icon">👁️</span>
            <div className="insight-content">
              <h5>View Performance</h5>
              <p>{views > 100 ? 'High' : views > 50 ? 'Medium' : 'Low'} view count</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">👆</span>
            <div className="insight-content">
              <h5>Click Performance</h5>
              <p>{clicks > 20 ? 'High' : clicks > 10 ? 'Medium' : 'Low'} click count</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📈</span>
            <div className="insight-content">
              <h5>Engagement Quality</h5>
              <p>{engagementRate > 10 ? 'Excellent' : engagementRate > 5 ? 'Good' : 'Needs Improvement'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementChart;
