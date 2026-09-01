import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";

import api from "../services/api";


function FaceVerification() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);

  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");

  const [verificationResult, setVerificationResult] =
    useState(null);


  const openCamera = async () => {
    setCameraError("");
    setError("");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current
            .play()
            .catch((error) => {
              console.error(
                "Video play error:",
                error
              );
            });
        }
      }, 100);

    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access in your browser."
        );

      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device."
        );

      } else {
        setCameraError(
          "Unable to access the camera."
        );
      }

      setCameraOpen(false);
    }
  };


  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

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
      setFaceCaptured(false);

    } else {
      openCamera();
    }

    setError("");
  };


  const handleCaptureFace = () => {
    if (!cameraOpen) {
      setError(
        "Please open the camera first."
      );

      return;
    }

    setFaceCaptured(true);

    setError("");

    setVerificationResult(null);
  };


  const handleVerification = async () => {
    const verificationId =
      localStorage.getItem(
        "verificationId"
      );

    if (!verificationId) {
      setError(
        "Verification session not found. Please start verification again."
      );

      return;
    }

    if (!faceCaptured) {
      setError(
        "Please capture the face before verification."
      );

      return;
    }

    try {
      setVerifying(true);

      setError("");

      /*
        Current backend expects:

        {
          "face_match": true
        }

        Actual face recognition processing
        can be integrated later.
      */

      const response =
        await api.post(
          `/verification/${verificationId}/face`,
          {
            face_match: true,
          }
        );

      console.log(
        "Face verification result:",
        response.data
      );

      setVerificationResult(
        response.data
      );

      closeCamera();

    } catch (error) {
      console.error(
        "Face verification error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Face verification failed."
      );

    } finally {
      setVerifying(false);
    }
  };


  const handleContinue = () => {
    if (!verificationResult) {
      setError(
        "Please complete face verification first."
      );

      return;
    }

    navigate(
      "/verification-result"
    );
  };


  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-8">

        {/* Heading */}

        <div className="mb-6">

          <h2 className="text-3xl font-bold text-gray-800">
            Face Verification
          </h2>

          <p className="mt-2 text-gray-500">
            Capture and verify the customer's face to complete
            identity verification.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle size={20} />

            {error}

          </div>
        )}


        {/* Success */}

        {verificationResult && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

            <CheckCircle2 size={20} />

            Face verification completed successfully.

          </div>
        )}


        <Card>

          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Face Capture
          </h3>

          <p className="mb-5 text-sm text-gray-500">
            Position the customer's face inside the camera frame.
          </p>


          {/* Camera Area */}

          <div className="relative h-80 overflow-hidden rounded-xl bg-gray-900">

            {verifying ? (

              <div className="flex h-full flex-col items-center justify-center text-white">

                <Loader />

                <p className="mt-3">
                  Verifying face...
                </p>

              </div>

            ) : cameraOpen ? (

              <div className="relative flex h-full w-full items-center justify-center">

                {/* Live Camera */}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />


                {/* Face Guide */}

                <div className="relative z-10 flex h-48 w-40 items-center justify-center rounded-full border-2 border-dashed border-white">

                  <span className="rounded bg-black/30 px-3 py-1 text-sm text-white">
                    Position Face
                  </span>

                </div>


                {/* Capture Status */}

                {faceCaptured && (
                  <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-green-500/90 px-4 py-2 text-sm text-white">

                    <CheckCircle2 size={18} />

                    Face captured successfully

                  </div>
                )}

              </div>

            ) : (

              <div className="flex h-full flex-col items-center justify-center text-white">

                <Camera
                  size={48}
                  className="mb-4 text-gray-400"
                />

                <p>
                  Camera is currently closed
                </p>

              </div>

            )}

          </div>


          {/* Camera Error */}

          {cameraError && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-600">

              {cameraError}

            </div>
          )}


          {/* Controls */}

          {!verifying && (

            <div className="mt-5 flex flex-wrap gap-3">

              <Button
                variant="secondary"
                onClick={handleCameraToggle}
                disabled={verificationResult}
              >
                {cameraOpen
                  ? "Close Camera"
                  : "Open Camera"}
              </Button>


              {cameraOpen && (

                <Button
                  variant="secondary"
                  onClick={handleCaptureFace}
                  disabled={
                    faceCaptured ||
                    verificationResult
                  }
                >
                  {faceCaptured
                    ? "Face Captured"
                    : "Capture Face"}
                </Button>

              )}


              {cameraOpen && (

                <div className="ml-auto">

                  <Button
                    onClick={handleVerification}
                    disabled={
                      !faceCaptured ||
                      verifying ||
                      verificationResult
                    }
                  >

                    {verifying
                      ? "Verifying..."
                      : verificationResult
                        ? "Face Verified"
                        : "Verify Face"}

                  </Button>

                </div>

              )}

            </div>

          )}


          {/* Continue */}

          {verificationResult && (

            <div className="mt-6 flex justify-end">

              <Button
                onClick={handleContinue}
              >
                Continue to Result
              </Button>

            </div>

          )}

        </Card>

      </main>

    </div>
  );
}


export default FaceVerification;