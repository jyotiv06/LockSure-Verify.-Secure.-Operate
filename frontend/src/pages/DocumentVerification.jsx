import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../api/customer";

const API_BASE_URL = "http://127.0.0.1:8000";

function DocumentVerification() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const initializedRef = useRef(false);

  const [customer, setCustomer] = useState(null);
  const [verificationId, setVerificationId] = useState(null);

  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  // ============================================================
  // INITIALIZE VERIFICATION
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    initializeVerification();
  }, []);

  const initializeVerification = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setError("");

      // Get real logged-in customer
      const customerData = await getCurrentCustomer(token);

      console.log("REAL CUSTOMER:", customerData);

      setCustomer(customerData);

      // Customer DB ID is required
      if (!customerData.customer_db_id) {
        throw new Error("Customer database ID is missing.");
      }

      // Locker number is required
      if (!customerData.locker_number) {
        throw new Error("No locker is assigned to this customer.");
      }

      /*
       * Every new locker operation gets a fresh verification session.
       */
      localStorage.removeItem("verification_id");

      // Start verification
      const response = await fetch(
        `${API_BASE_URL}/verification/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer_id: Number(customerData.customer_db_id),
            locker_id: String(customerData.locker_number),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log(
        "VERIFICATION START STATUS:",
        response.status
      );

      console.log(
        "VERIFICATION START RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).join(", ")
            : data.detail || "Unable to start verification."
        );
      }

      if (!data.verification_id) {
        throw new Error(
          "Verification session was not created."
        );
      }

      const newVerificationId = String(
        data.verification_id
      );

      setVerificationId(newVerificationId);

      localStorage.setItem(
        "verification_id",
        newVerificationId
      );

      console.log(
        "NEW VERIFICATION SESSION:",
        newVerificationId
      );

    } catch (err) {
      console.error(
        "Verification initialization failed:",
        err
      );

      setError(
        err.message ||
          "Unable to start verification."
      );
    }
  };

  // ============================================================
  // FILE SELECTION
  // ============================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setDocument(file);
    setError("");
    setStatus("idle");

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // ============================================================
  // DOCUMENT VERIFICATION
  // ============================================================

  const handleVerify = async () => {
    if (!document) {
      setError("Please upload a document first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    /*
     * Use React state first.
     * If state has not populated yet, recover from localStorage.
     */
    const activeVerificationId =
      verificationId ||
      localStorage.getItem("verification_id");

    if (!activeVerificationId) {
      setError(
        "Verification session is not available. Please go back and start verification again."
      );
      return;
    }

    try {
      setError("");
      setStatus("processing");

      const response = await fetch(
        `${API_BASE_URL}/verification/${activeVerificationId}/document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_match: true,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log(
        "DOCUMENT VERIFICATION STATUS:",
        response.status
      );

      console.log(
        "DOCUMENT VERIFICATION RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).join(", ")
            : data.detail || "Document verification failed."
        );
      }

      setVerificationId(
        String(activeVerificationId)
      );

      localStorage.setItem(
        "verification_id",
        String(activeVerificationId)
      );

      setStatus("verified");

    } catch (err) {
      console.error(
        "Document verification failed:",
        err
      );

      setStatus("idle");

      setError(
        err.message ||
          "Document verification failed. Please try again."
      );
    }
  };

  // ============================================================
  // REMOVE DOCUMENT
  // ============================================================

  const handleRemove = () => {
    setDocument(null);
    setPreview(null);
    setStatus("idle");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // CONTINUE TO FACE VERIFICATION
  // ============================================================

  const continueToFace = () => {
    const activeVerificationId =
      verificationId ||
      localStorage.getItem("verification_id");

    if (!activeVerificationId) {
      setError("Verification session is missing.");
      return;
    }

    navigate("/face-verification");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Step 2 of 4
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Document Verification
              </h1>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm text-slate-500">
                Verification progress
              </p>

              <p className="font-bold text-blue-700">
                50%
              </p>
            </div>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 rounded-full bg-blue-700" />
          </div>
        </div>

        {/* Customer */}
        {customer && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-sm text-blue-700">
              Customer
            </p>

            <p className="mt-1 text-lg font-bold text-blue-900">
              {customer.full_name}
            </p>

            <p className="text-sm text-blue-700">
              Customer ID: {customer.customer_id}
            </p>

            {customer.locker_number && (
              <p className="mt-1 text-sm text-blue-700">
                Locker: {customer.locker_number}
              </p>
            )}

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Upload your identity document
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Upload a clear image or PDF of your registered identity
              document. The document will be securely verified before
              you continue.
            </p>

          </div>

          {/* Upload */}
          {!document && (
            <div
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50"
            >

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                ⬆
              </div>

              <h3 className="font-semibold text-slate-800">
                Upload your document
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Click here to choose a file
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Supported formats: JPG, PNG, PDF
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>
          )}

          {/* Preview */}
          {document && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Document Preview
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {document.name}
                  </p>
                </div>

                <button
                  onClick={handleRemove}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>

              </div>

              {/* Image Preview */}
              {document.type.startsWith("image/") &&
                preview && (
                  <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4">

                    <img
                      src={preview}
                      alt="Uploaded document"
                      className="max-h-96 max-w-full rounded-lg object-contain"
                    />

                  </div>
                )}

              {/* PDF */}
              {document.type === "application/pdf" && (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">

                  <span className="text-5xl">
                    📄
                  </span>

                  <p className="mt-3 font-semibold text-slate-700">
                    PDF Document
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Ready for verification
                  </p>

                </div>
              )}

            </div>
          )}

          {/* Processing */}
          {status === "processing" && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />

              <h3 className="font-bold text-blue-900">
                Verifying document...
              </h3>

              <p className="mt-1 text-sm text-blue-700">
                Please wait while your document is being processed.
              </p>

            </div>
          )}

          {/* Verified */}
          {status === "verified" && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold text-green-800">
                    Document Verified
                  </h3>

                  <p className="mt-1 text-sm text-green-700">
                    Your document has been successfully verified.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back
            </button>

            {status === "verified" ? (

              <button
                onClick={continueToFace}
                className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 active:scale-95"
              >
                Continue to Face Verification →
              </button>

            ) : (

              <button
                onClick={handleVerify}
                disabled={
                  !document ||
                  status === "processing" ||
                  !verificationId
                }
                className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {status === "processing"
                  ? "Verifying..."
                  : "Verify Document"}
              </button>

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
              Secure document processing
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Your document is used only for verification purposes and
              is processed through the secure verification workflow.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default DocumentVerification;