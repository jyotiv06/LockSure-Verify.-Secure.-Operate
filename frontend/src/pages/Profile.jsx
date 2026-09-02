import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { getCurrentCustomer } from "../api/customer";

function Profile() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setError("");

        const data = await getCurrentCustomer(token);

        console.log("PROFILE CUSTOMER:", data);

        setCustomer(data);
      } catch (err) {
        console.error("Failed to load customer profile:", err);

        setError(
          err.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">
              Loading your profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="text-lg font-bold text-red-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "Customer profile not found."}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const accountActive =
    String(customer.account_status || "").toUpperCase() === "ACTIVE";

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

          {/* Customer Header */}
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {customer.full_name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Customer ID: {customer.customer_id}
              </p>
            </div>

            <div className="sm:ml-auto">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  accountActive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    accountActive
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>

                {accountActive
                  ? "Account Active"
                  : "Account Inactive"}
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
                  {customer.full_name || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Customer ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.customer_id || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Number
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.account_number || "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-2 font-semibold text-slate-800 break-all">
                  {customer.email || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.phone || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Status
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.account_status || "—"}
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
                  {customer.locker_number || "Not assigned"}
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Locker Status
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-900">
                  {customer.locker_status || "NOT ASSIGNED"}
                </p>
              </div>

            </div>

            {customer.branch && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Branch
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {customer.branch}
                </p>
              </div>
            )}

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

                  <p className="mt-2 text-xs font-medium text-blue-600">
                    Current verification status:{" "}
                    {customer.verification_status || "NOT_STARTED"}
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
              disabled={!customer.locker_number}
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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