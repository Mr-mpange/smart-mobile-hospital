# Admin Dashboard Notifications Guide

## When You'll Receive Notifications 🔔

### 1. **Immediately on Login**
When you log into the admin dashboard, the system checks for:
- Inactive doctors pending verification
- Unassigned cases waiting for doctor assignment

**Example:**
```
🟡 2 doctors pending verification
🔵 5 cases awaiting assignment
```

---

### 2. **Auto-Refresh Every 30 Seconds**
The dashboard automatically polls the backend every 30 seconds to check for new notifications.

**Timeline:**
```
00:00 - Login (initial load)
00:30 - Auto-refresh #1
01:00 - Auto-refresh #2
01:30 - Auto-refresh #3
...continues every 30 seconds
```

---

### 3. **After Any Action**
When you perform an action (approve/reject doctor, assign case), the dashboard immediately refreshes to show updated notifications.

**Actions that trigger refresh:**
- ✅ Approve doctor
- ❌ Reject/deactivate doctor
- 📋 Assign case to doctor
- ➕ Add new doctor

---

## Where to See Notifications

### 1. **Sidebar Badge** (Always Visible)
```
┌─────────────────────┐
│ 🔔 Notifications    │
│    [2] ← Badge      │
└─────────────────────┘
```

### 2. **Top Navigation Bell** (Always Visible)
```
┌──────────────────────────────┐
│  🔍 Search   🔔[•] 👤 Admin  │
│              ↑                │
│         Red dot when          │
│      notifications exist      │
└──────────────────────────────┘
```

### 3. **Notifications Tab** (Click to View Details)
Click on "Notifications" in the sidebar to see full list:
```
┌─────────────────────────────────────┐
│ System Notifications                │
├─────────────────────────────────────┤
│ 🟡 2 doctors pending verification   │
│    Now                              │
├─────────────────────────────────────┤
│ 🔵 5 cases awaiting assignment      │
│    Now                              │
└─────────────────────────────────────┘
```

---

## Notification Types

### 🟡 Warning (Yellow)
**Trigger:** Inactive doctors need verification
```javascript
{
  type: 'warning',
  message: '2 doctors pending verification',
  time: 'Now',
  action: 'verifications'
}
```

**What to do:**
1. Go to "Verifications" tab
2. Review pending doctors
3. Click "Approve" or "Reject"

---

### 🔵 Info (Blue)
**Trigger:** Cases waiting for doctor assignment
```javascript
{
  type: 'info',
  message: '5 cases awaiting assignment',
  time: 'Now',
  action: 'cases'
}
```

**What to do:**
1. Go to "Cases" tab (if implemented)
2. Assign cases to available doctors

---

### 🟢 Success (Green)
**Trigger:** Successful actions completed
```javascript
{
  type: 'success',
  message: 'Dr. John verified successfully',
  time: '2 minutes ago'
}
```

---

## How to Test Notifications

### Test 1: Add Inactive Doctor
```bash
# 1. Add a new doctor (inactive by default)
POST /api/admin/doctors
{
  "name": "Dr. Test",
  "email": "test@example.com",
  "password": "test123",
  "phone": "+255712345678",
  "specialization": "General",
  "fee": 500
}

# 2. Refresh admin dashboard
# 3. You should see: "🟡 1 doctor pending verification"
```

### Test 2: Create Pending Case
```bash
# 1. Use USSD to create a consultation
# 2. Don't assign it to a doctor
# 3. Refresh admin dashboard
# 4. You should see: "🔵 X cases awaiting assignment"
```

### Test 3: Auto-Refresh
```bash
# 1. Open admin dashboard
# 2. In another tab, add a doctor via API
# 3. Wait 30 seconds
# 4. Dashboard should auto-update with new notification
```

---

## Backend Logic

### Notification Generation
```javascript
// backend/controllers/admin.controller.js

// Check for inactive doctors
if (inactiveDoctors[0].count > 0) {
  notifications.push({
    id: 'pending-doctors',
    type: 'warning',
    message: `${inactiveDoctors[0].count} doctor(s) pending verification`,
    time: 'Now',
    action: 'verifications'
  });
}

// Check for pending cases
if (pendingCases[0].count > 0) {
  notifications.push({
    id: 'pending-cases',
    type: 'info',
    message: `${pendingCases[0].count} case(s) awaiting assignment`,
    time: 'Now',
    action: 'cases'
  });
}
```

---

## Frontend Logic

### Auto-Refresh Setup
```javascript
// frontend/src/pages/ModernAdminDashboard.js

useEffect(() => {
  loadData(); // Initial load
  
  // Poll every 30 seconds
  const interval = setInterval(() => {
    loadData(); // Refresh data
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Load Data Function
```javascript
const loadData = async () => {
  const statsRes = await api.get('/admin/stats');
  
  // Set notifications from backend
  setNotifications(statsRes.data.notifications || []);
  
  // Update badge counts
  // Sidebar and top nav automatically show badge
};
```

---

## Current Notification Triggers

| Condition | Notification | Badge Color |
|-----------|-------------|-------------|
| `is_active = FALSE` doctors exist | "X doctors pending verification" | 🟡 Yellow |
| `status = 'pending'` cases exist | "X cases awaiting assignment" | 🔵 Blue |
| Doctor approved | "Dr. [Name] verified successfully" | 🟢 Green |

---

## Customizing Notifications

### Add More Notification Types

Edit `backend/controllers/admin.controller.js`:

```javascript
// Example: Low balance alert
const [lowBalanceUsers] = await pool.query(
  'SELECT COUNT(*) as count FROM users WHERE balance < 1000'
);

if (lowBalanceUsers[0].count > 0) {
  notifications.push({
    id: 'low-balance',
    type: 'warning',
    message: `${lowBalanceUsers[0].count} users with low balance`,
    time: 'Now',
    action: 'users'
  });
}
```

---

## Troubleshooting

### "I don't see any notifications"
**Possible reasons:**
1. No inactive doctors in database
2. No pending cases in database
3. API call failing (check browser console)
4. Token expired (re-login)

**Solution:**
```bash
# Add a test doctor (inactive)
POST /api/admin/doctors
{
  "name": "Test Doctor",
  "email": "test@test.com",
  "password": "test123",
  "phone": "+255700000000",
  "specialization": "Test",
  "fee": 100
}

# Refresh dashboard - should see notification
```

### "Notifications not updating"
**Check:**
1. Browser console for errors
2. Network tab - is `/api/admin/stats` being called?
3. Backend logs - is endpoint returning notifications?

**Solution:**
```javascript
// Check if polling is working
console.log('Polling interval:', interval);

// Check if data is loading
console.log('Notifications:', notifications);
```

---

## Summary

✅ **Immediate:** Notifications show on page load  
✅ **Auto-refresh:** Updates every 30 seconds  
✅ **Action-triggered:** Refreshes after approve/reject  
✅ **Visual indicators:** Badge counts on sidebar and top nav  
✅ **Detailed view:** Full list in Notifications tab  

You'll see notifications as soon as there are:
- Inactive doctors needing verification
- Pending cases needing assignment

The system is **live and working** - just add some inactive doctors or pending cases to test! 🎉
