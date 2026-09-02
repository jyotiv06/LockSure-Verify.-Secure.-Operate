import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PortalSelection from "./pages/PortalSelection";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DocumentVerification from "./pages/DocumentVerification";
import FaceVerification from "./pages/FaceVerification";
import VerificationResult from "./pages/VerificationResult";
import LockerStatus from "./pages/LockerStatus";

import OfficerLogin from "./pages/officer/OfficerLogin";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import CustomerSearch from "./pages/officer/CustomerSearch";
import CustomerVerification from "./pages/officer/CustomerVerification";
import LockerOperation from "./pages/officer/LockerOperation";
import SecurityAlerts from "./pages/officer/SecurityAlerts";
import AuditHistory from "./pages/officer/AuditHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalSelection />} />

        <Route path="/customer/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/document-verification" element={<DocumentVerification />} />
        <Route path="/face-verification" element={<FaceVerification />} />
        <Route path="/verification-result" element={<VerificationResult />} />
        <Route path="/locker-status" element={<LockerStatus />} />

        <Route path="/officer" element={<Navigate to="/officer/login" replace />} />
        <Route path="/officer/login" element={<OfficerLogin />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/customers" element={<CustomerSearch />} />
        <Route path="/officer/customer-verification" element={<CustomerVerification />} />
        <Route path="/officer/lockers" element={<LockerOperation />} />
        <Route path="/officer/security-alerts" element={<SecurityAlerts />} />
        <Route path="/officer/history" element={<AuditHistory />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
