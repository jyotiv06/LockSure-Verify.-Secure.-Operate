import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OfficerLayout from "../../components/officer/OfficerLayout";
import VerificationStepper from "../../components/officer/VerificationStepper";
import CustomerDetails from "../../components/officer/CustomerDetails";
import DocumentVerification from "../../components/officer/DocumentVerification";
import FaceVerification from "../../components/officer/FaceVerification";
import RiskAssessment from "../../components/officer/RiskAssessment";
import RecommendationCard from "../../components/officer/RecommendationCard";
import VerificationSignals from "../../components/officer/VerificationSignals";

function CustomerVerification() {
  const navigate = useNavigate();
  return (
    <OfficerLayout>

      {/* Header */}
      <div className="mb-6">

        <button
          type="button"
            onClick={() => navigate("/officer/dashboard")}
          className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#64748B] transition hover:text-[#2563EB]"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Verification Workflow
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Customer Verification
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Review identity, documents and risk before locker access.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Operation
              </p>

              <p className="mt-0.5 font-mono text-xs font-bold text-[#334155]">
                OP-20941
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">

              <Clock3
                size={15}
                className="text-[#F59E0B]"
              />

              <span className="text-xs font-semibold text-amber-700">
                Pending Review
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Stepper */}
      <VerificationStepper />

      {/* Customer */}
      <div className="mt-6">
        <CustomerDetails />
      </div>
      <div className="mt-6">
        <VerificationSignals />
       </div>

      {/* Documents */}
      <div className="mt-6">
        <DocumentVerification />
      </div>

      {/* Face */}
      <div className="mt-6">
        <FaceVerification />
      </div>

      {/* Risk + Recommendation */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        <RiskAssessment />

        <RecommendationCard />

      </div>

      {/* Decision */}
     <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">

  <div className="mb-4">

    <h3 className="text-base font-bold text-[#111827]">
      Officer Decision
    </h3>

    <p className="mt-1 text-xs text-[#64748B]">
      Select the appropriate action for this locker request.
    </p>

  </div>

  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

    <button
      type="button"
      onClick={() => alert("Operation blocked")}
      className="inline-flex items-center justify-center rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
    >
      Block
    </button>

    <button
      type="button"
      onClick={() => alert("Operation sent for review")}
      className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
    >
      Send for Review
    </button>

    <button
      type="button"
      onClick={() => navigate("/officer/lockers")}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:shadow-md"
    >
      <CheckCircle2 size={17} />
      Approve
    </button>

  </div>

</div>

    </OfficerLayout>
  );
}

export default CustomerVerification;