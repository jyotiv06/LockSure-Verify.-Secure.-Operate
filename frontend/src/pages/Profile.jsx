import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import { customer } from "../data/mockData";

function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Page Heading */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Customer Profile
          </h2>

          <p className="text-gray-500 mt-2">
            Review your registered customer information.
          </p>
        </div>

        {/* Profile Card */}
        <Card>

          <div className="flex items-center gap-5 mb-8">

            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
              👤
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800">
                {customer.name}
              </h3>

              <p className="text-gray-500">
                Customer ID: {customer.customerId}
              </p>
            </div>

          </div>

          {/* Customer Details */}
          <div className="grid md:grid-cols-2 gap-6">

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
                Account Number
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {customer.accountNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Mobile Number
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {customer.mobile}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {customer.email}
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

          {/* Continue Button */}
          <div className="mt-8 flex justify-end">

            <Button
              onClick={() => navigate("/document-verification")}
            >
              Continue to Document Verification
            </Button>

          </div>

        </Card>

      </main>

    </div>
  );
}

export default Profile;