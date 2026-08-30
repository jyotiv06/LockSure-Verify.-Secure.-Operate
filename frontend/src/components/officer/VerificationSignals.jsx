import {
  FileCheck2,
  ScanFace,
  CreditCard,
  History,
  CheckCircle2,
} from "lucide-react";

const signals = [
  {
    label: "Document",
    value: "Verified",
    icon: FileCheck2,
  },
  {
    label: "Face",
    value: "98.4% Match",
    icon: ScanFace,
  },
  {
    label: "Account",
    value: "Active",
    icon: CreditCard,
  },
  {
    label: "History",
    value: "Normal",
    icon: History,
  },
];

function VerificationSignals() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-bold text-[#111827]">
          Verification Signals
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Consolidated checks used for the risk decision.
        </p>

      </div>

      <div className="grid gap-3 sm:grid-cols-2">

        {signals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                  <Icon
                    size={17}
                    className="text-[#2563EB]"
                  />
                </div>

                <div>

                  <p className="text-xs text-[#94A3B8]">
                    {signal.label}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#111827]">
                    {signal.value}
                  </p>

                </div>

              </div>

              <CheckCircle2
                size={18}
                className="text-[#10B981]"
              />

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default VerificationSignals;