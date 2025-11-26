import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiClock, FiCheckCircle, FiAlertCircle, FiBarChart2, 
  FiBell, FiSettings, FiMenu, FiX, FiSearch, FiDownload,
  FiUser, FiLogOut, FiMoon, FiSun, FiEye, FiCheck, FiXCircle,
  FiUsers, FiFileText, FiActivity, FiTrendingUp, FiPlus
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ModernAdminDashboard.css';
import api from '../services/api';
import AddDoctorModal from '../components/AddDoctorModal';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function ModernAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    systemName: 'SmartHealth Telemedicine',
    adminEmail: localStorage.getItem('adminEmail') || 'admin@smarthealth.com',
    currency: 'TZS',
    autoAssignCases: 'enabled',
    emailNotifications: 'enabled',
    smsNotifications: 'enabled',
    notificationFrequency: '30'
  });

  useEffect(() => {
    loadData();
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    // Real-time polling for updates every 30 seconds
    const interval = setInterval(() => {
      loadData();
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
      setChartData(statsRes.data.charts);
      
      // Filter pending verifications (inactive doctors)
      const pending = doctorsRes.data.doctors.filter(d => !d.is_active);
      setPendingVerifications(pending);

      // Use real notifications from backend
      const newNotifications = statsRes.data.notifications || [];
      
      // Show toast if new notifications appeared
      if (previousNotificationCount > 0 && newNotifications.length > previousNotificationCount) {
        const newCount = newNotifications.length - previousNotificationCount;
        toast.info(`${newCount} new notification${newCount > 1 ? 's' : ''}!`, {
          position: 'top-right',
          autoClose: 5000
        });
      }
      
      setNotifications(newNotifications);
      setPreviousNotificationCount(newNotifications.length);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleAddDoctor = async (doctorData) => {
    try {
      await api.post('/admin/doctors', doctorData);
      toast.success('Doctor added successfully!');
      loadData();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add doctor');
      throw error;
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      const response = await api.put(`/admin/doctors/${doctorId}`, { is_active: true });
      if (response.data.success) {
        toast.success('Doctor verified and activated successfully!');
        await loadData(); // Reload data to update UI
        setShowModal(false);
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.error || 'Failed to verify doctor');
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/doctors/${doctorId}`);
      if (response.data.success) {
        toast.success('Doctor deactivated successfully');
        await loadData(); // Reload data to update UI
        setShowModal(false);
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.error || 'Failed to deactivate doctor');
    }
  };

  const handleSaveSettings = () => {
    try {
      // Save to localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      localStorage.setItem('adminEmail', settings.adminEmail);
      
      // Update notification frequency if changed
      if (settings.notificationFrequency !== '30') {
        toast.info(`Notification frequency updated to every ${settings.notificationFrequency} seconds`);
      }
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }
    
    const defaultSettings = {
      systemName: 'SmartHealth Telemedicine',
      adminEmail: 'admin@smarthealth.com',
      currency: 'TZS',
      autoAssignCases: 'enabled',
      emailNotifications: 'enabled',
      smsNotifications: 'enabled',
      notificationFrequency: '30'
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    toast.success('Settings reset to defaults');
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

  // Chart data - using real data from backend
  const verificationChartData = {
    labels: ['Verified', 'Pending', 'Completed Cases'],
    datasets: [{
      data: [
        stats?.doctors || 0, 
        stats?.inactiveDoctors || 0, 
        stats?.completedCases || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      borderWidth: 0
    }]
  };

  const monthlyChartData = {
    labels: chartData?.monthlyVerifications?.map(m => {
      const date = new Date(m.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Doctor Registrations',
      data: chartData?.monthlyVerifications?.map(m => m.count) || [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  const activityChartData = {
    labels: chartData?.weeklyActivity?.map(d => {
      const date = new Date(d.day);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Cases Created',
      data: chartData?.weeklyActivity?.map(d => d.count) || [0, 0, 0, 0, 0, 0, 0],
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
                    <h3>{stats?.pendingCases || 0}</h3>
                    <p>Pending Cases</p>
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
                    <h3>{stats?.completedCases || 0}</h3>
                    <p>Completed Cases</p>
                  </div>
                  <div className="card-trend">
                    <FiCheckCircle />
                    <span>Success</span>
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
                        <span>TZS {doctor.fee}</span>
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
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="add-doctor-btn" onClick={() => setShowAddModal(true)}>
                    <FiPlus />
                    Add Doctor
                  </button>
                  <button className="export-btn" onClick={exportToCSV}>
                    <FiDownload />
                    Export
                  </button>
                </div>
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
                        <td>TZS {doctor.fee}</td>
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

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="section-header">
                <h2>System Notifications</h2>
                <p className="section-subtitle">Real-time alerts and system updates</p>
              </div>
              
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <FiBell size={64} />
                  <h3>No Notifications</h3>
                  <p>You're all caught up! No new notifications at this time.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.type}`}>
                      <div className="notification-icon">
                        {notif.type === 'warning' && <FiAlertCircle />}
                        {notif.type === 'info' && <FiBell />}
                        {notif.type === 'success' && <FiCheckCircle />}
                      </div>
                      <div className="notification-content">
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      {notif.action && (
                        <button 
                          className="notification-action"
                          onClick={() => setActiveTab(notif.action)}
                        >
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="verifications-section">
              <div className="section-header">
                <h2>Pending Doctor Verifications</h2>
                <p className="section-subtitle">Review and approve new doctor registrations</p>
              </div>

              {pendingVerifications.length === 0 ? (
                <div className="empty-state">
                  <FiCheckCircle size={64} />
                  <h3>All Caught Up!</h3>
                  <p>No pending verifications at the moment</p>
                </div>
              ) : (
                <div className="doctors-grid">
                  {pendingVerifications.map(doctor => (
                    <div key={doctor.id} className="doctor-verification-card">
                      <div className="doctor-card-header">
                        <div className="doctor-avatar large">{doctor.name.charAt(0)}</div>
                        <div className="doctor-info">
                          <h3>{doctor.name}</h3>
                          <p className="specialization">{doctor.specialization}</p>
                        </div>
                        <span className="status-badge pending">Pending</span>
                      </div>

                      <div className="doctor-card-body">
                        <div className="info-row">
                          <span className="label">Email:</span>
                          <span className="value">{doctor.email}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Phone:</span>
                          <span className="value">{doctor.phone}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Consultation Fee:</span>
                          <span className="value">TZS {doctor.fee}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Registered:</span>
                          <span className="value">{new Date(doctor.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="doctor-card-actions">
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(doctor.id)}
                        >
                          <FiCheck /> Approve
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(doctor.id)}
                        >
                          <FiXCircle /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'verified' && (
            <div className="verified-section">
              <div className="section-header">
                <h2>Verified Doctors</h2>
                <p className="section-subtitle">All active doctors in the system</p>
              </div>

              <div className="doctors-table-container">
                <table className="doctors-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Contact</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Consultations</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.filter(d => d.is_active).map(doctor => (
                      <tr key={doctor.id}>
                        <td>
                          <div className="doctor-cell">
                            <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                            <div>
                              <div className="doctor-name">{doctor.name}</div>
                              <div className="doctor-email">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.phone}</td>
                        <td>TZS {doctor.fee}</td>
                        <td>
                          <span className={`status-badge ${doctor.status}`}>
                            {doctor.status}
                          </span>
                        </td>
                        <td>{doctor.total_consultations || 0}</td>
                        <td>
                          <div className="rating">
                            ⭐ {doctor.rating || 0}
                          </div>
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

          {activeTab === 'expired' && (
            <div className="expired-section">
              <div className="section-header">
                <h2>Inactive Doctors</h2>
                <p className="section-subtitle">Doctors who have been deactivated</p>
              </div>

              {doctors.filter(d => !d.is_active).length === 0 ? (
                <div className="empty-state">
                  <FiCheckCircle size={64} />
                  <h3>No Inactive Doctors</h3>
                  <p>All doctors are currently active</p>
                </div>
              ) : (
                <div className="doctors-table-container">
                  <table className="doctors-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Contact</th>
                        <th>Fee</th>
                        <th>Deactivated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.filter(d => !d.is_active).map(doctor => (
                        <tr key={doctor.id}>
                          <td>
                            <div className="doctor-cell">
                              <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
                              <div>
                                <div className="doctor-name">{doctor.name}</div>
                                <div className="doctor-email">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.phone}</td>
                          <td>TZS {doctor.fee}</td>
                          <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-reactivate"
                              onClick={() => handleApprove(doctor.id)}
                            >
                              <FiCheck /> Reactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="section-header">
                <h2>📊 Reports & Analytics</h2>
                <p className="section-subtitle">Comprehensive system statistics and insights</p>
              </div>

              {/* Top Stats Row */}
              <div className="top-stats-row">
                <div className="stat-card blue">
                  <div className="stat-icon">
                    <FiUsers />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Doctors</span>
                    <span className="stat-number">{stats?.doctors || 0}</span>
                    <span className="stat-change positive">+{stats?.inactiveDoctors || 0} pending</span>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">
                    <FiUser />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Users</span>
                    <span className="stat-number">{stats?.users || 0}</span>
                    <span className="stat-change positive">Active patients</span>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">
                    <FiFileText />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Cases</span>
                    <span className="stat-number">{stats?.totalCases || 0}</span>
                    <span className="stat-change">{stats?.completedCases || 0} completed</span>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-number">TZS {(stats?.revenue || 0).toLocaleString()}</span>
                    <span className="stat-change positive">This month</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="charts-grid">
                <div className="chart-card large">
                  <div className="chart-header">
                    <h3>📈 Monthly Doctor Registrations</h3>
                    <span className="chart-subtitle">Last 6 months trend</span>
                  </div>
                  <div className="chart-wrapper">
                    <Bar 
                      data={monthlyChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        }
                      }} 
                    />
                  </div>
                </div>

                <div className="chart-card large">
                  <div className="chart-header">
                    <h3>📊 Weekly Case Activity</h3>
                    <span className="chart-subtitle">Last 7 days</span>
                  </div>
                  <div className="chart-wrapper">
                    <Line 
                      data={activityChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="bottom-analytics-row">
                <div className="analytics-card-new">
                  <div className="card-header-new">
                    <h3>🎯 Case Status Distribution</h3>
                  </div>
                  <div className="chart-wrapper-small">
                    <Pie 
                      data={verificationChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true
                      }} 
                    />
                  </div>
                  <div className="status-legend">
                    <div className="legend-item">
                      <span className="legend-dot verified"></span>
                      <span>Verified: {stats?.doctors || 0}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot pending"></span>
                      <span>Pending: {stats?.inactiveDoctors || 0}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot completed"></span>
                      <span>Completed: {stats?.completedCases || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card-new">
                  <div className="card-header-new">
                    <h3>🏆 Top Performing Doctors</h3>
                  </div>
                  <div className="leaderboard">
                    {doctors
                      .filter(d => d.is_active)
                      .sort((a, b) => (b.total_consultations || 0) - (a.total_consultations || 0))
                      .slice(0, 5)
                      .map((doctor, index) => (
                        <div key={doctor.id} className="leaderboard-item">
                          <div className={`rank-badge rank-${index + 1}`}>
                            {index + 1}
                          </div>
                          <div className="doctor-avatar-small">{doctor.name.charAt(0)}</div>
                          <div className="doctor-details">
                            <span className="doctor-name-small">{doctor.name}</span>
                            <span className="doctor-spec-small">{doctor.specialization}</span>
                          </div>
                          <div className="consultation-badge">
                            {doctor.total_consultations || 0}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="analytics-card-new">
                  <div className="card-header-new">
                    <h3>📋 Case Breakdown</h3>
                  </div>
                  <div className="case-breakdown">
                    <div className="breakdown-item">
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill pending" 
                          style={{width: `${stats?.totalCases > 0 ? (stats.pendingCases / stats.totalCases * 100) : 0}%`}}
                        ></div>
                      </div>
                      <div className="breakdown-info">
                        <span className="breakdown-label">Pending</span>
                        <span className="breakdown-value">{stats?.pendingCases || 0}</span>
                      </div>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill assigned" 
                          style={{width: `${stats?.totalCases > 0 ? (stats.assignedCases / stats.totalCases * 100) : 0}%`}}
                        ></div>
                      </div>
                      <div className="breakdown-info">
                        <span className="breakdown-label">Assigned</span>
                        <span className="breakdown-value">{stats?.assignedCases || 0}</span>
                      </div>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill completed" 
                          style={{width: `${stats?.totalCases > 0 ? (stats.completedCases / stats.totalCases * 100) : 0}%`}}
                        ></div>
                      </div>
                      <div className="breakdown-info">
                        <span className="breakdown-label">Completed</span>
                        <span className="breakdown-value">{stats?.completedCases || 0}</span>
                      </div>
                    </div>

                    <div className="success-rate-display">
                      <span className="success-label">Success Rate</span>
                      <span className="success-percentage">
                        {stats?.totalCases > 0 
                          ? Math.round((stats.completedCases / stats.totalCases) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              
              <div className="settings-grid">
                <div className="settings-card">
                  <div className="settings-header">
                    <FiSettings />
                    <h3>General Settings</h3>
                  </div>
                  <div className="settings-content">
                    <div className="setting-item">
                      <label>System Name</label>
                      <input 
                        type="text" 
                        value={settings.systemName}
                        onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                        placeholder="Enter system name"
                      />
                    </div>
                    <div className="setting-item">
                      <label>Admin Email</label>
                      <input 
                        type="email" 
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                        placeholder="admin@smarthealth.com"
                      />
                    </div>
                    <div className="setting-item">
                      <label>Currency</label>
                      <select 
                        value={settings.currency}
                        onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      >
                        <option value="TZS">TZS - Tanzanian Shillings</option>
                        <option value="KES">KES - Kenyan Shillings</option>
                        <option value="UGX">UGX - Ugandan Shillings</option>
                        <option value="USD">USD - US Dollars</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <FiUsers />
                    <h3>Doctor Management</h3>
                  </div>
                  <div className="settings-content">
                    <div className="setting-item">
                      <label>Total Doctors</label>
                      <input type="text" value={stats?.doctors || 0} disabled />
                    </div>
                    <div className="setting-item">
                      <label>Pending Verifications</label>
                      <input type="text" value={stats?.inactiveDoctors || 0} disabled />
                    </div>
                    <div className="setting-item">
                      <label>Auto-assign Cases</label>
                      <select 
                        value={settings.autoAssignCases}
                        onChange={(e) => setSettings({...settings, autoAssignCases: e.target.value})}
                      >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <FiBell />
                    <h3>Notification Settings</h3>
                  </div>
                  <div className="settings-content">
                    <div className="setting-item">
                      <label>Email Notifications</label>
                      <select 
                        value={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.value})}
                      >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div className="setting-item">
                      <label>SMS Notifications</label>
                      <select 
                        value={settings.smsNotifications}
                        onChange={(e) => setSettings({...settings, smsNotifications: e.target.value})}
                      >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div className="setting-item">
                      <label>Notification Frequency</label>
                      <select 
                        value={settings.notificationFrequency}
                        onChange={(e) => setSettings({...settings, notificationFrequency: e.target.value})}
                      >
                        <option value="10">Every 10 seconds</option>
                        <option value="30">Every 30 seconds</option>
                        <option value="60">Every minute</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <FiActivity />
                    <h3>System Statistics</h3>
                  </div>
                  <div className="settings-content">
                    <div className="setting-item">
                      <label>Total Users</label>
                      <input type="text" value={stats?.users || 0} disabled />
                    </div>
                    <div className="setting-item">
                      <label>Total Cases</label>
                      <input type="text" value={stats?.totalCases || 0} disabled />
                    </div>
                    <div className="setting-item">
                      <label>Total Revenue</label>
                      <input type="text" value={`TZS ${stats?.revenue || 0}`} disabled />
                    </div>
                  </div>
                </div>

                <div className="settings-card full-width">
                  <div className="settings-header">
                    <FiAlertCircle />
                    <h3>System Information</h3>
                  </div>
                  <div className="settings-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Version</label>
                        <p>1.0.0</p>
                      </div>
                      <div className="info-item">
                        <label>Environment</label>
                        <p>{process.env.NODE_ENV || 'development'}</p>
                      </div>
                      <div className="info-item">
                        <label>Database</label>
                        <p>MySQL</p>
                      </div>
                      <div className="info-item">
                        <label>Last Updated</label>
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn-secondary" onClick={handleSaveSettings}>
                  Save Changes
                </button>
                <button className="btn-danger" onClick={handleResetSettings}>
                  Reset to Defaults
                </button>
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
                  <p>TZS {selectedDoctor.fee}</p>
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

      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDoctor}
      />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ModernAdminDashboard;
