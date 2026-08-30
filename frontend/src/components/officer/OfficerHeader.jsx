import {
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

function OfficerHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-8 backdrop-blur">

      {/* Left */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#111827]">
          Officer Portal
        </h2>

        <p className="mt-1 text-sm text-[#64748B]">
          Secure locker operations and verification
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F5F7FA] hover:text-[#2563EB]"
        >
          <Search size={20} />
        </button>

        {/* Security Status */}
        <div className="hidden items-center gap-2 rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 sm:flex">
          <ShieldCheck
            size={16}
            className="text-[#10B981]"
          />

          <span className="text-xs font-semibold text-[#047857]">
            System Secure
          </span>
        </div>

        {/* Notification */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F5F7FA] hover:text-[#2563EB]"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        {/* Officer */}
        <button
          type="button"
          className="flex items-center gap-3 border-l border-[#E2E8F0] pl-5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0FE] text-sm font-bold text-[#2563EB]">
            AA
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-[#111827]">
              Officer
            </p>

            <p className="text-xs text-[#64748B]">
              OF-2041
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-[#64748B] md:block"
          />
        </button>

      </div>
    </header>
  );
}

export default OfficerHeader;