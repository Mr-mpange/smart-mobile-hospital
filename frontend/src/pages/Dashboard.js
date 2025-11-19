import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Stats from '../components/Stats';
import CallQueue from '../components/CallQueue';
import CaseList from '../components/CaseList';
import CaseModal from '../components/CaseModal';
import './Dashboard.css';

function Dashboard() {
  const { doctor } = useAuth();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      const [casesRes, statsRes] = await Promise.all([
        api.get(`/doctors/cases${filter !== 'all' ? `?status=${filter}` : ''}`),
        api.get('/doctors/stats')
      ]);

      setCases(casesRes.data.cases);
      setStats(statsRes.data.stats);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
  };

  const handleResponseSubmit = async (caseId, response) => {
    try {
      await api.post(`/doctors/cases/${caseId}/respond`, { response });
      toast.success('Response sent successfully!');
      setSelectedCase(null);
      loadData();
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome, Dr. {doctor?.name?.split(' ')[1] || doctor?.name}</h2>
          <p>Manage your consultations and respond to patients</p>
        </div>

        <Stats stats={stats} />

        <CallQueue />

        <div className="cases-section">
          <div className="cases-header">
            <h3>Patient Queue</h3>
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={filter === 'assigned' ? 'active' : ''}
                onClick={() => setFilter('assigned')}
              >
                Assigned
              </button>
              <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          <CaseList cases={cases} onCaseClick={handleCaseClick} />
        </div>
      </div>

      {selectedCase && (
        <CaseModal
          caseData={selectedCase}
          onClose={handleCloseModal}
          onSubmit={handleResponseSubmit}
        />
      )}
    </div>
  );
}

export default Dashboard;
