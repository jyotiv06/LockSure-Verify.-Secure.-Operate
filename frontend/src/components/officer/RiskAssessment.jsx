import {
  ShieldCheck,
  FileCheck2,
  ScanFace,
  History,
  Activity,
} from "lucide-react";

const checks = [
  {
    label: "Document Match",
    icon: FileCheck2,
  },
  {
    label: "Face Match",
    icon: ScanFace,
  },
  {
    label: "Customer History",
    icon: History,
  },
  {
    label: "Suspicious Activity",
    icon: Activity,
  },
];

function RiskAssessment() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <ShieldCheck
            size={20}
            className="text-[#10B981]"
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Risk Assessment
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Current risk based on verification signals.
          </p>
        </div>

      </div>

      <div className="mt-6 flex items-center gap-5">

        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[8px] border-emerald-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#111827]">
              12
            </p>

            <p className="text-[10px] font-semibold uppercase text-[#64748B]">
              / 100
            </p>
          </div>
        </div>

        <div>
          <p className="text-lg font-bold text-[#10B981]">
            Low Risk
          </p>

          <p className="mt-1 text-xs leading-5 text-[#64748B]">
            No significant risk indicators detected.
          </p>
        </div>

      </div>

      <div className="mt-6 grid gap-2">

        {checks.map((check) => {
          const Icon = check.icon;

          return (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2.5"
            >

              <div className="flex items-center gap-2">

                <Icon
                  size={15}
                  className="text-[#64748B]"
                />

                <span className="text-xs font-medium text-[#475569]">
                  {check.label}
                </span>

              </div>

              <span className="h-5 w-5 rounded-full bg-[#DCFCE7] text-center text-xs font-bold leading-5 text-[#16A34A]">
                ✓
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default RiskAssessment;