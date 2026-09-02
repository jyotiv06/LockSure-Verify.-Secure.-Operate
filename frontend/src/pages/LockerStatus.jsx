import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { getCurrentCustomer } from "../api/customer";

function LockerStatus() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const data = await getCurrentCustomer(token);
        setCustomer(data);
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        setError("Unable to load locker information.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-center text-gray-500">
            Loading locker information...
          </p>
        </main>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-center text-red-500">
            {error || "Customer information not available."}
          </p>

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

  const lockerStatus = customer.locker_status || "UNKNOWN";
  const verificationStatus = customer.verification_status || "PENDING";

  const isApproved =
    verificationStatus === "APPROVED" ||
    verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🔐
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Locker Operation Status
          </h2>

          <p className="text-gray-500 mt-2">
            Your current locker and verification status.
          </p>

        </div>

        {/* Status Card */}
        <Card>

          <div className="text-center">

            <StatusBadge status={lockerStatus} />

            <h3 className="text-2xl font-semibold text-gray-800 mt-5">
              {isApproved ? "Locker Ready" : "Verification Pending"}
            </h3>

            <p className="text-gray-500 mt-2">
              Verification Status: {verificationStatus}
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
                  {customer.full_name || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customer ID
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.customer_id || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Locker Number
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.locker_number || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Branch
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.branch || "Not available"}
                </p>
              </div>

            </div>

          </div>

          {/* Verification Status */}
          <div className="mt-8 border-t pt-6">

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verification Status
            </h3>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Customer Verification
              </span>

              <StatusBadge status={verificationStatus} />
            </div>

          </div>

          {/* Locker Operation */}
          <div className="mt-8 flex justify-center">

            <Button
              disabled={!isApproved}
              onClick={() => {
                if (isApproved) {
                  console.log("Locker operation approved by backend");
                }
              }}
            >
              🔓 Proceed to Locker Operation
            </Button>

          </div>

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