import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";

function DocumentVerification() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  const handleContinue = () => {
    navigate("/face-verification");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Document Verification
          </h2>

          <p className="text-gray-500 mt-2">
            Upload a valid identity document for verification.
          </p>
        </div>

        {/* Verification Steps */}
        <div className="flex items-center gap-3 mb-6">
          <StatusBadge status="Verified" />

          <span className="text-gray-400">→</span>

          <StatusBadge status="Pending" />

          <span className="text-gray-500 text-sm">
            Document Verification
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Document Upload */}
          <Card>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Upload Document
            </h3>

            <p className="text-gray-500 text-sm mb-5">
              Accepted documents: Aadhaar Card, PAN Card, Passport or Driving
              Licence.
            </p>

            <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">

              <div className="text-4xl mb-3">
                📄
              </div>

              <p className="font-medium text-gray-700">
                Choose a document
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Click here to upload
              </p>

              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />

            </label>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">

                <p className="text-sm text-green-700">
                  ✓ Document selected
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {selectedFile.name}
                </p>

              </div>
            )}

          </Card>

          {/* Camera Section */}
          <Card>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Capture Document
            </h3>

            <p className="text-gray-500 text-sm mb-5">
              You can also capture your document using the camera.
            </p>

            {/* Dummy Camera */}
            <div className="h-52 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-white">

              {cameraOpen ? (
                <>
                  <div className="text-4xl mb-3">
                    📷
                  </div>

                  <p>
                    Camera Preview
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Camera integration will be added later.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">
                    📷
                  </div>

                  <p>
                    Camera is currently closed
                  </p>
                </>
              )}

            </div>

            <div className="mt-4">

              <Button
                variant="secondary"
                onClick={() => setCameraOpen(!cameraOpen)}
              >
                {cameraOpen ? "Close Camera" : "Open Camera"}
              </Button>

            </div>

          </Card>

        </div>

        {/* Continue */}
        <div className="mt-6 flex justify-end">

          <Button
            onClick={handleContinue}
          >
            Continue to Face Verification
          </Button>

        </div>

      </main>

    </div>
  );
}

export default DocumentVerification;