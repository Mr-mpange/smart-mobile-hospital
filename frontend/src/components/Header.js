import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Header.css';

function Header() {
  const { doctor, logout, updateStatus } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(newStatus);
      toast.success(`Status changed to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'busy':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>🏥 SmartHealth</h1>
        </div>

        <div className="header-right">
          <div className="status-selector">
            <div
              className="status-badge"
              style={{ backgroundColor: getStatusColor(doctor?.status) }}
            >
              {doctor?.status}
            </div>
            <select
              value={doctor?.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-dropdown"
            >
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="doctor-menu">
            <button
              className="doctor-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="doctor-avatar">
                {doctor?.name?.charAt(0) || 'D'}
              </span>
              <span className="doctor-name">{doctor?.name}</span>
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <div className="menu-item">
                  <strong>{doctor?.name}</strong>
                  <small>{doctor?.specialization}</small>
                </div>
                <div className="menu-divider"></div>
                <button className="menu-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
