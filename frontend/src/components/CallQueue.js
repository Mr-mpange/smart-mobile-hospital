import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import './CallQueue.css';

function CallQueue() {
  const [callQueue, setCallQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    loadCallQueue();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadCallQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCallQueue = async () => {
    try {
      const response = await api.get('/doctors/call-queue');
      setCallQueue(response.data.queue);
    } catch (error) {
      console.error('Failed to load call queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessing({ ...processing, [requestId]: true });
    
    try {
      await api.post(`/doctors/call-queue/${requestId}/accept`);
      toast.success('Call request accepted! Connecting...');
      loadCallQueue();
    } catch (error) {
      toast.error('Failed to accept call');
    } finally {
      setProcessing({ ...processing, [requestId]: false });
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Reason for rejection (optional):');
    
    setProcessing({ ...processing, [requestId]: true });
    
    try {
      await api.post(`/doctors/call-queue/${requestId}/reject`, { reason });
      toast.success('Call request rejected');
      loadCallQueue();
    } catch (error) {
      toast.error('Failed to reject call');
    } finally {
      setProcessing({ ...processing, [requestId]: false });
    }
  };

  if (loading) {
    return (
      <div className="call-queue-loading">
        <div className="spinner"></div>
        <p>Loading call queue...</p>
      </div>
    );
  }

  if (callQueue.length === 0) {
    return (
      <div className="call-queue-empty">
        <p>📞 No pending voice calls</p>
      </div>
    );
  }

  return (
    <div className="call-queue">
      <div className="call-queue-header">
        <h3>📞 Voice Call Queue</h3>
        <span className="call-count">{callQueue.length} pending</span>
      </div>

      <div className="call-list">
        {callQueue.map((call) => (
          <div key={call.id} className="call-card">
            <div className="call-header">
              <div className="call-info">
                <h4>🔴 LIVE CALL REQUEST</h4>
                <p className="call-patient">{call.user_name || 'Anonymous'}</p>
                <p className="call-phone">{call.user_phone}</p>
              </div>
              <div className="call-time">
                {formatDistanceToNow(new Date(call.created_at), {
                  addSuffix: true
                })}
              </div>
            </div>

            {call.symptoms && (
              <div className="call-symptoms">
                <strong>Symptoms:</strong>
                <p>{call.symptoms}</p>
              </div>
            )}

            <div className="call-actions">
              <button
                className="accept-button"
                onClick={() => handleAccept(call.id)}
                disabled={processing[call.id]}
              >
                {processing[call.id] ? 'Processing...' : '✓ Accept Call'}
              </button>
              <button
                className="reject-button"
                onClick={() => handleReject(call.id)}
                disabled={processing[call.id]}
              >
                {processing[call.id] ? 'Processing...' : '✗ Reject'}
              </button>
            </div>

            <div className="call-warning">
              ⚠️ Patient is waiting on the line. Please respond quickly.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CallQueue;
