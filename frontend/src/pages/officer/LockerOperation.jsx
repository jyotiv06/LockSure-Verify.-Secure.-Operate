import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Unlock,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  Power,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";

function LockerOperations() {
  const navigate = useNavigate();

  const [lockerOpen, setLockerOpen] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");

  const handleOpenLocker = () => {
    setLockerOpen(true);
    setOperationMessage("Locker opened successfully.");
  };

  const handleCloseLocker = () => {
    setLockerOpen(false);
    setOperationMessage("Locker closed successfully.");
  };

  return (
    <OfficerLayout>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/officer/dashboard")}
        className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#64748B] transition hover:text-[#2563EB]"
      >
        <ArrowLeft size={16} />

        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Locker Control
        </p>

        <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
          Locker Operations
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Monitor and control the customer's assigned locker.
        </p>
      </div>

      {/* Success Message */}
      {operationMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <ShieldCheck size={18} />

          {operationMessage}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Locker Status */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            {/* Locker Icon */}
            <div
              className={`flex h-28 w-28 items-center justify-center rounded-3xl ${
                lockerOpen
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              {lockerOpen ? (
                <Unlock
                  size={52}
                  className="text-green-600"
                />
              ) : (
                <Lock
                  size={52}
                  className="text-red-500"
                />
              )}
            </div>

            {/* Status */}
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Current Locker Status
            </p>

            <h2
              className={`mt-2 text-3xl font-bold ${
                lockerOpen
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {lockerOpen ? "OPEN" : "LOCKED"}
            </h2>

            <p className="mt-3 max-w-md text-sm text-[#64748B]">
              {lockerOpen
                ? "The locker is currently open and ready for customer access."
                : "The locker is securely locked and no access is currently active."}
            </p>

            {/* Controls */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!lockerOpen ? (
                <button
                  type="button"
                  onClick={handleOpenLocker}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                >
                  <Unlock size={17} />

                  Open Locker
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseLocker}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  <Lock size={17} />

                  Close Locker
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/officer/dashboard")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
              >
                <Power size={17} />

                End Operation
              </button>
            </div>
          </div>
        </div>

        {/* Locker Information */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#111827]">
            Locker Information
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Active operation details.
          </p>

          <div className="mt-6 space-y-5">
            {/* Customer */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <User
                  size={17}
                  className="text-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-xs text-[#94A3B8]">
                  Customer
                </p>

                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  Rahul Sharma
                </p>
              </div>
            </div>

            {/* Locker */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <Lock
                  size={17}
                  className="text-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-xs text-[#94A3B8]">
                  Locker Number
                </p>

                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  LKR-204
                </p>
              </div>
            </div>

            {/* Branch */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <Building2
                  size={17}
                  className="text-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-xs text-[#94A3B8]">
                  Branch
                </p>

                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  Pune Central
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                <MapPin
                  size={17}
                  className="text-[#2563EB]"
                />
              </div>

              <div>
                <p className="text-xs text-[#94A3B8]">
                  Locker Location
                </p>

                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  Section B · Row 04
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-green-600"
              />

              <span className="text-sm font-semibold text-green-700">
                Verification Approved
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-green-700">
              Customer verification has been approved. Locker access is
              authorized for this operation.
            </p>
          </div>
        </div>
      </div>

      {/* Operation Note */}
      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
        <p className="text-xs leading-5 text-[#64748B]">
          Demo mode: Locker open and close actions are currently simulated
          in the frontend. Physical locker hardware integration will be
          connected separately.
        </p>
      </div>
    </OfficerLayout>
  );
}

export default LockerOperations;