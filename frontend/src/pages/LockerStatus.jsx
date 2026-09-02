import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { getCurrentCustomer } from "../api/customer";

const API_BASE_URL = "http://127.0.0.1:8000";

function LockerStatus() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLockerStatus();
  }, []);

  const loadLockerStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get the REAL logged-in customer
      const customerData = await getCurrentCustomer(token);

      console.log("LOCKER STATUS - REAL CUSTOMER:", customerData);

      setCustomer(customerData);

      // Get the latest verification session
      if (customerData.verification_id) {
        const response = await fetch(
          `${API_BASE_URL}/verification/${customerData.verification_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        console.log(
          "LOCKER STATUS - VERIFICATION:",
          response.status,
          data
        );

        if (response.ok) {
          setVerification(data);
        }
      }
    } catch (err) {
      console.error("Failed to load locker status:", err);

      setError(
        err.message || "Unable to load locker information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLockerOperation = () => {
    const verificationState =
      verification?.state ||
      customer?.verification_status;

    if (verificationState !== "APPROVED") {
      alert(
        "Locker operation is not allowed until verification is approved."
      );
      return;
    }

    alert(
      `Locker operation approved for ${customer.locker_number} (Demo)`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-6 py-8">
          <Card>
            <div className="text-center py-10">
              <p className="text-gray-500">
                Loading locker information...
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-6 py-8">
          <Card>
            <div className="text-center py-10">
              <p className="text-red-500 font-medium">
                {error}
              </p>

              <div className="mt-6 flex justify-center">
                <Button onClick={loadLockerStatus}>
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const verificationState =
    verification?.state ||
    customer.verification_status ||
    "NOT_STARTED";

  const isApproved = verificationState === "APPROVED";

  const statusText = isApproved
    ? "READY"
    : verificationState;

  const statusMessage = isApproved
    ? "Locker operation can be initiated after verification."
    : "Locker operation is currently unavailable.";

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Success Header */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🔐
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Locker Operation Status
          </h2>

          <p className="text-gray-500 mt-2">
            Your verification process is complete.
          </p>

        </div>

        {/* Status Card */}
        <Card>

          <div className="text-center">

            <StatusBadge status={statusText} />

            <h3 className="text-2xl font-semibold text-gray-800 mt-5">
              {isApproved
                ? "Locker Ready"
                : "Verification Status"}
            </h3>

            <p className="text-gray-500 mt-2">
              {statusMessage}
            </p>

          </div>

          {/* Locker Information */}
          <div className="mt-8 border-t pt-6">

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Locker Information
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <p className="text-sm text-gray-500">
                  Customer Name
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.full_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customer ID
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.customer_id || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Locker Number
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.locker_number || "Not Assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Branch
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.branch || "N/A"}
                </p>
              </div>

            </div>

          </div>

          {/* Operation Button */}
          <div className="mt-8 flex justify-center">

            <Button
              onClick={handleLockerOperation}
              disabled={!isApproved}
            >
              🔓 Proceed to Locker Operation
            </Button>

          </div>

          {/* Demo Notice */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Demo mode — actual locker operation will be connected
            through the backend.
          </p>

        </Card>

        {/* Back to Dashboard */}
        <div className="mt-6 flex justify-center">

          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>

        </div>

      </main>

    </div>
  );
}

export default LockerStatus;