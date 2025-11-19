import React from 'react';
import './Stats.css';

function Stats({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.total_cases || 0,
      icon: '📋',
      color: '#4f46e5'
    },
    {
      title: 'Completed',
      value: stats.completed_cases || 0,
      icon: '✅',
      color: '#10b981'
    },
    {
      title: 'Pending',
      value: stats.pending_cases || 0,
      icon: '⏳',
      color: '#f59e0b'
    },
    {
      title: 'Avg Rating',
      value: stats.avg_rating ? stats.avg_rating.toFixed(1) : 'N/A',
      icon: '⭐',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
            <span style={{ color: stat.color }}>{stat.icon}</span>
          </div>
          <div className="stat-content">
            <p className="stat-title">{stat.title}</p>
            <h3 className="stat-value">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;
