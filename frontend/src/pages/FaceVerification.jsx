import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000";

function FaceVerification() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraStartedRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [status, setStatus] = useState("idle");
  const [faceScore, setFaceScore] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [error, setError] = useState("");

  const startCamera = async () => {
    if (cameraStartedRef.current && streamRef.current) {
      return;
    }

    setCameraError("");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;
      cameraStartedRef.current = true;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);

    } catch (err) {
      console.error(err);

      setCameraError(
        "Camera access was denied or is unavailable."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    cameraStartedRef.current = false;
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      cameraStartedRef.current = false;
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraActive || !videoRef.current) {
      return;
    }

    const verificationId =
      localStorage.getItem("verification_id");

    const token = localStorage.getItem("token");

    if (!verificationId) {
      setError("Verification session not found.");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setCaptured(true);
    setStatus("processing");
    setError("");
    setFaceScore(null);

    const video = videoRef.current;

    /*
     * Capture the actual camera frame.
     * The image is sent to the backend as multipart/form-data.
     * We never send face_match=true from the browser.
     */
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");

    if (!context) {
      setStatus("idle");
      setCaptured(false);
      setError("Unable to capture the camera image.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    stopCamera();

    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) {
              resolve(value);
            } else {
              reject(
                new Error(
                  "Unable to create image from camera."
                )
              );
            }
          },
          "image/jpeg",
          0.92
        );
      });

      const formData = new FormData();
      formData.append(
        "file",
        blob,
        `live_face_${Date.now()}.jpg`
      );

      const response = await fetch(
        `${API_BASE}/verification/${verificationId}/face/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log("FACE VERIFICATION STATUS:", response.status);
      console.log("FACE VERIFICATION RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail
                .map((item) => item.msg)
                .join(", ")
            : data.detail ||
                "Face verification failed."
        );
      }

      const verified =
        data.face_match === true ||
        data.state === "FACE_VERIFIED";

      if (!verified) {
        throw new Error(
          "Your face could not be verified against the registered identity."
        );
      }

      const score =
        typeof data.face_score === "number"
          ? data.face_score
          : null;

      setFaceScore(score);
      setStatus("verified");
    } catch (err) {
      console.error("Face verification failed:", err);

      setStatus("idle");
      setCaptured(false);

      setError(
        err.message ||
          "Face verification failed. Please try again."
      );
    }
  };

  const handleRetry = () => {
    setCaptured(false);
    setStatus("idle");
    setFaceScore(null);
    setError("");
    startCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              👤
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Verify your identity
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Position your face inside the frame and capture a clear image.
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!captured && (
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-slate-950">

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

              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                  <div className="h-64 w-48 rounded-[50%] border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] sm:h-72 sm:w-56"></div>

                </div>
              )}

            </div>
          )}

          {cameraError && (
            <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {cameraError}
            </div>
          )}

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
                    {faceScore !== null
                      ? `${faceScore.toFixed(1)}%`
                      : "Verified"}
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

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

            <button
              onClick={() =>
                navigate("/document-verification")
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
            >
              ← Back
            </button>

            {!captured && (
              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                className="rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white disabled:bg-slate-300"
              >
                Capture & Verify
              </button>
            )}

            {status === "verified" && (
              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={handleRetry}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
                >
                  Retake
                </button>

                <button
                  onClick={() =>
                    navigate("/verification-result")
                  }
                  className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
                >
                  Continue to Final Verification →
                </button>

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default FaceVerification;