import {
  ShieldCheck,
  ShieldAlert,
  Clock3,
  Sparkles,
  Info,
} from "lucide-react";


function RecommendationCard({ verificationData }) {

  const documentMatch =
    verificationData?.document_match;

  const faceMatch =
    verificationData?.face_match;

  const accountMatch =
    verificationData?.account_match;


  /*
    Calculate risk temporarily.

    If backend later provides risk_score,
    that value will be used automatically.
  */

  let calculatedRisk = 0;


  if (documentMatch === false) {
    calculatedRisk += 40;
  } else if (
    documentMatch === null ||
    documentMatch === undefined
  ) {
    calculatedRisk += 15;
  }


  if (faceMatch === false) {
    calculatedRisk += 40;
  } else if (
    faceMatch === null ||
    faceMatch === undefined
  ) {
    calculatedRisk += 15;
  }


  if (accountMatch === false) {
    calculatedRisk += 15;
  } else if (
    accountMatch === null ||
    accountMatch === undefined
  ) {
    calculatedRisk += 5;
  }


  const riskScore =
    verificationData?.risk_score ??
    Math.min(calculatedRisk, 100);


  /*
    Determine whether verification
    is complete.
  */

  const allVerified =
    documentMatch === true &&
    faceMatch === true &&
    accountMatch === true;


  const verificationFailed =
    documentMatch === false ||
    faceMatch === false ||
    accountMatch === false;


  /*
    Recommendation values
  */

  let recommendation = "Send for Review";

  let description =
    "Verification checks are still pending or require officer review.";

  let confidence = 60;

  let type = "review";


  /*
    Block
  */

  if (
    verificationFailed ||
    riskScore >= 70
  ) {

    recommendation = "Block Operation";

    description =
      "Verification failed or high-risk indicators were detected.";

    confidence = 95;

    type = "block";

  }


  /*
    Approve
  */

  else if (
    allVerified &&
    riskScore < 40
  ) {

    recommendation = "Approve Operation";

    description =
      "Identity and verification checks passed with low risk.";

    confidence = 96;

    type = "approve";

  }


  const getRecommendationStyles = () => {

    if (type === "approve") {

      return {
        heading: "text-[#047857]",
        iconBg: "bg-emerald-100",
        icon: "text-[#10B981]",
        confidence: "text-[#059669]",
        border: "border-emerald-200",
        background:
          "bg-gradient-to-br from-emerald-50 to-white",
      };
    }


    if (type === "block") {

      return {
        heading: "text-red-700",
        iconBg: "bg-red-100",
        icon: "text-red-600",
        confidence: "text-red-600",
        border: "border-red-200",
        background:
          "bg-gradient-to-br from-red-50 to-white",
      };
    }


    return {
      heading: "text-[#D97706]",
      iconBg: "bg-amber-100",
      icon: "text-[#F59E0B]",
      confidence: "text-[#D97706]",
      border: "border-amber-200",
      background:
        "bg-gradient-to-br from-amber-50 to-white",
    };

  };


  const styles =
    getRecommendationStyles();


  const RecommendationIcon =
    type === "approve"
      ? ShieldCheck
      : type === "block"
      ? ShieldAlert
      : Clock3;


  return (

    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${styles.border} ${styles.background}`}
    >

      <div
        className={`absolute right-0 top-0 h-24 w-24 rounded-full opacity-50 blur-2xl ${styles.iconBg}`}
      />


      <div className="relative">

        {/* Header */}
        <div className="flex items-center gap-2">

          <Sparkles
            size={17}
            className="text-[#2563EB]"
          />

          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Officer Recommendation
          </p>

        </div>


        {/* Recommendation */}
        <div className="mt-5 flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg}`}
          >

            <RecommendationIcon
              size={23}
              className={styles.icon}
            />

          </div>


          <div>

            <h3
              className={`text-xl font-bold ${styles.heading}`}
            >
              {recommendation}
            </h3>


            <p className="mt-1 text-xs text-[#64748B]">
              {description}
            </p>

          </div>

        </div>


        {/* Confidence */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/80 px-4 py-3">

          <span className="text-xs font-medium text-[#64748B]">
            Recommendation confidence
          </span>


          <span
            className={`text-sm font-bold ${styles.confidence}`}
          >
            {confidence}%
          </span>

        </div>


        {/* Risk Information */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-4 py-3">

          <span className="text-xs font-medium text-[#64748B]">
            Current risk score
          </span>


          <span className="text-sm font-bold text-[#111827]">
            {riskScore}/100
          </span>

        </div>


        {/* Officer note */}
        <div className="mt-4 flex gap-2 rounded-lg border border-[#E2E8F0] bg-white/70 p-3">

          <Info
            size={15}
            className="mt-0.5 shrink-0 text-[#64748B]"
          />

          <p className="text-[11px] leading-5 text-[#64748B]">
            This recommendation assists the officer. The final
            decision must be explicitly confirmed by an authorized
            officer.
          </p>

        </div>

      </div>

    </div>

  );

}


export default RecommendationCard;