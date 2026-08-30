import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

function FaceVerification() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const openCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      // Wait until the video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((error) => {
            console.error("Video play error:", error);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else {
        setCameraError("Unable to access the camera.");
      }

      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraError("");
  };

  const handleCameraToggle = () => {
    if (cameraOpen) {
      closeCamera();
    } else {
      openCamera();
    }
  };

  const handleVerification = () => {
    setVerifying(true);

    // Stop camera while verification is being processed
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      navigate("/verification-result");
    }, 2000);
  };

  // Cleanup camera when leaving the page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

          {/* Camera Area */}
          <div className="bg-gray-900 rounded-xl h-80 overflow-hidden relative">

            {verifying ? (
              <div className="h-full flex flex-col items-center justify-center text-white">
                <Loader />

                <p className="mt-3">
                  Verifying your face...
                </p>
              </div>
            ) : cameraOpen ? (
              <div className="relative w-full h-full flex items-center justify-center">

                {/* LIVE CAMERA */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Face Guide */}
                <div className="relative z-10 border-2 border-dashed border-white rounded-full w-40 h-48 flex items-center justify-center">
                  <span className="text-white text-sm bg-black/30 px-3 py-1 rounded">
                    Position Face
                  </span>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white">

                <div className="text-5xl mb-4">
                  📷
                </div>

                <p>
                  Camera is currently closed
                </p>

              </div>
            )}

          </div>

          {/* Camera Error */}
          {cameraError && (
            <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
              {cameraError}
            </div>
          )}

          {/* Camera Button */}
          {!verifying && (
            <div className="mt-5">

              <Button
                variant="secondary"
                onClick={handleCameraToggle}
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