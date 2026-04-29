import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScanPillPage from './pages/ScanPill.jsx';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MedicalVault from './pages/MedicalVault';
import Medications from './pages/Medications';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="vault" element={<MedicalVault />} />
          <Route path="medications" element={<Medications />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="scan" element={<ScanPillPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

