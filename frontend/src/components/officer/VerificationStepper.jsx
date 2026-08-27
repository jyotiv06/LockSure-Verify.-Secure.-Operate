import {
  UserRound,
  FileCheck2,
  ScanFace,
  ShieldCheck,
  Check,
} from "lucide-react";

const steps = [
  {
    label: "Customer",
    icon: UserRound,
  },
  {
    label: "Documents",
    icon: FileCheck2,
  },
  {
    label: "Face Match",
    icon: ScanFace,
  },
  {
    label: "Risk Assessment",
    icon: ShieldCheck,
  },
];

function VerificationStepper() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between">

        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = index < 3;
          const active = index === 3;

          return (
            <div
              key={step.label}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-2">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    completed
                      ? "border-[#10B981] bg-[#ECFDF5] text-[#10B981]"
                      : active
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-[#E2E8F0] bg-white text-[#94A3B8]"
                  }`}
                >
                  {completed ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>

                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    active
                      ? "text-[#2563EB]"
                      : completed
                      ? "text-[#334155]"
                      : "text-[#94A3B8]"
                  }`}
                >
                  {step.label}
                </span>

              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 ${
                    completed
                      ? "bg-[#10B981]"
                      : "bg-[#E2E8F0]"
                  }`}
                />
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default VerificationStepper;