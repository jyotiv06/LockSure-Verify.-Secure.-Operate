import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Navbar from "../components/Navbar";

function DocumentVerification() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setDocument(file);
    setPreview(URL.createObjectURL(file));
    setStatus("idle");
  };

  const handleVerify = () => {
    if (!document) return;

    setStatus("processing");

    // Temporary mock verification
    setTimeout(() => {
      setStatus("verified");
    }, 2000);
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
            <div className="h-full w-1/2 rounded-full bg-blue-700"></div>
          </div>

        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          {/* Heading */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Upload your identity document
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Upload a clear image or PDF of your registered identity
              document. The document will be securely verified before you
              continue.
            </p>

          </div>

          {/* Upload Area */}
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
              {document.type.startsWith("image/") && preview && (
                <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                  <img
                    src={preview}
                    alt="Uploaded document"
                    className="max-h-96 max-w-full rounded-lg object-contain"
                  />
                </div>
              )}

              {/* PDF Preview */}
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

          {/* Processing */}
          {status === "processing" && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700"></div>

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
              onClick={() => navigate("/profile")}
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
                disabled={!document || status === "processing"}
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
              Your document is used only for verification purposes and is
              processed through the secure verification workflow.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default DocumentVerification;