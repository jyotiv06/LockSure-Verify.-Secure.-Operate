import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000";

function VerificationResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const finalize = async () => {
      const verificationId =
        localStorage.getItem("verification_id");

      if (!verificationId) {
        setError("Verification session not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/verification/${verificationId}/finalize`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message);
        }

        const data = await response.json();

        setResult(data);

      } catch (err) {
        console.error(err);

        setError(
          "Unable to finalize verification. Please make sure document and face verification are complete."
        );

      } finally {
        setLoading(false);
      }
    };

    finalize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700"></div>

            <p className="mt-4 text-slate-600">
              Finalizing verification...
            </p>

          </div>

        </main>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-12">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <h2 className="text-2xl font-bold text-red-800">
              Verification Error
            </h2>

            <p className="mt-3 text-red-700">
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
            >
              Back to Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  const approved =
    result?.state === "APPROVED";

  const riskScore =
    Number(result?.risk_score ?? 0);

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Progress */}
        <div className="mb-8">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Step 4 of 4
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Final Verification
              </h1>

            </div>

            <div className="hidden text-right sm:block">

              <p className="text-sm text-slate-500">
                Verification progress
              </p>

              <p className="font-bold text-green-600">
                100%
              </p>

            </div>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full rounded-full bg-green-500"></div>
          </div>

        </div>

        {/* Result Banner */}
        <div
          className={`mb-6 overflow-hidden rounded-3xl p-8 text-white shadow-lg ${
            approved
              ? "bg-gradient-to-r from-green-600 to-emerald-500"
              : "bg-gradient-to-r from-red-600 to-red-500"
          }`}
        >

          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">

            <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-5xl sm:mb-0 sm:mr-6">
              {approved ? "✓" : "!"}
            </div>

            <div>

              <p className="text-sm font-semibold uppercase tracking-widest">
                Verification Complete
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {approved
                  ? "Operation Approved"
                  : result?.state || "Verification Review"}
              </h2>

              <p className="mt-2">
                {result?.reason}
              </p>

            </div>

          </div>

        </div>

        {/* Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-7">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Verification Summary
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Identity & Account Checks
            </h2>

          </div>

          <div className="space-y-4">

            {/* Document */}
            <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                  {result?.document_match ? "✓" : "!"}
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Document Verification
                  </p>

                  <p className="text-sm text-slate-500">
                    Identity document successfully verified
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                {result?.document_match
                  ? "VERIFIED"
                  : "FAILED"}
              </span>

            </div>

            {/* Face */}
            <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                  {result?.face_match ? "✓" : "!"}
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Face Verification
                  </p>

                  <p className="text-sm text-slate-500">
                    Identity successfully matched
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                {result?.face_match
                  ? "VERIFIED"
                  : "FAILED"}
              </span>

            </div>

          </div>

          {/* Risk */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Risk Assessment
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <span className="h-4 w-4 rounded-full bg-green-500"></span>

                  <span className="text-2xl font-bold text-green-700">
                    {result?.risk_level || "UNKNOWN"} RISK
                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {result?.reason}
                </p>

              </div>

              <div className="text-left sm:text-right">

                <p className="text-sm text-slate-500">
                  Risk Score
                </p>

                <p className="text-4xl font-bold text-slate-900">
                  {riskScore}
                  <span className="text-xl text-slate-400">
                    /100
                  </span>
                </p>

              </div>

            </div>

            <div className="mt-6">

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      riskScore,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>

            </div>

          </div>

          {/* Final Status */}
          <div
            className={`mt-8 rounded-2xl border-2 p-7 text-center ${
              approved
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >

            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white shadow-lg ${
                approved
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {approved ? "✓" : "!"}
            </div>

            <p
              className={`mt-4 text-sm font-semibold uppercase tracking-widest ${
                approved
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              Final Status
            </p>

            <h2
              className={`mt-1 text-3xl font-extrabold ${
                approved
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {approved
                ? "OPERATION APPROVED"
                : result?.state}
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              {result?.reason}
            </p>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-center">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/locker-status")
              }
              disabled={!approved}
              className="rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white disabled:bg-slate-300"
            >
              View Locker Status →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default VerificationResult;