import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../api/customer";

const API_BASE = "http://127.0.0.1:8000";

function VerificationResult() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const getVerificationId = () => {
    return localStorage.getItem("verification_id");
  };

  useEffect(() => {
    loadVerification();
  }, []);

  const loadVerification = async () => {
    try {
      setLoading(true);
      setError("");

      const verificationId = getVerificationId();

      if (!token) {
        throw new Error("Login session not found.");
      }

      if (!verificationId) {
        throw new Error("Verification session not found.");
      }

      const customerData = await getCurrentCustomer(token);
      setCustomer(customerData);

      const response = await fetch(
        `${API_BASE}/verification/${verificationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("VERIFICATION RESULT STATUS:", response.status);
      console.log("VERIFICATION RESULT RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load verification."
        );
      }

      setVerification(data);
    } catch (err) {
      console.error("LOAD VERIFICATION ERROR:", err);
      setError(err.message || "Unable to load verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setFinalizing(true);
      setError("");

      const verificationId = getVerificationId();

      if (!token) {
        throw new Error("Login session not found.");
      }

      if (!verificationId) {
        throw new Error("Verification session not found.");
      }

      console.log(
        "FINALIZING VERIFICATION:",
        verificationId
      );

      const response = await fetch(
        `${API_BASE}/verification/${verificationId}/finalize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("FINALIZE STATUS:", response.status);
      console.log("FINALIZE RESPONSE:", data);
      console.log("FINAL STATE:", data.state);
      console.log("FINAL DECISION:", data.risk_decision);
      console.log("FINAL RISK LEVEL:", data.risk_level);

      if (!response.ok) {
        throw new Error(
          data.detail || "Final verification failed."
        );
      }

      // IMPORTANT:
      // Use the backend response directly as the new UI state.
      setVerification({
        ...data,
        state: String(data.state || "").toUpperCase(),
        risk_decision: String(
          data.risk_decision || ""
        ).toUpperCase(),
        risk_level: String(
          data.risk_level || ""
        ).toUpperCase(),
        document_match: Boolean(data.document_match),
        face_match: Boolean(data.face_match),
      });

    } catch (err) {
      console.error("FINALIZE ERROR:", err);
      setError(err.message || "Final verification failed.");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <h2 className="text-xl font-bold text-slate-900">
              Loading verification result...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const state = String(
    verification?.state || ""
  ).toUpperCase();

  const documentVerified =
    verification?.document_match === true;

  const faceVerified =
    verification?.face_match === true;

  const approved =
    state === "APPROVED";

  const blocked =
    state === "BLOCKED";

  const review =
    state === "REVIEW";

  const riskLevel =
    String(
      verification?.risk_level || ""
    ).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Step 4 of 4
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Verification Result
          </h1>

          <p className="mt-2 text-slate-500">
            Final security assessment for your locker operation.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* CUSTOMER */}
        {customer && (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-3">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {customer.full_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer ID
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {customer.customer_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Locker
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {customer.locker_number || "Not assigned"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* VERIFICATION CARDS */}
        <div className="grid gap-5 md:grid-cols-3">

          {/* DOCUMENT */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  documentVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {documentVerified ? "✓" : "!"}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  documentVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {documentVerified
                  ? "VERIFIED"
                  : "PENDING"}
              </span>

            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Document Verification
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {documentVerified
                ? "Your identity document has been successfully verified."
                : "Document verification is pending."}
            </p>

          </div>

          {/* FACE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  faceVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {faceVerified ? "✓" : "!"}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  faceVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {faceVerified
                  ? "VERIFIED"
                  : "PENDING"}
              </span>

            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Face Verification
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {faceVerified
                ? "Your face successfully matched the registered identity."
                : "Face verification is pending."}
            </p>

          </div>

          {/* RISK */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  approved
                    ? "bg-green-100 text-green-700"
                    : blocked
                    ? "bg-red-100 text-red-700"
                    : review
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {approved
                  ? "✓"
                  : blocked
                  ? "!"
                  : review
                  ? "!"
                  : "?"}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  approved
                    ? "bg-green-100 text-green-700"
                    : blocked
                    ? "bg-red-100 text-red-700"
                    : review
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {riskLevel || "PENDING"}
              </span>

            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Risk Assessment
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {verification?.risk_score !== undefined
                ? `Risk score: ${verification.risk_score}`
                : "Final security assessment of your locker operation."}
            </p>

          </div>

        </div>

        {/* FINAL STATUS */}
        <div
          className={`mt-6 rounded-3xl border p-8 ${
            approved
              ? "border-green-200 bg-green-50"
              : blocked
              ? "border-red-200 bg-red-50"
              : review
              ? "border-yellow-200 bg-yellow-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >

          <div className="text-center">

            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                approved
                  ? "bg-green-100 text-green-700"
                  : blocked
                  ? "bg-red-100 text-red-700"
                  : review
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {approved
                ? "✓"
                : blocked
                ? "!"
                : review
                ? "!"
                : "?"}
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">

              {approved
                ? "Verification Successful"
                : blocked
                ? "Locker Operation Blocked"
                : review
                ? "Manual Review Required"
                : "Verification Ready"}

            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">

              {approved
                ? "Your identity has been successfully verified. The locker operation is approved."
                : blocked
                ? "The verification system detected a security concern. The locker operation cannot proceed."
                : review
                ? "Your verification requires officer review before the locker operation can proceed."
                : "All verification information has been collected. Complete the final verification to continue."}

            </p>

            {/* DEBUG INFORMATION - useful during integration */}
            <div className="mt-5 text-xs text-slate-400">
              Verification ID: {verification?.verification_id || "—"}
              {" · "}
              State: {state || "—"}
            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>

          {/* ONLY SHOW FINALIZE BEFORE APPROVAL */}
          {!approved &&
            !blocked &&
            !review &&
            state !== "RISK_ASSESSMENT" && (
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {finalizing
                  ? "Processing..."
                  : "Complete Final Verification →"}
              </button>
            )}

          {/* APPROVED */}
          {approved && (
            <button
              onClick={() => navigate("/locker-status")}
              className="rounded-xl bg-green-700 px-7 py-3 font-semibold text-white shadow-sm hover:bg-green-800"
            >
              Continue to Locker →
            </button>
          )}

          {/* REVIEW */}
          {review && (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-yellow-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-yellow-700"
            >
              Return to Dashboard
            </button>
          )}

          {/* BLOCKED */}
          {blocked && (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-red-600 px-7 py-3 font-semibold text-white shadow-sm hover:bg-red-700"
            >
              Return to Dashboard
            </button>
          )}

        </div>

      </main>
    </div>
  );
}

export default VerificationResult;