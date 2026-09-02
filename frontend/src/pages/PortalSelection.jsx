import { useNavigate } from "react-router-dom";
import {
  UserRound,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#111827]">
                LockSure
              </h1>

              <p className="text-xs text-[#64748B]">
                Verify. Secure. Operate.
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-84px)] max-w-6xl items-center px-6 py-12">

        <div className="w-full">

          {/* Heading */}
          <div className="mx-auto mb-12 max-w-2xl text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#2563EB]">
              Secure Locker Management
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Welcome to LockSure
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#64748B] sm:text-base">
              Select your portal to securely access locker verification,
              customer services, and operational controls.
            </p>

          </div>

          {/* Portal Cards */}
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">

            {/* Customer Portal */}
            <button
              type="button"
              onClick={() => navigate("/customer/login")}
              className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                <UserRound size={26} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#111827]">
                Customer Portal
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                Access your locker information, verification process,
                account details, and locker status.
              </p>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                Continue as Customer
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </div>

            </button>

            {/* Officer Portal */}
            <button
              type="button"
              onClick={() => navigate("/officer/login")}
              className="group rounded-2xl border border-[#E2E8F0] bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669]">
                <ShieldCheck size={26} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#111827]">
                Officer Portal
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                Search customers, perform identity verification,
                manage locker operations, and review audit history.
              </p>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#059669]">
                Continue as Officer
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </div>

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default PortalSelection;