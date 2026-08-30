import {
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";

function RecommendationCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white p-6 shadow-sm">

      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#DBEAFE] opacity-50 blur-2xl" />

      <div className="relative">

        <div className="flex items-center gap-2">

          <Sparkles
            size={17}
            className="text-[#2563EB]"
          />

          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            AI Verification Recommendation
          </p>

        </div>

        <div className="mt-5 flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DBEAFE]">
            <ShieldCheck
              size={23}
              className="text-[#2563EB]"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#111827]">
              Approve Operation
            </h3>

            <p className="mt-1 text-xs text-[#64748B]">
              Identity and verification checks passed.
            </p>
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/80 px-4 py-3">

          <span className="text-xs font-medium text-[#64748B]">
            Recommendation confidence
          </span>

          <span className="text-sm font-bold text-[#2563EB]">
            96%
          </span>

        </div>

        <div className="mt-4 flex gap-2 rounded-lg border border-[#E2E8F0] bg-white/70 p-3">

          <Info
            size={15}
            className="mt-0.5 shrink-0 text-[#64748B]"
          />

          <p className="text-[11px] leading-5 text-[#64748B]">
            This recommendation assists the officer. Final approval
            must be explicitly confirmed by the authorized officer.
          </p>

        </div>

      </div>

    </div>
  );
}

export default RecommendationCard;