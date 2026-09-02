import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Home / Portal Selection
import PortalSelection from "./pages/PortalSelection";

// Customer pages
import Login from "./pages/Login";
import Register from "./pages/Register";
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
        {/* HOME / PORTAL SELECTION */}
        {/* ========================= */}

        <Route
          path="/"
          element={<PortalSelection />}
        />

        {/* ========================= */}
<<<<<<< HEAD
        {/* CUSTOMER AUTHENTICATION */}
=======
        {/* CUSTOMER AUTHENTICATION   */}
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        {/* ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Optional customer login route */}
        <Route
          path="/customer/login"
          element={<Login />}
        />

<<<<<<< HEAD
        {/* ========================= */}
        {/* CUSTOMER PORTAL */}
        {/* ========================= */}

        <Route
=======
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ========================= */}
        {/* CUSTOMER PORTAL            */}
        {/* ========================= */}

        <Route
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ========================= */}
<<<<<<< HEAD
        {/* CUSTOMER VERIFICATION */}
=======
        {/* VERIFICATION FLOW          */}
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        {/* ========================= */}

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
<<<<<<< HEAD
        {/* OFFICER PORTAL */}
=======
        {/* OFFICER PORTAL             */}
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
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

        {/* ========================= */}
<<<<<<< HEAD
        {/* UNKNOWN ROUTES */}
=======
        {/* UNKNOWN ROUTES             */}
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        {/* ========================= */}

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