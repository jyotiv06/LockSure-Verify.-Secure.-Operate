import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { customer, lockerStatus } from "../data/mockData";

function LockerStatus() {
  const navigate = useNavigate();

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

            <StatusBadge status={lockerStatus.status} />

            <h3 className="text-2xl font-semibold text-gray-800 mt-5">
              Locker Ready
            </h3>

            <p className="text-gray-500 mt-2">
              {lockerStatus.message}
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
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customer ID
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.customerId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Locker Number
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.lockerNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Branch
                </p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.branch}
                </p>
              </div>

            </div>

          </div>

          {/* Operation Button */}
          <div className="mt-8 flex justify-center">

            <Button
              onClick={() => alert("Locker operation approved (Demo)")}
            >
              🔓 Proceed to Locker Operation
            </Button>

          </div>

          {/* Demo Notice */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Demo mode — actual locker operation will be connected through
            the backend.
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