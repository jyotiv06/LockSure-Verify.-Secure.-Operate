import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { customer, verificationStatus } from "../data/mockData";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {customer.name}
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your bank locker verification and operation.
          </p>
        </div>

        {/* Customer Information */}
        <div className="grid md:grid-cols-2 gap-6">

          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              Customer Information
            </h3>

            <div className="space-y-3">

              <p>
                <span className="font-medium">Customer ID:</span>{" "}
                {customer.customerId}
              </p>

              <p>
                <span className="font-medium">Account Number:</span>{" "}
                {customer.accountNumber}
              </p>

              <p>
                <span className="font-medium">Locker Number:</span>{" "}
                {customer.lockerNumber}
              </p>

              <p>
                <span className="font-medium">Branch:</span>{" "}
                {customer.branch}
              </p>

            </div>
          </Card>

          {/* Verification Status */}
          <Card>

            <h3 className="text-xl font-semibold text-gray-800 mb-5">
              Verification Status
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between items-center">
                <span>Profile Verification</span>
                <StatusBadge status={verificationStatus.profile} />
              </div>

              <div className="flex justify-between items-center">
                <span>Document Verification</span>
                <StatusBadge status={verificationStatus.document} />
              </div>

              <div className="flex justify-between items-center">
                <span>Face Verification</span>
                <StatusBadge status={verificationStatus.face} />
              </div>

            </div>

          </Card>

        </div>

        {/* Continue Verification */}
        <Card className="mt-6">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Continue Verification
              </h3>

              <p className="text-gray-500 mt-1">
                Complete the remaining verification steps to operate your locker.
              </p>
            </div>

            <Button
              onClick={() => navigate("/profile")}
            >
              Continue
            </Button>

          </div>

        </Card>

      </main>

    </div>
  );
}

export default Dashboard;