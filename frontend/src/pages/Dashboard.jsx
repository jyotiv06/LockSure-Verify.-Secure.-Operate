import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import { customer as mockCustomer } from "../data/mockData";
import { getCurrentCustomer } from "../api/customer";

const API_BASE = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(mockCustomer);
  const [verification, setVerification] = useState({
    document_match: null,
    face_match: null,
    state: null,
    risk_decision: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Get REAL logged-in customer
        const data = await getCurrentCustomer(token);

        setCustomer({
          ...mockCustomer,
          ...data,
          name: data.full_name || mockCustomer.name,
          customerId: data.customer_id || mockCustomer.customerId,
          accountStatus:
            data.account_status || mockCustomer.accountStatus,
          email: data.email || "",
        });

        // Get latest verification session
        const verificationId =
          localStorage.getItem("verification_id");

        if (verificationId) {
          const response = await fetch(
            `${API_BASE}/verification/${verificationId}`
          );

          if (response.ok) {
            const verificationData = await response.json();

            setVerification(verificationData);
          }
        }
      } catch (error) {
        console.error("Unable to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const documentStatus =
    verification.document_match === true
      ? "Verified"
      : verification.document_match === false
        ? "Failed"
        : "Pending";

  const faceStatus =
    verification.face_match === true
      ? "Verified"
      : verification.face_match === false
        ? "Failed"
        : "Pending";

  const profileStatus = "Verified";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>

          <p className="mt-4 text-gray-600">
            Loading customer information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {customer.name}
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your locker verification and operations securely.
          </p>
        </div>

        {/* Account Overview */}
        <div className="grid md:grid-cols-4 gap-5 mb-6">

          <Card>
            <p className="text-sm text-gray-500">
              Account Status
            </p>

            <p className="text-xl font-bold text-green-600 mt-2">
              {customer.accountStatus || "ACTIVE"}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Customer ID
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.customerId}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Locker Number
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.lockerNumber || "Not assigned"}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Locker Status
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.lockerStatus || "OCCUPIED"}
            </p>
          </Card>

        </div>

        {/* Customer Information */}
        <Card>

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Customer Information
          </h3>

          <p className="text-gray-500 mb-6">
            Your registered customer and locker details.
          </p>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.email || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Customer ID
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.customerId}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Number
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.accountNumber || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Branch
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.branch || "Not available"}
              </p>
            </div>

          </div>

        </Card>

        {/* Verification */}
        <Card className="mt-6">

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Verification
          </h3>

          <p className="text-gray-500 mb-6">
            Current verification status.
          </p>

          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <span>Profile Verification</span>
              <StatusBadge status={profileStatus} />
            </div>

            <div className="flex justify-between items-center">
              <span>Document Verification</span>
              <StatusBadge status={documentStatus} />
            </div>

            <div className="flex justify-between items-center">
              <span>Face Verification</span>
              <StatusBadge status={faceStatus} />
            </div>

          </div>

        </Card>

        {/* Locker Operation */}
        <Card className="mt-6">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Ready to operate your locker?
              </h3>

              <p className="text-gray-500 mt-1">
                Complete identity, document and face verification before
                proceeding with your locker operation.
              </p>
            </div>

            <Button
              onClick={() => navigate("/document-verification")}
            >
              Start Locker Operation →
            </Button>

          </div>

        </Card>

      </main>

    </div>
  );
}

export default Dashboard;