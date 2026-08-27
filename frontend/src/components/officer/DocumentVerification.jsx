import {
  FileCheck2,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from "lucide-react";

function DocumentVerification() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <FileCheck2
              size={20}
              className="text-[#2563EB]"
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Document Verification
            </h3>

            <p className="mt-1 text-sm text-[#64748B]">
              Identity documents were checked successfully.
            </p>
          </div>

        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
          <CheckCircle2 size={13} />
          Verified
        </span>

      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        <DocumentItem
          name="Aadhaar"
          confidence="99.1%"
        />

        <DocumentItem
          name="PAN"
          confidence="98.4%"
        />

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-5">

        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck size={15} className="text-[#10B981]" />
          Document authenticity passed
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#334155] transition hover:border-[#BFDBFE] hover:text-[#2563EB]"
        >
          <Eye size={15} />
          View Documents
        </button>

      </div>

    </div>
  );
}

function DocumentItem({ name, confidence }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <FileCheck2
            size={17}
            className="text-[#2563EB]"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#111827]">
            {name}
          </p>

          <p className="mt-0.5 text-xs text-[#64748B]">
            Authenticity verified
          </p>
        </div>

      </div>

      <span className="text-xs font-bold text-[#10B981]">
        {confidence}
      </span>

    </div>
  );
}

export default DocumentVerification;