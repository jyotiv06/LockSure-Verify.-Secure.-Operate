import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

import { getCurrentCustomer } from "../api/customer";

const API_BASE = "http://127.0.0.1:8000";

// States in which document + face verification
// have already been successfully completed.
const COMPLETED_VERIFICATION_STATES = [
  "FACE_VERIFIED",
  "RISK_ASSESSMENT",
  "APPROVED",
  "REVIEW",
  "BLOCKED",
  "COMPLETED",
];

function Dashboard() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setError("");

      // --------------------------------------------------
      // GET REAL CUSTOMER
      // --------------------------------------------------

      const customerData = await getCurrentCustomer(token);

      console.log("REAL CUSTOMER:", customerData);

      setCustomer(customerData);

      // --------------------------------------------------
      // GET ACTIVE VERIFICATION
      // --------------------------------------------------

      /*
       * Prefer the verification session created by the
       * current locker operation.
       *
       * This prevents the dashboard from accidentally
       * displaying an older verification session.
       */
      const storedVerificationId =
        localStorage.getItem("verification_id");

      const verificationId =
        storedVerificationId ||
        customerData.verification_id;

      console.log(
        "DASHBOARD VERIFICATION ID:",
        verificationId
      );

      if (!verificationId) {
        setVerification(null);
        return;
      }

      const response = await fetch(
        `${API_BASE}/verification/${verificationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const verificationData =
        await response.json().catch(() => ({}));

      console.log(
        "DASHBOARD VERIFICATION STATUS:",
        response.status
      );

      console.log(
        "DASHBOARD VERIFICATION RESPONSE:",
        verificationData
      );

      if (!response.ok) {
        throw new Error(
          Array.isArray(verificationData.detail)
            ? verificationData.detail
                .map((item) => item.msg)
                .join(", ")
            : verificationData.detail ||
                "Unable to load verification status."
        );
      }

      setVerification(verificationData);

    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      setError(
        err.message ||
          "Unable to load customer information."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --------------------------------------------------
  // REFRESH WHEN USER RETURNS TO DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchDashboardData();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchDashboardData]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

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

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 shadow text-center">
          <p className="text-red-600">
            {error ||
              "Customer information unavailable."}
          </p>

          <button
            onClick={fetchDashboardData}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // VERIFICATION STATUS
  // --------------------------------------------------

  const verificationState =
    String(
      verification?.state || ""
    ).toUpperCase();

  /*
   * Direct result from backend.
   */
  const documentMatch =
    verification?.document_match === true;

  const faceMatch =
    verification?.face_match === true;

  /*
   * Once the verification flow reaches one of these
   * states, document + face verification have already
   * been completed successfully.
   */
  const verificationCompleted =
    COMPLETED_VERIFICATION_STATES.includes(
      verificationState
    );

  /*
   * Final UI values.
   */
  const documentVerified =
    documentMatch || verificationCompleted;

  const faceVerified =
    faceMatch || verificationCompleted;

  const overallVerified =
    documentVerified &&
    faceVerified;

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {customer.full_name}
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your locker verification and
            operations securely.
          </p>
        </div>

        {/* Account Overview */}

        <div className="grid md:grid-cols-4 gap-5 mb-6">

          <Card>
            <p className="text-sm text-gray-500">
              Account Status
            </p>

            <p className="text-xl font-bold text-green-600 mt-2">
              {customer.account_status ||
                "ACTIVE"}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Customer ID
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.customer_id}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Locker Number
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.locker_number ||
                "Not assigned"}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">
              Locker Status
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {customer.locker_status ||
                "Not assigned"}
            </p>
          </Card>

        </div>

        {/* Customer Information */}

        <Card>

          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Customer Information
          </h3>

          <p className="text-gray-500 mb-6">
            Your registered customer and locker
            details.
          </p>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.full_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Customer ID
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.customer_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Number
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.account_number ||
                  "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Branch
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {customer.branch ||
                  "Not available"}
              </p>
            </div>

          </div>

        </Card>

        {/* Verification */}

        <Card className="mt-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Verification
              </h3>

              <p className="text-gray-500 mt-1">
                Current verification status.
              </p>
            </div>

            {overallVerified && (
              <StatusBadge status="Verified" />
            )}

          </div>

          <div className="space-y-4">

            {/* Profile */}

            <div className="flex justify-between items-center">
              <span>
                Profile Verification
              </span>

              <StatusBadge status="Verified" />
            </div>

            {/* Document */}

            <div className="flex justify-between items-center">
              <span>
                Document Verification
              </span>

              <StatusBadge
                status={
                  documentVerified
                    ? "Verified"
                    : "Pending"
                }
              />
            </div>

            {/* Face */}

            <div className="flex justify-between items-center">
              <span>
                Face Verification
              </span>

              <StatusBadge
                status={
                  faceVerified
                    ? "Verified"
                    : "Pending"
                }
              />
            </div>

          </div>

          {/* Final State */}

          {verificationState && (
            <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3">

              <div className="flex justify-between items-center">

                <span className="text-sm text-gray-500">
                  Verification State
                </span>

                <span className="text-sm font-bold text-gray-800">
                  {verificationState}
                </span>

              </div>

            </div>
          )}

        </Card>

        {/* Locker Operation */}

        <Card className="mt-6">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {overallVerified
                  ? "Locker verification complete"
                  : "Ready to operate your locker?"}
              </h3>

              <p className="text-gray-500 mt-1">
                {overallVerified
                  ? "Your identity, document and face verification have been successfully completed."
                  : "Complete identity, document and face verification before proceeding with your locker operation."}
              </p>
            </div>

            <Button
              onClick={() =>
                navigate(
                  overallVerified
                    ? "/verification-result"
                    : "/document-verification"
                )
              }
            >
              {overallVerified
                ? "View Verification Result →"
                : "Start Locker Operation →"}
            </Button>

          </div>

        </Card>

      </main>

    </div>
  );
}

export default Dashboard;