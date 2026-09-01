import {
  FileCheck2,
  ScanFace,
  CreditCard,
  History,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

function VerificationSignals({ verificationData }) {
  /*
    Backend verification states may vary depending
    on the current verification stage.
  */

  /*
    Account/customer matching is currently based on
    whether a valid verification session exists.

    You can replace this later when the backend provides
    a dedicated account_match field.
  */
  const accountVerified =
    verificationData?.account_match === true;

  /*
    History may not yet exist in the backend response.
    Keep it as Pending until the backend provides it.
  */
  const historyStatus =
    verificationData?.history_status ||
    "Pending";


  const getStatus = (value, verifiedText = "Verified") => {

    if (value === true) {
      return {
        label: verifiedText,
        type: "verified",
      };
    }

    if (value === false) {
      return {
        label: "Failed",
        type: "failed",
      };
    }

    return {
      label: "Pending",
      type: "pending",
    };
  };


  const signals = [
    {
      label: "Document",
      icon: FileCheck2,
      status: getStatus(
        verificationData?.document_match
      ),
    },

    {
      label: "Face Match",
      icon: ScanFace,
      status: getStatus(
        verificationData?.face_match
      ),
    },

    {
      label: "Account Match",
      icon: CreditCard,
      status: getStatus(
        verificationData?.account_match
      ),
    },

    {
      label: "History",
      icon: History,
      status: {
        label: historyStatus,
        type:
          historyStatus === "Normal"
            ? "verified"
            : "pending",
      },
    },
  ];


  const getStatusIcon = (type) => {

    if (type === "verified") {
      return (
        <CheckCircle2
          size={18}
          className="text-[#10B981]"
        />
      );
    }

    if (type === "failed") {
      return (
        <XCircle
          size={18}
          className="text-red-500"
        />
      );
    }

    return (
      <Clock3
        size={18}
        className="text-[#F59E0B]"
      />
    );
  };


  const getStatusColor = (type) => {

    if (type === "verified") {
      return "text-[#059669]";
    }

    if (type === "failed") {
      return "text-red-600";
    }

    return "text-[#D97706]";
  };


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


                  <p
                    className={`mt-1 text-sm font-semibold ${getStatusColor(
                      signal.status.type
                    )}`}
                  >
                    {signal.status.label}
                  </p>

                </div>

              </div>


              {getStatusIcon(
                signal.status.type
              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}


export default VerificationSignals;