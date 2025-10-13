import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ events }) => {
  // Process events data for chart
  const processChartData = () => {
    const eventTypes = {};
    
    events.forEach(event => {
      const type = event.event_type || 'Other';
      if (!eventTypes[type]) {
        eventTypes[type] = {
          views: 0,
          clicks: 0,
          count: 0
        };
      }
      eventTypes[type].views += event.views || 0;
      eventTypes[type].clicks += event.clicks || 0;
      eventTypes[type].count += 1;
    });

    const labels = Object.keys(eventTypes);
    const viewsData = labels.map(label => eventTypes[label].views);
    const clicksData = labels.map(label => eventTypes[label].clicks);
    const engagementData = labels.map(label => 
      eventTypes[label].clicks / Math.max(eventTypes[label].views, 1) * 100
    );

    return { labels, viewsData, clicksData, engagementData };
  };

  const { labels, viewsData, clicksData, engagementData } = processChartData();

  const viewsChartData = {
    labels,
    datasets: [
      {
        label: 'Views',
        data: viewsData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const clicksChartData = {
    labels,
    datasets: [
      {
        label: 'Clicks',
        data: clicksData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const engagementChartData = {
    labels,
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: engagementData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Event Performance by Type',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (events.length === 0) {
    return (
      <div className="no-data-chart">
        <p>No event data available for chart display.</p>
      </div>
    );
  }

  return (
    <div className="analytics-charts">
      <div className="chart-container">
        <h3>Views by Event Type</h3>
        <Bar data={viewsChartData} options={chartOptions} />
      </div>
      
      <div className="chart-container">
        <h3>Clicks by Event Type</h3>
        <Bar data={clicksChartData} options={chartOptions} />
      </div>
      
      <div className="chart-container">
        <h3>Engagement Rate by Event Type</h3>
        <Bar data={engagementChartData} options={{
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            },
          },
        }} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
