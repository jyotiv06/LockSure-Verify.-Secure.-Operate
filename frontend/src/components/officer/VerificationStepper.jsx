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


function VerificationStepper({ verificationData }) {

  /*
    Determine verification progress
    from actual backend data.
  */

  const documentCompleted =
    verificationData?.document_match === true ||
    verificationData?.document_match === false;


  const faceCompleted =
    verificationData?.face_match === true ||
    verificationData?.face_match === false;


  const finalized =
    verificationData?.state === "APPROVED" ||
    verificationData?.state === "BLOCKED" ||
    verificationData?.state === "REVIEW";


  /*
    Customer is available when
    verification session exists.
  */

  const customerCompleted =
    Boolean(
      verificationData?.customer_id
    );


  const getStepState = (index) => {

    /*
      Customer
    */

    if (index === 0) {

      return {
        completed:
          customerCompleted,

        active:
          !documentCompleted &&
          !faceCompleted &&
          !finalized,
      };

    }


    /*
      Documents
    */

    if (index === 1) {

      return {
        completed:
          documentCompleted,

        active:
          customerCompleted &&
          !documentCompleted &&
          !finalized,
      };

    }


    /*
      Face Match
    */

    if (index === 2) {

      return {
        completed:
          faceCompleted,

        active:
          documentCompleted &&
          !faceCompleted &&
          !finalized,
      };

    }


    /*
      Risk Assessment
    */

    if (index === 3) {

      return {
        completed:
          finalized,

        active:
          documentCompleted &&
          faceCompleted &&
          !finalized,
      };

    }


    return {
      completed: false,
      active: false,
    };

  };


  return (

    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5 shadow-sm">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {

          const Icon =
            step.icon;


          const {
            completed,
            active,
          } =
            getStepState(index);


          return (

            <div
              key={step.label}
              className="flex flex-1 items-center"
            >

              <div className="flex items-center gap-2">

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
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


              {index <
                steps.length - 1 && (

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