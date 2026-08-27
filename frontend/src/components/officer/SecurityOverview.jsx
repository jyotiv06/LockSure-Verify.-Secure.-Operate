import {
  ShieldCheck,
  FileCheck2,
  ScanFace,
  Server,
} from "lucide-react";

const verificationItems = [
  {
    label: "Identity Verification",
    value: 98.6,
    icon: ShieldCheck,
  },
  {
    label: "Document Verification",
    value: 97.2,
    icon: FileCheck2,
  },
  {
    label: "Face Match Success",
    value: 96.8,
    icon: ScanFace,
  },
];

function SecurityOverview() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Security Overview
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Verification performance across locker operations.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
          <ShieldCheck
            size={20}
            className="text-[#06B6D4]"
          />
        </div>

      </div>

      {/* Verification Metrics */}
      <div className="mt-6 space-y-5">

        {verificationItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Icon
                    size={16}
                    className="text-[#64748B]"
                    strokeWidth={1.8}
                  />

                  <span className="text-sm font-medium text-[#334155]">
                    {item.label}
                  </span>

                </div>

                <span className="text-sm font-bold text-[#111827]">
                  {item.value}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all duration-700"
                  style={{ width: `${item.value}%` }}
                />
              </div>

            </div>
          );
        })}

      </div>

      {/* System Status */}
      <div className="mt-7 border-t border-[#E2E8F0] pt-5">

        <div className="mb-3 flex items-center gap-2">

          <Server
            size={16}
            className="text-[#64748B]"
          />

          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            System Status
          </span>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <StatusItem label="Identity Services" />
          <StatusItem label="Document Services" />
          <StatusItem label="Face Verification" />
          <StatusItem label="Locker Controller" />

        </div>

      </div>

    </div>
  );
}

function StatusItem({ label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2">

      <span className="h-2 w-2 rounded-full bg-[#10B981]" />

      <span className="truncate text-xs font-medium text-[#475569]">
        {label}
      </span>

    </div>
  );
}

export default SecurityOverview;