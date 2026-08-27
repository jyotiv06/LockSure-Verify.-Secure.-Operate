import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

function FaceVerification() {
  const navigate = useNavigate();

  const [cameraOpen, setCameraOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerification = () => {
    setVerifying(true);

    setTimeout(() => {
      navigate("/verification-result");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Face Verification
          </h2>

          <p className="text-gray-500 mt-2">
            Capture your face to complete identity verification.
          </p>
        </div>

        <Card>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Face Capture
          </h3>

          <p className="text-gray-500 text-sm mb-5">
            Position your face inside the camera frame.
          </p>

          {/* Dummy Camera Area */}
          <div className="bg-gray-900 rounded-xl h-80 flex flex-col items-center justify-center text-white">

            {verifying ? (
              <>
                <Loader />

                <p className="mt-3">
                  Verifying your face...
                </p>
              </>
            ) : cameraOpen ? (
              <>
                <div className="text-6xl mb-4">
                  👤
                </div>

                <div className="border-2 border-dashed border-white rounded-full w-40 h-48 flex items-center justify-center">
                  <span className="text-gray-400">
                    Face
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  Camera preview (demo)
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">
                  📷
                </div>

                <p>
                  Camera is currently closed
                </p>
              </>
            )}

          </div>

          {/* Camera Button */}
          {!verifying && (
            <div className="mt-5">

              <Button
                variant="secondary"
                onClick={() => setCameraOpen(!cameraOpen)}
              >
                {cameraOpen ? "Close Camera" : "Open Camera"}
              </Button>

            </div>
          )}

          {/* Verification Button */}
          {cameraOpen && !verifying && (
            <div className="mt-5 flex justify-end">

              <Button onClick={handleVerification}>
                Verify Face
              </Button>

            </div>
          )}

        </Card>

      </main>

    </div>
  );
}

export default FaceVerification;