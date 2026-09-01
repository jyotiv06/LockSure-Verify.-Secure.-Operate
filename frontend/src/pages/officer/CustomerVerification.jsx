import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  XCircle,
  FileCheck2,
  ScanFace,
  UserCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../../services/api";

import OfficerLayout from "../../components/officer/OfficerLayout";
import VerificationStepper from "../../components/officer/VerificationStepper";
import CustomerDetails from "../../components/officer/CustomerDetails";
import RiskAssessment from "../../components/officer/RiskAssessment";
import RecommendationCard from "../../components/officer/RecommendationCard";
import VerificationSignals from "../../components/officer/VerificationSignals";


function CustomerVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [verificationId, setVerificationId] = useState(null);

  const [verificationData, setVerificationData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState("");

  const [decision, setDecision] =
    useState("");


const customerCode = searchParams.get("customer");

const customerId = Number(
  customerCode?.replace(/\D/g, "")
);

  /*
    Fetch verification session
  */
  const fetchVerification = async (id) => {
    try {
      const response = await api.get(
        `/verification/${id}`
      );

      setVerificationData(
        response.data
      );

      console.log(
        "Verification data:",
        response.data
      );

    } catch (error) {

      console.error(
        "Failed to fetch verification:",
        error
      );

      setApiError(
        error.response?.data?.detail ||
        "Failed to fetch verification details"
      );
    }
  };


  /*
    Start verification session
  */
  useEffect(() => {

    const startVerification = async () => {

      try {

        setLoading(true);

        setApiError("");

        const response = await api.post(
          "/verification/start",
          {
            customer_id: customerId,
            locker_id: 1,
          }
        );

        const id =
          response.data.verification_id;

        setVerificationId(id);

        localStorage.setItem(
          "verificationId",
          id
        );

        console.log(
          "Verification started:",
          response.data
        );

        await fetchVerification(id);

      } catch (error) {

        console.error(
          "Failed to start verification:",
          error.response?.data || error
        );

        const detail =
          error.response?.data?.detail;

        if (Array.isArray(detail)) {

          setApiError(
            detail
              .map((item) => item.msg)
              .join(", ")
          );

        } else if (
          typeof detail === "string"
        ) {

          setApiError(detail);

        } else {

          setApiError(
            "Failed to start verification"
          );
        }

      } finally {

        setLoading(false);
      }
    };


    startVerification();

  }, [customerId]);


  /*
    OFFICER DECISION ACTIONS
  */

  const handleApprove = () => {

    setDecision("APPROVED");

    localStorage.setItem(
      "officerDecision",
      "APPROVED"
    );

    console.log(
      "Officer decision: APPROVED"
    );

    navigate(
      `/officer/lockers?verification=${verificationId}&status=approved`
    );
  };


  const handleReview = () => {

    setDecision("UNDER REVIEW");

    localStorage.setItem(
      "officerDecision",
      "UNDER REVIEW"
    );

    console.log(
      "Officer decision: UNDER REVIEW"
    );
  };


  const handleBlock = () => {

    setDecision("BLOCKED");

    localStorage.setItem(
      "officerDecision",
      "BLOCKED"
    );

    console.log(
      "Officer decision: BLOCKED"
    );
  };


  /*
    STATUS BADGE
  */
  const getStatus = () => {

    if (decision === "APPROVED") {

      return {
        label: "Approved",

        className:
          "border-green-200 bg-green-50 text-green-700",
      };
    }


    if (decision === "UNDER REVIEW") {

      return {
        label: "Under Review",

        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
    }


    if (decision === "BLOCKED") {

      return {
        label: "Blocked",

        className:
          "border-red-200 bg-red-50 text-red-700",
      };
    }


    return {

      label:
        verificationData?.state ||
        "Pending Review",

      className:
        "border-amber-100 bg-amber-50 text-amber-700",
    };
  };


  const currentStatus =
    getStatus();


  /*
    Verification results
  */

  const documentVerified =
    verificationData?.document_match === true ||
    verificationData?.document_verified === true;


  const faceVerified =
    verificationData?.face_match === true ||
    verificationData?.face_verified === true;


  const accountVerified =
    verificationData?.account_match === true ||
    verificationData?.customer_match === true ||
    verificationData?.account_verified === true;


  return (
    <OfficerLayout>

      {/* LOADING */}
      {loading && (

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />

            <p className="mt-4 text-sm font-medium text-[#64748B]">
              Loading verification session...
            </p>

          </div>

        </div>

      )}


      {/* API ERROR */}
      {!loading && apiError && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          {apiError}

        </div>

      )}


      {/* MAIN SCREEN */}
      {!loading && !apiError && (

        <>

          {/* HEADER */}
          <div className="mb-6">

            <button
              type="button"
              onClick={() =>
                navigate("/officer/dashboard")
              }
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
                  Review customer verification results and assess risk before approving locker access.
                </p>

              </div>


              <div className="flex items-center gap-3">

                {/* OPERATION ID */}
                <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2">

                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    Operation
                  </p>

                  <p className="mt-0.5 font-mono text-xs font-bold text-[#334155]">

                    {verificationId
                      ? verificationId
                        .slice(0, 8)
                        .toUpperCase()
                      : "STARTING"}

                  </p>

                </div>


                {/* STATUS */}
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${currentStatus.className}`}
                >

                  <Clock3 size={15} />

                  <span className="text-xs font-semibold">
                    {currentStatus.label}
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* VERIFICATION TIMELINE */}
          <VerificationStepper
            verificationData={verificationData}
          />


          {/* CUSTOMER DETAILS */}
          <div className="mt-6">

            <CustomerDetails
              verificationData={verificationData}
            />

          </div>


          {/* VERIFICATION RESULTS */}
          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <div className="mb-5">

              <h3 className="text-lg font-bold text-[#111827]">
                Verification Results
              </h3>

              <p className="mt-1 text-sm text-[#64748B]">
                Review completed customer verification checks.
              </p>

            </div>


            <div className="grid gap-4 md:grid-cols-3">

              {/* DOCUMENT */}
              <div className="rounded-xl border border-[#E2E8F0] p-5">

                <div className="flex items-center justify-between">

                  <FileCheck2
                    size={22}
                    className="text-[#2563EB]"
                  />

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${documentVerified
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {documentVerified
                      ? "Verified"
                      : "Pending"}
                  </span>

                </div>

                <h4 className="mt-4 font-semibold text-[#111827]">
                  Document
                </h4>

                <p className="mt-1 text-xs text-[#64748B]">
                  Identity document verification result.
                </p>

              </div>


              {/* FACE */}
              <div className="rounded-xl border border-[#E2E8F0] p-5">

                <div className="flex items-center justify-between">

                  <ScanFace
                    size={22}
                    className="text-[#2563EB]"
                  />

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${faceVerified
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {faceVerified
                      ? "Verified"
                      : "Pending"}
                  </span>

                </div>

                <h4 className="mt-4 font-semibold text-[#111827]">
                  Face Match
                </h4>

                <p className="mt-1 text-xs text-[#64748B]">
                  Facial identity verification result.
                </p>

              </div>


              {/* ACCOUNT */}
              <div className="rounded-xl border border-[#E2E8F0] p-5">

                <div className="flex items-center justify-between">

                  <UserCheck
                    size={22}
                    className="text-[#2563EB]"
                  />

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${accountVerified
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {accountVerified
                      ? "Verified"
                      : "Pending"}
                  </span>

                </div>

                <h4 className="mt-4 font-semibold text-[#111827]">
                  Account Match
                </h4>

                <p className="mt-1 text-xs text-[#64748B]">
                  Customer account and identity match.
                </p>

              </div>

            </div>

          </div>


          {/* VERIFICATION SIGNALS */}
          <div className="mt-6">

            <VerificationSignals
              verificationData={verificationData}
            />

          </div>


          {/* RISK + RECOMMENDATION */}
          <div className="mt-6 grid gap-6 xl:grid-cols-2">

            <RiskAssessment
              verificationData={verificationData}
            />

            <RecommendationCard
              verificationData={verificationData}
            />

          </div>


          {/* ============================= */}
          {/* OFFICER DECISION - NEW SECTION */}
          {/* ============================= */}

          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

              <div>

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={19}
                    className="text-[#2563EB]"
                  />

                  <h3 className="text-lg font-bold text-[#111827]">
                    Officer Decision
                  </h3>

                </div>

                <p className="mt-2 text-sm text-[#64748B]">
                  You are responsible for the final operational decision.
                  Review the verification and risk results before continuing.
                </p>

              </div>


              {/* Current Decision */}
              {decision && (

                <div
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${decision === "APPROVED"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : decision === "BLOCKED"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                >

                  Current: {decision}

                </div>

              )}

            </div>


            {/* Decision warning */}
            {!decision && (

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

                <p className="text-xs leading-5 text-blue-700">

                  No officer decision has been recorded yet.
                  Select Approve, Send for Review, or Block.

                </p>

              </div>

            )}


            {/* ACTION BUTTONS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

              {/* BLOCK */}
              <button
                type="button"
                onClick={handleBlock}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >

                <XCircle size={17} />

                Block Operation

              </button>


              {/* REVIEW */}
              <button
                type="button"
                onClick={handleReview}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              >

                <Clock3 size={17} />

                Send for Review

              </button>


              {/* APPROVE */}
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:shadow-md"
              >

                <CheckCircle2 size={17} />

                Approve & Open Locker

              </button>

            </div>

          </div>

        </>

      )}

    </OfficerLayout>
  );
}

export default CustomerVerification;