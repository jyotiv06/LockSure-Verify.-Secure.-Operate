import { useState } from "react";
import OfficerLayout from "../../components/officer/OfficerLayout";

function LockerOperation() {
  const [isOpen, setIsOpen] = useState(false);

  const verificationComplete = true;
  const authorizationApproved = true;

  const canOperate =
    verificationComplete && authorizationApproved;

  const handleLocker = () => {
    if (!canOperate) return;

    setIsOpen((previous) => !previous);
  };

  return (
    <OfficerLayout>

      {/* PAGE HEADER */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Locker Control
        </p>

        <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
          Locker Operation
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Control authorized locker access after successful verification.
        </p>
      </div>


      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">


        {/* LEFT - LOCKER */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

          {/* Locker Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Locker
              </p>

              <h2 className="mt-1 font-mono text-xl font-bold text-[#111827]">
                L-102
              </h2>
            </div>

            <span
              className={`rounded-full px-3 py-2 text-xs font-bold ${
                isOpen
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isOpen ? "OPEN" : "LOCKED"}
            </span>

          </div>


          {/* Locker Visual */}
          <div className="flex min-h-[350px] items-center justify-center">

            <div
              className={`relative flex h-60 w-48 items-center justify-center rounded-2xl border-4 transition-all duration-500 ${
                isOpen
                  ? "border-amber-300 bg-amber-50"
                  : "border-[#1E293B] bg-[#0B1220]"
              }`}
            >

              {/* Locker light */}
              <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-[#10B981]" />

              <div className="text-center">

                <div className="text-5xl">
                  {isOpen ? "🔓" : "🔒"}
                </div>

                <p
                  className={`mt-5 text-sm font-bold uppercase tracking-[0.2em] ${
                    isOpen
                      ? "text-amber-700"
                      : "text-white"
                  }`}
                >
                  {isOpen ? "OPEN" : "LOCKED"}
                </p>

                <p
                  className={`mt-2 font-mono text-xs ${
                    isOpen
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  L-102
                </p>

              </div>

            </div>

          </div>


          {/* Locker Button */}
          <div className="border-t border-[#E2E8F0] pt-5">

            <button
              type="button"
              disabled={!canOperate}
              onClick={handleLocker}
              className={`w-full rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                !canOperate
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : isOpen
                  ? "bg-[#F59E0B] text-white hover:bg-[#D97706]"
                  : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              }`}
            >
              {isOpen ? "CLOSE LOCKER" : "OPEN LOCKER"}
            </button>

          </div>

        </div>


        {/* RIGHT - AUTHORIZATION */}
        <div className="space-y-6">


          {/* Authorization Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <h2 className="text-base font-bold text-[#111827]">
              Operation Authorization
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Required checks before locker access.
            </p>


            <div className="mt-6 space-y-3">

              <CheckRow
                label="Verification"
                value="Complete"
              />

              <CheckRow
                label="Authorization"
                value="Approved"
              />

              <CheckRow
                label="Locker Controller"
                value="Online"
              />

            </div>

          </div>


          {/* Customer Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <h2 className="text-base font-bold text-[#111827]">
              Customer
            </h2>

            <div className="mt-5 space-y-4">

              <InfoRow
                label="Customer"
                value="Rahul Sharma"
              />

              <InfoRow
                label="Customer ID"
                value="CUST102"
              />

              <InfoRow
                label="Locker"
                value="L-102"
              />

              <InfoRow
                label="Operation"
                value="Open Locker"
              />

            </div>

          </div>


          {/* Security Notice */}
          <div className="rounded-2xl border border-[#BAE6FD] bg-[#F0F9FF] p-5">

            <div className="flex gap-3">

              <div className="text-lg">
                🛡️
              </div>

              <div>

                <p className="text-sm font-bold text-[#0C4A6E]">
                  Controlled Access
                </p>

                <p className="mt-1 text-xs leading-5 text-[#0369A1]">
                  Locker access is permitted only after customer
                  verification and officer authorization are complete.
                </p>

              </div>

            </div>

          </div>


          {/* Open Warning */}
          {isOpen && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

              <p className="text-sm font-bold text-amber-800">
                Locker Currently Open
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Complete the customer operation and close the locker
                before leaving this screen.
              </p>

            </div>
          )}

        </div>

      </div>

    </OfficerLayout>
  );
}


/* ========================= */
/* CHECK ROW                  */
/* ========================= */

function CheckRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-3">

      <span className="text-sm font-medium text-[#334155]">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
        ✓ {value}
      </span>

    </div>
  );
}


/* ========================= */
/* INFO ROW                   */
/* ========================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">

      <span className="text-xs text-[#94A3B8]">
        {label}
      </span>

      <span className="text-xs font-semibold text-[#334155]">
        {value}
      </span>

    </div>
  );
}


export default LockerOperation;