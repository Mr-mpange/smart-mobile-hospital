import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    specialization: '',
    fee: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, doctorsRes, usersRes, casesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors'),
        api.get('/admin/users'),
        api.get('/admin/cases')
      ]);

      setStats(statsRes.data.stats);
      setDoctors(doctorsRes.data.doctors);
      setUsers(usersRes.data.users);
      setCases(casesRes.data.cases);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/doctors', newDoctor);
      alert('Doctor added successfully!');
      setShowAddDoctor(false);
      setNewDoctor({
        name: '',
        phone: '',
        email: '',
        password: '',
        specialization: '',
        fee: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert(error.response?.data?.error || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }

    try {
      await api.delete(`/admin/doctors/${id}`);
      alert('Doctor deactivated successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to deactivate doctor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  if (!stats) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>SmartHealth Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'doctors' ? 'active' : ''}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors ({doctors.length})
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={activeTab === 'cases' ? 'active' : ''}
          onClick={() => setActiveTab('cases')}
        >
          Cases ({cases.length})
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Doctors</h3>
                <p className="stat-number">{stats.doctors}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.users}</p>
              </div>
              <div className="stat-card">
                <h3>Total Cases</h3>
                <p className="stat-number">{stats.totalCases}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Cases</h3>
                <p className="stat-number">{stats.pendingCases}</p>
              </div>
              <div className="stat-card">
                <h3>Completed Cases</h3>
                <p className="stat-number">{stats.completedCases}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number">TZS {stats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="doctors-section">
            <div className="section-header">
              <h2>Doctors Management</h2>
              <button onClick={() => setShowAddDoctor(true)} className="add-btn">
                + Add Doctor
              </button>
            </div>

            {showAddDoctor && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Add New Doctor</h3>
                  <form onSubmit={handleAddDoctor}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone (+254...)"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Specialization"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Consultation Fee (TZS)"
                      value={newDoctor.fee}
                      onChange={(e) => setNewDoctor({...newDoctor, fee: e.target.value})}
                      required
                    />
                    <div className="modal-actions">
                      <button type="submit" className="submit-btn">Add Doctor</button>
                      <button type="button" onClick={() => setShowAddDoctor(false)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Consultations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doctor => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.specialization}</td>
                    <td>TZS {doctor.fee}</td>
                    <td>
                      <span className={`status-badge ${doctor.status}`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td>{doctor.total_consultations}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="delete-btn"
                        disabled={!doctor.is_active}
                      >
                        {doctor.is_active ? 'Deactivate' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Users</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phone</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Consultations</th>
                  <th>Balance</th>
                  <th>Trial Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.phone}</td>
                    <td>{user.name || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>{user.consultation_count}</td>
                    <td>TZS {user.balance}</td>
                    <td>
                      {user.trial_end ? (
                        new Date(user.trial_end) > new Date() ? 'Active' : 'Expired'
                      ) : 'No Trial'}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="cases-section">
            <h2>Cases</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(caseItem => (
                  <tr key={caseItem.id}>
                    <td>#{caseItem.id}</td>
                    <td>{caseItem.user_name || 'Unknown'}</td>
                    <td>{caseItem.phone}</td>
                    <td>{caseItem.doctor_name || 'Unassigned'}</td>
                    <td className="symptoms-cell">{caseItem.symptoms.substring(0, 50)}...</td>
                    <td>
                      <span className={`status-badge ${caseItem.status}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td>{caseItem.consultation_type}</td>
                    <td>{new Date(caseItem.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
