import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Customer pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DocumentVerification from "./pages/DocumentVerification";
import FaceVerification from "./pages/FaceVerification";
import VerificationResult from "./pages/VerificationResult";
import LockerStatus from "./pages/LockerStatus";

// Officer pages
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

        {/* ========================= */}
        {/* CUSTOMER PORTAL            */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/document-verification"
          element={<DocumentVerification />}
        />

        <Route
          path="/face-verification"
          element={<FaceVerification />}
        />

        <Route
          path="/verification-result"
          element={<VerificationResult />}
        />

        <Route
          path="/locker-status"
          element={<LockerStatus />}
        />

        {/* ========================= */}
        {/* OFFICER PORTAL             */}
        {/* ========================= */}

        <Route
          path="/officer"
          element={
            <Navigate
              to="/officer/login"
              replace
            />
          }
        />

        <Route
          path="/officer/login"
          element={<OfficerLogin />}
        />

        <Route
          path="/officer/dashboard"
          element={<OfficerDashboard />}
        />

        <Route
          path="/officer/customers"
          element={<CustomerSearch />}
        />

        <Route
          path="/officer/customer-verification"
          element={<CustomerVerification />}
        />

        <Route
          path="/officer/lockers"
          element={<LockerOperation />}
        />

        <Route
          path="/officer/security-alerts"
          element={<SecurityAlerts />}
        />

        <Route
          path="/officer/history"
          element={<AuditHistory />}
        />
  

        {/* Unknown route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;