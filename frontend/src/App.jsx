import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
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
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/document-verification"
          element={<DocumentVerification />}/>
        <Route
  path="/face-verification"
  element={<FaceVerification />}/>
        <Route
  path="/verification-result"
  element={<VerificationResult />}/>
        <Route
  path="/locker-status"
  element={<LockerStatus />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;