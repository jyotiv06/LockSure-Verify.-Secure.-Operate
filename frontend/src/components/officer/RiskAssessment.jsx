import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  ScanFace,
  History,
  Activity,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";


function RiskAssessment({ verificationData }) {

  /*
    Calculate a temporary risk score from
    verification signals.

    Later, if the backend provides risk_score,
    it will automatically use that value.
  */

  const documentMatch =
    verificationData?.document_match;

  const faceMatch =
    verificationData?.face_match;

  const accountMatch =
    verificationData?.account_match;

  const historyStatus =
    verificationData?.history_status;


  let calculatedRisk = 0;


  // Document risk
  if (documentMatch === false) {
    calculatedRisk += 40;
  } else if (documentMatch === null || documentMatch === undefined) {
    calculatedRisk += 15;
  }


  // Face risk
  if (faceMatch === false) {
    calculatedRisk += 40;
  } else if (faceMatch === null || faceMatch === undefined) {
    calculatedRisk += 15;
  }


  // Account risk
  if (accountMatch === false) {
    calculatedRisk += 15;
  } else if (
    accountMatch === null ||
    accountMatch === undefined
  ) {
    calculatedRisk += 5;
  }


  // History risk
  if (
    historyStatus &&
    historyStatus !== "Normal"
  ) {
    calculatedRisk += 10;
  }


  /*
    Use backend risk score when available.
    Otherwise use calculated risk.
  */

  const riskScore =
    verificationData?.risk_score ??
    Math.min(calculatedRisk, 100);


  let riskLevel = "Low";
  let riskDescription =
    "No significant risk indicators detected.";


  if (riskScore >= 70) {

    riskLevel = "High";

    riskDescription =
      "Multiple verification or security risk indicators detected.";

  } else if (riskScore >= 40) {

    riskLevel = "Medium";

    riskDescription =
      "Some verification signals require additional officer review.";

  }


  const getRiskStyles = () => {

    if (riskLevel === "High") {
      return {
        text: "text-red-600",
        border: "border-red-100",
        background: "bg-red-50",
        icon: "text-red-500",
      };
    }


    if (riskLevel === "Medium") {
      return {
        text: "text-amber-600",
        border: "border-amber-100",
        background: "bg-amber-50",
        icon: "text-amber-500",
      };
    }


    return {
      text: "text-[#10B981]",
      border: "border-emerald-100",
      background: "bg-emerald-50",
      icon: "text-[#10B981]",
    };
  };


  const riskStyles =
    getRiskStyles();


  const getCheckStatus = (value) => {

    if (value === true) {
      return {
        label: "Passed",
        type: "passed",
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


  const checks = [
    {
      label: "Document Match",
      icon: FileCheck2,
      status: getCheckStatus(
        documentMatch
      ),
    },

    {
      label: "Face Match",
      icon: ScanFace,
      status: getCheckStatus(
        faceMatch
      ),
    },

    {
      label: "Customer History",
      icon: History,
      status:
        historyStatus === "Normal"
          ? {
              label: "Normal",
              type: "passed",
            }
          : {
              label:
                historyStatus || "Pending",
              type:
                historyStatus
                  ? "failed"
                  : "pending",
            },
    },

    {
      label: "Suspicious Activity",
      icon: Activity,

      /*
        This is pending until backend provides
        a suspicious_activity field.
      */
      status:
        verificationData?.suspicious_activity === true
          ? {
              label: "Detected",
              type: "failed",
            }
          : verificationData?.suspicious_activity === false
          ? {
              label: "None",
              type: "passed",
            }
          : {
              label: "Pending",
              type: "pending",
            },
    },
  ];


  const getStatusIcon = (type) => {

    if (type === "passed") {
      return (
        <CheckCircle2
          size={17}
          className="text-[#10B981]"
        />
      );
    }


    if (type === "failed") {
      return (
        <XCircle
          size={17}
          className="text-red-500"
        />
      );
    }


    return (
      <Clock3
        size={17}
        className="text-[#F59E0B]"
      />
    );
  };


  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${riskStyles.background}`}
        >

          {riskLevel === "High" ? (

            <ShieldAlert
              size={20}
              className={riskStyles.icon}
            />

          ) : (

            <ShieldCheck
              size={20}
              className={riskStyles.icon}
            />

          )}

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


      {/* Risk Score */}
      <div className="mt-6 flex items-center gap-5">

        <div
          className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[8px] ${riskStyles.border}`}
        >

          <div className="text-center">

            <p className="text-2xl font-bold text-[#111827]">
              {riskScore}
            </p>

            <p className="text-[10px] font-semibold uppercase text-[#64748B]">
              / 100
            </p>

          </div>

        </div>


        <div>

          <p
            className={`text-lg font-bold ${riskStyles.text}`}
          >
            {riskLevel} Risk
          </p>


          <p className="mt-1 text-xs leading-5 text-[#64748B]">
            {riskDescription}
          </p>

        </div>

      </div>


      {/* Risk Checks */}
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


                <div>

                  <span className="text-xs font-medium text-[#475569]">
                    {check.label}
                  </span>


                  <p
                    className={`text-[10px] font-medium ${
                      check.status.type === "passed"
                        ? "text-[#10B981]"
                        : check.status.type === "failed"
                        ? "text-red-500"
                        : "text-[#F59E0B]"
                    }`}
                  >
                    {check.status.label}
                  </p>

                </div>

              </div>


              {getStatusIcon(
                check.status.type
              )}

            </div>

          );

        })}

      </div>

    </div>
  );
}


export default RiskAssessment;