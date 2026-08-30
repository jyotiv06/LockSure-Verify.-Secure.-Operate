import {
  ScanFace,
  CheckCircle2,
  Camera,
} from "lucide-react";

function FaceVerification() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
            <ScanFace
              size={20}
              className="text-[#06B6D4]"
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Face Verification
            </h3>

            <p className="mt-1 text-sm text-[#64748B]">
              Compare customer identity with live verification.
            </p>
          </div>

        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
          <CheckCircle2 size={13} />
          Strong Match
        </span>

      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <FacePanel
          title="Customer Photo"
          icon={ScanFace}
        />

        <FacePanel
          title="Live Capture"
          icon={Camera}
        />

      </div>

      <div className="mt-6 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-5 text-center">

        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Face Match Score
        </p>

        <p className="mt-2 text-4xl font-bold tracking-tight text-[#111827]">
          96.4%
        </p>

        <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-[#E0F2FE]">
          <div
            className="h-full rounded-full bg-[#06B6D4]"
            style={{ width: "96.4%" }}
          />
        </div>

        <p className="mt-3 text-sm font-semibold text-[#0891B2]">
          Identity match is strong
        </p>

      </div>

    </div>
  );
}

function FacePanel({ title, icon: Icon }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">

      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          {title}
        </p>
      </div>

      <div className="flex h-48 items-center justify-center bg-[#F1F5F9]">

        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#CBD5E1] bg-white">
          <Icon
            size={38}
            strokeWidth={1.5}
            className="text-[#94A3B8]"
          />
        </div>

      </div>

    </div>
  );
}

export default FaceVerification;