import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

import api from "../services/api";

function DocumentVerification({
  verificationData,
  verificationId,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationResult, setVerificationResult] =
    useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setError("");
    setVerificationResult(null);
  };

  const handleVerifyDocument = async () => {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    // Prefer prop, fallback to localStorage
    const activeVerificationId =
      verificationId ||
      localStorage.getItem("verificationId");

    if (!activeVerificationId) {
      setError(
        "Verification session not found. Please start verification again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
        Current backend API expects JSON.

        The selected file is currently only used
        as a UI selection because the backend
        endpoint does not yet support multipart
        file uploads.
      */

      const response = await api.post(
        `/verification/${activeVerificationId}/document`,
        {
          document_match: true,
        }
      );

      console.log(
        "Document verification result:",
        response.data
      );

      setVerificationResult(response.data);

    } catch (error) {
      console.error(
        "Document verification error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Document verification failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="mb-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Step 2
        </p>

        <h3 className="mt-1 text-lg font-bold text-[#111827]">
          Document Verification
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Upload and verify the customer's identity document.
        </p>

      </div>


      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">

          <AlertCircle size={18} />

          {error}

        </div>
      )}


      {/* Success */}
      {verificationResult && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">

          <CheckCircle2 size={18} />

          Document verification completed successfully.

        </div>
      )}


      {/* Upload Area */}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] p-8 transition hover:border-[#2563EB] hover:bg-blue-50">

        <Upload
          size={32}
          className="mb-3 text-[#2563EB]"
        />

        <p className="font-semibold text-[#334155]">
          Choose identity document
        </p>

        <p className="mt-1 text-xs text-[#64748B]">
          Aadhaar, PAN, Passport or Driving Licence
        </p>

        <p className="mt-1 text-xs text-[#94A3B8]">
          JPG, JPEG, PNG or PDF
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
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">

          <p className="text-sm font-semibold text-[#334155]">
            Selected Document
          </p>

          <p className="mt-1 text-sm text-[#64748B]">
            {selectedFile.name}
          </p>

          <p className="mt-1 text-xs text-[#94A3B8]">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>

        </div>
      )}


      {/* Backend Status */}
      {verificationData && (
        <div className="mt-4 rounded-lg bg-[#F8FAFC] p-3 text-xs text-[#64748B]">

          Verification session active

          {verificationId && (
            <span className="ml-2 font-mono text-[#334155]">
              #{verificationId.slice(0, 8)}
            </span>
          )}

        </div>
      )}


      {/* Verify Button */}
      <div className="mt-5 flex justify-end">

        <button
          type="button"
          onClick={handleVerifyDocument}
          disabled={
            loading ||
            !selectedFile ||
            verificationResult
          }
          className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Verifying..."
            : verificationResult
              ? "Document Verified"
              : "Verify Document"}
        </button>

      </div>

    </div>
  );
}

export default DocumentVerification;