import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './CaseList.css';

function CaseList({ cases, onCaseClick }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No cases to display</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: '#f59e0b' },
      assigned: { label: 'Assigned', color: '#3b82f6' },
      in_progress: { label: 'In Progress', color: '#8b5cf6' },
      completed: { label: 'Completed', color: '#10b981' },
      cancelled: { label: 'Cancelled', color: '#ef4444' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className="status-badge"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getConsultationType = (type) => {
    const typeConfig = {
      trial: { label: 'Trial', icon: '🆓' },
      paid: { label: 'Paid', icon: '💰' },
      free_offer: { label: 'Free Offer', icon: '🎁' }
    };

    const config = typeConfig[type] || typeConfig.paid;

    return (
      <span className="consultation-type">
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="case-list">
      {cases.map((caseItem) => (
        <div
          key={caseItem.id}
          className="case-card"
          onClick={() => onCaseClick(caseItem)}
        >
          <div className="case-header">
            <div className="case-info">
              <h4>{caseItem.user_name || 'Anonymous'}</h4>
              <p className="case-phone">{caseItem.phone}</p>
            </div>
            <div className="case-badges">
              {getStatusBadge(caseItem.status)}
              {caseItem.priority > 0 && (
                <span className="priority-badge">⚡ Priority</span>
              )}
            </div>
          </div>

          <div className="case-body">
            <p className="case-symptoms">
              <strong>Symptoms:</strong> {caseItem.symptoms}
            </p>
            {caseItem.response && (
              <p className="case-response">
                <strong>Your Response:</strong> {caseItem.response}
              </p>
            )}
          </div>

          <div className="case-footer">
            <span className="case-time">
              {formatDistanceToNow(new Date(caseItem.created_at), {
                addSuffix: true
              })}
            </span>
            {getConsultationType(caseItem.consultation_type)}
            {caseItem.consultation_count > 0 && (
              <span className="consultation-count">
                {caseItem.consultation_count} consultations
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CaseList;
