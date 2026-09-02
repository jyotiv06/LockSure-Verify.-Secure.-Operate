import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../api/customer";

const API_BASE = "http://127.0.0.1:8000";

function DocumentVerification() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeVerification = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // If a session already exists, reuse it
        const existingId = localStorage.getItem("verification_id");

        if (existingId) {
          console.log(
            "Using existing verification session:",
            existingId
          );
          return;
        }

        const customer = await getCurrentCustomer(token);

        console.log("REAL CUSTOMER:", customer);

        const customerId = customer.customer_id;

        /*
        * Current DB:
        * locker_id = 252
        * locker_number = L001
        *
        * IMPORTANT:
        * Backend verification API expects locker_id (integer),
        * NOT locker_number.
        */
        const lockerId = 252;

        const response = await fetch(
          `${API_BASE}/verification/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer_id: 1,
              locker_id: "L001",
              account_status: customer.account_status || "ACTIVE",
              failed_attempts: 0,
              access_attempts_last_hour: 0,
              customer_data: {
                  name: customer.full_name,
                  email: customer.email,
                  customer_code: customer.customer_id,
              },
            }),
          }
        );

        const data = await response.json();

        console.log("VERIFICATION STATUS:", response.status);
        console.log("VERIFICATION START RESPONSE:", JSON.stringify(data, null, 2));

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to start verification"
          );
        }

        localStorage.setItem(
          "verification_id",
          String(data.verification_id)
        );

        console.log(
          "Verification session created:",
          data.verification_id
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

    initializeVerification();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setDocument(file);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
    setError("");
  };

  const handleVerify = async () => {
    if (!document) return;

    const verificationId =
      localStorage.getItem("verification_id");

    if (!verificationId) {
      setError("Verification session not found.");
      return;
    }

    setStatus("processing");
    setError("");

    try {
      /*
       * Demo/OA integration mode:
       * The uploaded document is treated as successfully
       * verified and the result is persisted in PostgreSQL.
       *
       * Real OCR can later replace document_match=true
       * with image_path/customer_data.
       */

      const response = await fetch(
        `${API_BASE}/verification/${verificationId}/document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_match: true,
            customer_data: {},
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }

      setStatus("verified");

    } catch (err) {
      console.error(err);
      setStatus("idle");
      setError(
        "Document verification failed. Please try again."
      );
    }
  };

  const handleRemove = () => {
    setDocument(null);
    setPreview(null);
    setStatus("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const continueToFace = () => {
    navigate("/face-verification");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

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
            <div className="h-full w-1/2 rounded-full bg-blue-700"></div>
          </div>

        </div>

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
              document.
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!document && (
            <div
              onClick={() => fileInputRef.current?.click()}
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
                  className="text-sm font-semibold text-red-600"
                >
                  Remove
                </button>

              </div>

              {document.type.startsWith("image/") && preview && (
                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                  <img
                    src={preview}
                    alt="Uploaded document"
                    className="max-h-96 max-w-full rounded-lg object-contain"
                  />
                </div>
              )}

              {document.type === "application/pdf" && (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <span className="text-5xl">📄</span>

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

          {status === "processing" && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700"></div>

              <h3 className="font-bold text-blue-900">
                Verifying document...
              </h3>

            </div>
          )}

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

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

            <button
              onClick={() => navigate("/profile")}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
            >
              ← Back
            </button>

            {status === "verified" ? (
              <button
                onClick={continueToFace}
                className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
              >
                Continue to Face Verification →
              </button>
            ) : (
              <button
                onClick={handleVerify}
                disabled={!document || status === "processing"}
                className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:bg-slate-300"
              >
                {status === "processing"
                  ? "Verifying..."
                  : "Verify Document"}
              </button>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

export default DocumentVerification;