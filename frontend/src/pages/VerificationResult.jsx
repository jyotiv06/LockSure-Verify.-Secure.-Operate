import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function VerificationResult() {
  const navigate = useNavigate();

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

        {/* Approval Banner */}
        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-8 text-white shadow-lg">

          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">

            <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-5xl sm:mb-0 sm:mr-6">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-100">
                Verification Complete
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Operation Approved
              </h2>

              <p className="mt-2 text-green-100">
                All required verification checks have been successfully
                completed.
              </p>
            </div>

          </div>

        </div>

        {/* Verification Summary */}
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
                  ✓
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
                VERIFIED
              </span>

            </div>

            {/* Face */}
            <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                  ✓
                </div>

                <div>
                  <p className="font-bold text-slate-800">
                    Face Verification
                  </p>

                  <p className="text-sm text-slate-500">
                    Face match score: 97.8%
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                VERIFIED
              </span>

            </div>

            {/* Account */}
            <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                  ✓
                </div>

                <div>
                  <p className="font-bold text-slate-800">
                    Account Status
                  </p>

                  <p className="text-sm text-slate-500">
                    Customer account is active
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                ACTIVE
              </span>

            </div>

          </div>

          {/* Risk Section */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Risk Assessment
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <span className="h-4 w-4 rounded-full bg-green-500 shadow-sm"></span>

                  <span className="text-2xl font-bold text-green-700">
                    LOW RISK
                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Verification checks indicate a low-risk locker operation.
                </p>

              </div>

              <div className="text-left sm:text-right">

                <p className="text-sm text-slate-500">
                  Risk Score
                </p>

                <p className="text-4xl font-bold text-slate-900">
                  12<span className="text-xl text-slate-400">/100</span>
                </p>

              </div>

            </div>

            {/* Risk Bar */}
            <div className="mt-6">

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: "12%" }}
                ></div>

              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>

            </div>

          </div>

          {/* Final Status */}
          <div className="mt-8 rounded-2xl border-2 border-green-200 bg-green-50 p-7 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl text-white shadow-lg">
              ✓
            </div>

            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-green-700">
              Final Status
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-green-800">
              OPERATION APPROVED
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-green-700">
              Your identity has been verified and you are eligible to proceed
              with the locker operation.
            </p>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-center">

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={() => navigate("/locker-status")}
              className="rounded-xl bg-blue-700 px-7 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 active:scale-95"
            >
              View Locker Status →
            </button>

          </div>

        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            🔒
          </div>

          <div>
            <h3 className="font-semibold text-blue-900">
              Verification completed securely
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              The displayed results are currently using demonstration data.
              They will be connected to the real verification and risk APIs
              when backend integration is completed.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default VerificationResult;