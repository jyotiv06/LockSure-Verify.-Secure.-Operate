import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

function VerificationResult() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Heading */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            ✅
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Verification Successful
          </h2>

          <p className="text-gray-500 mt-2">
            Your identity has been successfully verified.
          </p>

        </div>

        {/* Result Card */}
        <Card>

          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Verification Results
          </h3>

          <div className="space-y-5">

            {/* Document */}
            <div className="flex justify-between items-center border-b pb-4">

              <div>
                <p className="font-medium text-gray-800">
                  Document Verification
                </p>

                <p className="text-sm text-gray-500">
                  Identity document successfully verified.
                </p>
              </div>

              <StatusBadge status="Verified" />

            </div>

            {/* Face */}
            <div className="flex justify-between items-center border-b pb-4">

              <div>
                <p className="font-medium text-gray-800">
                  Face Verification
                </p>

                <p className="text-sm text-gray-500">
                  Face successfully matched with customer data.
                </p>
              </div>

              <StatusBadge status="Verified" />

            </div>

            {/* Customer Data */}
            <div className="flex justify-between items-center">

              <div>
                <p className="font-medium text-gray-800">
                  Customer Data Matching
                </p>

                <p className="text-sm text-gray-500">
                  Submitted information matches bank records.
                </p>
              </div>

              <StatusBadge status="Verified" />

            </div>

          </div>

          {/* Continue */}
          <div className="mt-8 flex justify-end">

            <Button
              onClick={() => navigate("/locker-status")}
            >
              Continue to Locker Operation
            </Button>

          </div>

        </Card>

      </main>

    </div>
  );
}

export default VerificationResult;