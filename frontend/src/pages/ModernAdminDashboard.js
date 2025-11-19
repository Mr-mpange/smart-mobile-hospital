import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiClock, FiCheckCircle, FiAlertCircle, FiBarChart2, 
  FiBell, FiSettings, FiMenu, FiX, FiSearch, FiDownload,
  FiUser, FiLogOut, FiMoon, FiSun, FiEye, FiCheck, FiXCircle,
  FiUsers, FiFileText, FiActivity, FiTrendingUp
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ModernAdminDashboard.css';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function ModernAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
    // Simulate real-time notifications
    const interval = setInterval(() => {
      // Check for new notifications
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, doctorsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors')
      ]);

      setStats(statsRes.data.stats);
      setDoctors(doctorsRes.data.doctors);
      
      // Filter pending verifications
      const pending = doctorsRes.data.doctors.filter(d => !d.is_verified);
      setPendingVerifications(pending);

      // Generate sample notifications
      setNotifications([
        { id: 1, type: 'warning', message: '3 certificates expiring this month', time: '2 hours ago' },
        { id: 2, type: 'info', message: 'New doctor registration pending', time: '5 hours ago' },
        { id: 3, type: 'success', message: 'Dr. John verified successfully', time: '1 day ago' }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}`, { is_verified: true });
      toast.success('Doctor verified successfully!');
      loadData();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to verify doctor');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      toast.success('Doctor rejected');
      loadData();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to reject doctor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  const exportToCSV = () => {
    const csv = doctors.map(d => 
      `${d.name},${d.email},${d.phone},${d.specialization},${d.fee}`
    ).join('\n');
    const blob = new Blob([`Name,Email,Phone,Specialization,Fee\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors.csv';
    a.click();
  };

  // Chart data
  const verificationChartData = {
    labels: ['Verified', 'Pending', 'Expired'],
    datasets: [{
      data: [stats?.doctors || 0, pendingVerifications.length, 5],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Verifications',
      data: [12, 19, 15, 25, 22, 30],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Admin Actions',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: true,
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgb(139, 92, 246)',
      tension: 0.4
    }]
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  return (
    <div className={`modern-admin ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            {sidebarOpen && <span className="logo-text">SmartHealth</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FiHome />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <FiClock />
            {sidebarOpen && <span>Pending Verifications</span>}
            {pendingVerifications.length > 0 && (
              <span className="badge">{pendingVerifications.length}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'verified' ? 'active' : ''}`}
            onClick={() => setActiveTab('verified')}
          >
            <FiCheckCircle />
            {sidebarOpen && <span>Verified Doctors</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'expired' ? 'active' : ''}`}
            onClick={() => setActiveTab('expired')}
          >
            <FiAlertCircle />
            {sidebarOpen && <span>Expired Certificates</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiBarChart2 />
            {sidebarOpen && <span>Reports & Analytics</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell />
            {sidebarOpen && <span>Notifications</span>}
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <header className="top-nav">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="search-bar">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search doctors, licenses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="top-nav-actions">
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button className="icon-btn notification-btn">
              <FiBell />
              {notifications.length > 0 && <span className="notification-dot"></span>}
            </button>
            <div className="admin-profile">
              <FiUser />
              <span>Admin</span>
            </div>
            <button className="icon-btn" onClick={handleLogout}>
              <FiLogOut />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card blue">
                  <div className="card-icon">
                    <FiUsers />
                  </div>
                  <div className="card-content">
                    <h3>{stats?.doctors || 0}</h3>
                    <p>Total Verified Doctors</p>
                  </div>
                  <div className="card-trend">
                    <FiTrendingUp />
                    <span>+12%</span>
                  </div>
                </div>

                <div className="summary-card orange">
                  <div className="card-icon">
                    <FiClock />
                  </div>
                  <div className="card-content">
                    <h3>{pendingVerifications.length}</h3>
                    <p>Pending Verifications</p>
                  </div>
                  <div className="card-trend">
                    <FiActivity />
                    <span>Active</span>
                  </div>
                </div>

                <div className="summary-card red">
                  <div className="card-icon">
                    <FiAlertCircle />
                  </div>
                  <div className="card-content">
                    <h3>5</h3>
                    <p>Expired Certificates</p>
                  </div>
                  <div className="card-trend warning">
                    <FiAlertCircle />
                    <span>Alert</span>
                  </div>
                </div>

                <div className="summary-card green">
                  <div className="card-icon">
                    <FiFileText />
                  </div>
                  <div className="card-content">
                    <h3>{stats?.totalCases || 0}</h3>
                    <p>Total Admin Actions</p>
                  </div>
                  <div className="card-trend">
                    <FiTrendingUp />
                    <span>+8%</span>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>Verification Status</h3>
                  <div className="chart-container">
                    <Pie data={verificationChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Monthly Verifications</h3>
                  <div className="chart-container">
                    <Bar data={monthlyChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Weekly Activity</h3>
                  <div className="chart-container">
                    <Line data={activityChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <div className="section-header">
                  <h3>Recent Verifications</h3>
                  <button className="export-btn" onClick={exportToCSV}>
                    <FiDownload />
                    Export CSV
                  </button>
                </div>
                <div className="activity-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Doctor Name</th>
                        <th>License Number</th>
                        <th>Specialization</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.slice(0, 5).map(doctor => (
                        <tr key={doctor.id}>
                          <td>
                            <div className="doctor-cell">
                              <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                              <span>{doctor.name}</span>
                            </div>
                          </td>
                          <td>{doctor.phone}</td>
                          <td>{doctor.specialization}</td>
                          <td>
                            <span className={`status-badge ${doctor.is_active ? 'verified' : 'pending'}`}>
                              {doctor.is_active ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="action-btn view"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowModal(true);
                              }}
                            >
                              <FiEye />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pending' && (
            <div className="pending-section">
              <div className="section-header">
                <h2>Pending Verifications</h2>
                <span className="count-badge">{pendingVerifications.length} pending</span>
              </div>
              
              <div className="verification-grid">
                {pendingVerifications.map(doctor => (
                  <div key={doctor.id} className="verification-card">
                    <div className="verification-header">
                      <div className="doctor-avatar large">{doctor.name.charAt(0)}</div>
                      <div className="doctor-info">
                        <h4>{doctor.name}</h4>
                        <p>{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="verification-details">
                      <div className="detail-row">
                        <span>Email:</span>
                        <span>{doctor.email}</span>
                      </div>
                      <div className="detail-row">
                        <span>Phone:</span>
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="detail-row">
                        <span>Fee:</span>
                        <span>KES {doctor.fee}</span>
                      </div>
                      <div className="detail-row">
                        <span>Registered:</span>
                        <span>{new Date(doctor.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="verification-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(doctor.id)}
                      >
                        <FiCheck />
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleReject(doctor.id)}
                      >
                        <FiXCircle />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'verified' && (
            <div className="verified-section">
              <div className="section-header">
                <h2>Verified Doctors</h2>
                <button className="export-btn" onClick={exportToCSV}>
                  <FiDownload />
                  Export
                </button>
              </div>
              
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.filter(d => d.is_active).map(doctor => (
                      <tr key={doctor.id}>
                        <td>
                          <div className="doctor-cell">
                            <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                            <span>{doctor.name}</span>
                          </div>
                        </td>
                        <td>{doctor.email}</td>
                        <td>{doctor.phone}</td>
                        <td>{doctor.specialization}</td>
                        <td>KES {doctor.fee}</td>
                        <td>
                          <span className={`status-badge ${doctor.status}`}>
                            {doctor.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn view"
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowModal(true);
                            }}
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Reports & Analytics</h2>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Verification Trends</h3>
                  <div className="chart-container large">
                    <Line data={activityChartData} />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Status Distribution</h3>
                  <div className="chart-container large">
                    <Pie data={verificationChartData} />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Monthly Performance</h3>
                  <div className="chart-container large">
                    <Bar data={monthlyChartData} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <h2>System Notifications</h2>
              
              <div className="notifications-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.type}`}>
                    <div className="notification-icon">
                      {notif.type === 'warning' && <FiAlertCircle />}
                      {notif.type === 'info' && <FiBell />}
                      {notif.type === 'success' && <FiCheckCircle />}
                    </div>
                    <div className="notification-content">
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FiX />
            </button>
            
            <div className="modal-header">
              <div className="doctor-avatar xlarge">{selectedDoctor.name.charAt(0)}</div>
              <div>
                <h2>{selectedDoctor.name}</h2>
                <p>{selectedDoctor.specialization}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedDoctor.email}</p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p>{selectedDoctor.phone}</p>
                </div>
                <div className="detail-item">
                  <label>Consultation Fee</label>
                  <p>KES {selectedDoctor.fee}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge ${selectedDoctor.status}`}>
                      {selectedDoctor.status}
                    </span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Total Consultations</label>
                  <p>{selectedDoctor.total_consultations}</p>
                </div>
                <div className="detail-item">
                  <label>Rating</label>
                  <p>⭐ {selectedDoctor.rating || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {!selectedDoctor.is_active && (
                <>
                  <button 
                    className="modal-btn approve"
                    onClick={() => handleApprove(selectedDoctor.id)}
                  >
                    <FiCheck />
                    Approve
                  </button>
                  <button 
                    className="modal-btn reject"
                    onClick={() => handleReject(selectedDoctor.id)}
                  >
                    <FiXCircle />
                    Reject
                  </button>
                </>
              )}
              <button 
                className="modal-btn secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ModernAdminDashboard;
