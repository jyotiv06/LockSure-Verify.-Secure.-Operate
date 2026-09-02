import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DocumentVerification from "./pages/DocumentVerification";
import FaceVerification from "./pages/FaceVerification";
import VerificationResult from "./pages/VerificationResult";
import LockerStatus from "./pages/LockerStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Portal */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Verification Flow */}
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

        {/* Unknown route → Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;