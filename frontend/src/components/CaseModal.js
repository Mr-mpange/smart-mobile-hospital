import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import './CaseModal.css';

function CaseModal({ caseData, onClose, onSubmit }) {
  const [response, setResponse] = useState(caseData.response || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (response.trim().length < 10) {
      alert('Response must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(caseData.id, response);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = caseData.status === 'completed';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Case #{caseData.id}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="patient-info">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{caseData.user_name || 'Anonymous'}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{caseData.phone}</span>
              </div>
              <div className="info-item">
                <label>Consultation Type:</label>
                <span className="capitalize">{caseData.consultation_type.replace('_', ' ')}</span>
              </div>
              <div className="info-item">
                <label>Time:</label>
                <span>
                  {formatDistanceToNow(new Date(caseData.created_at), {
                    addSuffix: true
                  })}
                </span>
              </div>
              {caseData.consultation_count > 0 && (
                <div className="info-item">
                  <label>Previous Consultations:</label>
                  <span>{caseData.consultation_count}</span>
                </div>
              )}
            </div>
          </div>

          <div className="symptoms-section">
            <h3>Symptoms</h3>
            <p className="symptoms-text">{caseData.symptoms}</p>
          </div>

          <form onSubmit={handleSubmit} className="response-form">
            <h3>Your Response</h3>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your medical advice and recommendations..."
              rows="6"
              disabled={isCompleted}
              required
            />

            {!isCompleted && (
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            )}

            {isCompleted && (
              <p className="completed-notice">
                ✅ This case has been completed
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CaseModal;
