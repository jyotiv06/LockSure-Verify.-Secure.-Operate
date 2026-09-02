import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

function FaceVerification() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [status, setStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");

  // Start camera
  const startCamera = async () => {
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (error) {
      console.error(error);

      setCameraError(
        "Camera access was denied or is unavailable. Please allow camera permission and try again."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
  };

  // Start camera when page loads
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture face
  const handleCapture = () => {
    if (!cameraActive) return;

    setCaptured(true);
    setStatus("processing");

    stopCamera();

    // Temporary mock face verification
    setTimeout(() => {
      setStatus("verified");
    }, 2500);
  };

  // Retry
  const handleRetry = () => {
    setCaptured(false);
    setStatus("idle");
    startCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Progress */}
        <div className="mb-8">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Step 3 of 4
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Face Verification
              </h1>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm text-slate-500">
                Verification progress
              </p>

              <p className="font-bold text-blue-700">
                75%
              </p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-3/4 rounded-full bg-blue-700"></div>
          </div>

        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          {/* Heading */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              👤
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Verify your identity
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Position your face inside the frame and capture a clear image.
              This helps us securely verify your identity.
            </p>

          </div>

          {/* Camera Area */}
          {!captured && (
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-slate-950">

              {/* Camera */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center text-white">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
                      📷
                    </div>

                    <p className="font-semibold">
                      Camera not active
                    </p>

                    <button
                      onClick={startCamera}
                      className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-800"
                    >
                      Start Camera
                    </button>

                  </div>
                </div>
              )}

              {/* Face Guide */}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                  <div className="h-64 w-48 rounded-[50%] border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] sm:h-72 sm:w-56"></div>

                </div>
              )}

              {/* Camera label */}
              {cameraActive && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>

                  Camera active

                </div>
              )}

            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-3">

                <span className="font-bold">!</span>

                <p>{cameraError}</p>

              </div>
            </div>
          )}

          {/* Captured State */}
          {captured && (
            <div className="mx-auto max-w-2xl rounded-3xl bg-slate-950 p-12 text-center">

              {status === "processing" && (
                <>
                  <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>

                  <h3 className="text-xl font-bold text-white">
                    Verifying your face...
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    Please wait while your identity is being verified.
                  </p>
                </>
              )}

              {status === "verified" && (
                <>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl text-white">
                    ✓
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Face Verified
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    Your face successfully matched the registered identity.
                  </p>
                </>
              )}

            </div>
          )}

          {/* Face Match Result */}
          {status === "verified" && (
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>

                <div className="flex-1">

                  <p className="text-sm font-medium text-green-700">
                    Face Match
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-900">
                    97.8%
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Identity successfully verified
                  </p>

                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                  VERIFIED
                </span>

              </div>

            </div>
          )}

          {/* Instructions */}
          {!captured && !cameraError && (
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-slate-50 p-5">

              <h3 className="font-semibold text-slate-800">
                For best results
              </h3>

              <ul className="mt-3 space-y-2 text-sm text-slate-500">

                <li>✓ Make sure your face is clearly visible.</li>

                <li>✓ Keep your face inside the oval frame.</li>

                <li>✓ Ensure there is enough lighting.</li>

                <li>✓ Remove anything covering your face.</li>

              </ul>

            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

            <button
              onClick={() => navigate("/document-verification")}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back
            </button>

            {!captured && (
              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                className="rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Capture & Verify
              </button>
            )}

            {status === "verified" && (
              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={handleRetry}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Retake
                </button>

                <button
                  onClick={() => navigate("/verification-result")}
                  className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 active:scale-95"
                >
                  Continue to Final Verification →
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            🔒
          </div>

          <div>
            <h3 className="font-semibold text-blue-900">
              Secure face verification
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Your camera is used only during the identity verification
              process. Face verification is currently demonstrated using
              mock verification data.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default FaceVerification;