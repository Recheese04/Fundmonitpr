import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminOverview from './pages/dashboards/admin/AdminOverview';
import AdminBudgets from './pages/dashboards/admin/AdminBudgets';
import AdminReports from './pages/dashboards/admin/AdminReports';
import UserManagement from './pages/dashboards/admin/UserManagement';

// Department Head Pages
import DeptOverview from './pages/dashboards/dept-head/DeptOverview';
import Approvals from './pages/dashboards/dept-head/Approvals';
import DeptReports from './pages/dashboards/dept-head/DeptReports';
import DeptAlerts from './pages/dashboards/dept-head/DeptAlerts';
import BudgetAllocation from './pages/dashboards/dept-head/BudgetAllocation';
import CategoryManager from './pages/dashboards/dept-head/CategoryManager';

// Staff Pages
import StaffDashboard from './pages/dashboards/staff/StaffDashboard';
import StaffRequest from './pages/dashboards/staff/StaffRequest';
import StaffHistory from './pages/dashboards/staff/StaffHistory';
import StaffAlerts from './pages/dashboards/staff/StaffAlerts';
import StaffSettings from './pages/dashboards/staff/StaffSettings';
// NEW: Import the Tracker component you just created
import StaffBudgetTracker from './pages/dashboards/staff/StaffBudgetTracker'; 

// ProtectedRoute
const ProtectedRoute = ({ children, allowedRole }) => {
  const userString = localStorage.getItem('user');
  
  if (!userString) return <Navigate to="/login" replace />;

  const user = JSON.parse(userString);
  const userRole = user.role?.toLowerCase().replace(/\s+/g,"_").trim();
  const targetRole = allowedRole.toLowerCase().replace(/\s+/g,"_").trim();

  if (userRole !== targetRole) {
    console.error(`Access Denied. User: "${userRole}", Required: "${targetRole}"`);
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Access */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* ADMIN SECTION */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin-budgets" element={<ProtectedRoute allowedRole="admin"><AdminBudgets /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute allowedRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin-reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />

        {/* DEPARTMENT HEAD SECTION */}
        <Route path="/dept-dashboard" element={<ProtectedRoute allowedRole="department_head"><DeptOverview /></ProtectedRoute>} />
        <Route path="/dept-budget-allocation" element={<ProtectedRoute allowedRole="department_head"><BudgetAllocation /></ProtectedRoute>} />
        <Route path="/dept-categories" element={<ProtectedRoute allowedRole="department_head"><CategoryManager /></ProtectedRoute>} />
        <Route path="/dept-approvals" element={<ProtectedRoute allowedRole="department_head"><Approvals /></ProtectedRoute>} />
        <Route path="/dept-reports" element={<ProtectedRoute allowedRole="department_head"><DeptReports /></ProtectedRoute>} />
        <Route path="/dept-alerts" element={<ProtectedRoute allowedRole="department_head"><DeptAlerts /></ProtectedRoute>} />

        {/* STAFF SECTION */}
        <Route path="/staff-dashboard" element={<ProtectedRoute allowedRole="staff"><StaffDashboard /></ProtectedRoute>} />
        {/* NEW: Added the Budget Tracker Route here */}
        <Route path="/staff-budget-tracker" element={<ProtectedRoute allowedRole="staff"><StaffBudgetTracker /></ProtectedRoute>} />
        <Route path="/staff-request" element={<ProtectedRoute allowedRole="staff"><StaffRequest /></ProtectedRoute>} />
        <Route path="/staff-history" element={<ProtectedRoute allowedRole="staff"><StaffHistory /></ProtectedRoute>} />
        <Route path="/staff-alerts" element={<ProtectedRoute allowedRole="staff"><StaffAlerts /></ProtectedRoute>} />
        <Route path="/staff-settings" element={<ProtectedRoute allowedRole="staff"><StaffSettings /></ProtectedRoute>} />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;