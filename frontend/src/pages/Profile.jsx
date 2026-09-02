import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { customer } from "../data/mockData";

function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Customer Profile
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Verify your information
          </h1>

          <p className="mt-2 text-slate-500">
            Review your registered details before starting the locker
            verification process.
          </p>
        </div>

        {/* Profile Card */}
        <Card>

          <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {customer.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customer ID: {customer.customerId}
              </p>
            </div>

            <div className="sm:ml-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Account Active
              </span>
            </div>

          </div>

          {/* Personal Information */}
          <div className="py-6">

            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Personal Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Full Name
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.customerId}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Number
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.accountNumber}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Branch
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.branch}
                </p>
              </div>

            </div>

          </div>

          {/* Locker Information */}
          <div className="border-t border-slate-100 py-6">

            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Locker Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  Locker Number
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {customer.lockerNumber}
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Locker Status
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-900">
                  OCCUPIED
                </p>
              </div>

            </div>

          </div>

          {/* Verification Information */}
          <div className="border-t border-slate-100 py-6">

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  🔐
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900">
                    Identity verification required
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-blue-700">
                    To securely operate your locker, you need to complete
                    document and face verification.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => navigate("/document-verification")}
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 active:scale-95"
            >
              Continue to Document Verification →
            </button>

          </div>

        </Card>

        {/* Security Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          🔒 Your personal information is handled securely by LockSure.
        </div>

      </main>
    </div>
  );
}

export default Profile;