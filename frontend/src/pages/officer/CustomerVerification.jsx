import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  FileCheck2,
  ScanFace,
  CircleCheck,
  CircleX,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

  const [searchParams] =
    useSearchParams();


  /*
    Prevent duplicate verification
    creation in React Strict Mode
  */
  const initializedCustomerRef =
    useRef(null);


  /*
    Customer identifier from URL
  */
  const customerIdentifier =
    searchParams.get("customer");


  /*
    Verification session ID
  */
  const [
    verificationId,
    setVerificationId,
  ] = useState(null);


  /*
    Verification session data
  */
  const [
    verificationData,
    setVerificationData,
  ] = useState(null);


  /*
    Customer data
  */
  const [
    customerData,
    setCustomerData,
  ] = useState(null);


  /*
    Loading state
  */
  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
    Action loading
  */
  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  /*
    API error
  */
  const [
    apiError,
    setApiError,
  ] = useState("");


  /*
    =================================
    FETCH VERIFICATION SESSION
    =================================
  */
  const fetchVerification =
    async (id) => {

      try {

        const response =
          await api.get(
            `/verification/${id}`
          );


        setVerificationData(
          response.data
        );


        console.log(
          "Verification data:",
          response.data
        );


        return response.data;

      } catch (error) {

        console.error(
          "Failed to fetch verification:",
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to fetch verification details."
        );


        return null;

      }

    };


  /*
    =================================
    INITIALIZE VERIFICATION
    =================================
  */
  useEffect(() => {

    const initializeVerification =
      async () => {

        if (!customerIdentifier) {

          setApiError(
            "Customer identifier is missing."
          );

          setLoading(false);

          return;

        }


        /*
          Prevent duplicate POST requests
          caused by React Strict Mode
        */
        if (
          initializedCustomerRef.current ===
          customerIdentifier
        ) {

          return;

        }


        initializedCustomerRef.current =
          customerIdentifier;


        try {

          setLoading(true);

          setApiError("");


          /*
            =================================
            STEP 1:
            FETCH CUSTOMER
            =================================
          */
          const customerResponse =
            await api.get(
              `/customers/${encodeURIComponent(
                customerIdentifier
              )}`
            );


          const customer =
            customerResponse.data;


          setCustomerData(
            customer
          );


          console.log(
            "Customer data:",
            customer
          );


          /*
            =================================
            STEP 2:
            PREPARE BACKEND VALUES
            =================================

            IMPORTANT:

            customer.customer_id
            -> Database customer ID

            customer.locker_number
            -> Business locker number

            Backend start_verification()
            searches by:

            Locker.locker_number == locker_id
          */

          const verificationCustomerId =
            customer.customer_id;


          const verificationLockerNumber =
            customer.locker_number;


          console.log(
            "Verification values being sent:",
            {
              customer_id:
                verificationCustomerId,

              customer_id_type:
                typeof verificationCustomerId,

              locker_number:
                verificationLockerNumber,

              locker_number_type:
                typeof verificationLockerNumber,
            }
          );


          /*
            VALIDATE CUSTOMER ID
          */
          if (
            verificationCustomerId === null ||
            verificationCustomerId === undefined
          ) {

            throw new Error(
              "Backend customer ID was not found."
            );

          }


          /*
            VALIDATE LOCKER NUMBER
          */
          if (
            !verificationLockerNumber
          ) {

            throw new Error(
              "Customer does not have a valid locker number."
            );

          }


          /*
            =================================
            STEP 3:
            START VERIFICATION
            =================================
          */
          const response =
            await api.post(
              "/verification/start",
              {
                /*
                  Integer database ID
                */
                customer_id:
                  Number(
                    verificationCustomerId
                  ),

                /*
                  Backend expects business
                  locker number such as:
                  L001
                  L032
                */
                locker_id:
                  String(
                    verificationLockerNumber
                  ),

                account_status:
                  customer.account_status ||
                  "ACTIVE",

                failed_attempts:
                  0,

                access_attempts_last_hour:
                  0,

                customer_data: {
                  customer_id:
                    customer.customer_id,

                  customer_number:
                    customer.customer_number,

                  full_name:
                    customer.full_name,

                  email:
                    customer.email,

                  phone:
                    customer.phone,

                  account_number:
                    customer.account_number,

                  locker_number:
                    customer.locker_number,

                  branch_name:
                    customer.branch_name,
                },
              }
            );


          console.log(
            "Verification started:",
            response.data
          );


          /*
            Backend returns:

            verification_id

            Keep fallback support for
            other possible response formats.
          */
          const id =
            response.data.verification_id ||
            response.data.session_id ||
            response.data.id;


          if (!id) {

            throw new Error(
              "Verification ID was not returned by the server."
            );

          }


          const sessionId =
            String(id);


          setVerificationId(
            sessionId
          );


          /*
            SAVE SESSION DATA
          */
          localStorage.setItem(
            "verificationId",
            sessionId
          );


          localStorage.setItem(
            "verificationCustomerId",
            String(
              verificationCustomerId
            )
          );


          /*
            Save business locker number,
            not database locker ID
          */
          localStorage.setItem(
            "verificationLockerId",
            String(
              verificationLockerNumber
            )
          );


          /*
            Initially use POST response
            immediately.

            This prevents the UI from
            becoming empty if GET response
            structure differs.
          */
          setVerificationData(
            response.data
          );


          /*
            =================================
            STEP 4:
            FETCH COMPLETE SESSION
            =================================
          */
          await fetchVerification(
            sessionId
          );


        } catch (error) {

          console.error(
            "Failed to initialize verification:",
            error.response?.data ||
            error
          );


          const detail =
            error.response?.data?.detail;


          if (
            Array.isArray(detail)
          ) {

            setApiError(
              detail
                .map(
                  (item) =>
                    item.msg
                )
                .join(", ")
            );

          } else if (
            typeof detail === "string"
          ) {

            setApiError(
              detail
            );

          } else {

            setApiError(
              error.message ||
              "Failed to start verification."
            );

          }


          /*
            Allow retry after failure
          */
          initializedCustomerRef.current =
            null;


        } finally {

          setLoading(false);

        }

      };


    initializeVerification();


  }, [
    customerIdentifier
  ]);


  /*
    =================================
    DOCUMENT VERIFICATION
    =================================
  */
  const handleDocumentVerification =
    async (documentMatch) => {

      if (!verificationId) {

        setApiError(
          "Verification session is not available."
        );

        return;

      }


      try {

        setActionLoading(true);

        setApiError("");


        const response =
          await api.post(
            `/verification/${verificationId}/document`,
            {
              document_match:
                documentMatch,
            }
          );


        setVerificationData(
          response.data
        );


        await fetchVerification(
          verificationId
        );


      } catch (error) {

        console.error(
          "Document verification failed:",
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to verify document."
        );


      } finally {

        setActionLoading(false);

      }

    };


  /*
    =================================
    FACE VERIFICATION
    =================================
  */
  const handleFaceVerification =
    async (faceMatch) => {

      if (!verificationId) {

        setApiError(
          "Verification session is not available."
        );

        return;

      }


      try {

        setActionLoading(true);

        setApiError("");


        const response =
          await api.post(
            `/verification/${verificationId}/face`,
            {
              face_match:
                faceMatch,
            }
          );


        setVerificationData(
          response.data
        );


        await fetchVerification(
          verificationId
        );


      } catch (error) {

        console.error(
          "Face verification failed:",
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to verify face."
        );


      } finally {

        setActionLoading(false);

      }

    };


  /*
    =================================
    FINALIZE VERIFICATION
    =================================
  */
  const handleFinalizeVerification =
    async () => {

      if (!verificationId) {

        setApiError(
          "Verification session is not available."
        );

        return;

      }


      try {

        setActionLoading(true);

        setApiError("");


        const response =
          await api.post(
            `/verification/${verificationId}/finalize`
          );


        console.log(
          "Final verification:",
          response.data
        );


        setVerificationData(
          response.data
        );


        localStorage.setItem(
          "verificationDecision",
          response.data.state
        );


        /*
          Fetch latest complete data
        */
        await fetchVerification(
          verificationId
        );


      } catch (error) {

        console.error(
          "Failed to finalize verification:",
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to finalize verification."
        );


      } finally {

        setActionLoading(false);

      }

    };


  /*
    =================================
    MERGE CUSTOMER + VERIFICATION DATA
    =================================
  */
  const displayData = {

    ...(verificationData || {}),


    customer_id:
      customerData?.customer_id ??
      verificationData?.customer_id ??
      null,


    customer_number:
      customerData?.customer_number ??
      verificationData?.customer_number ??
      null,


    full_name:
      customerData?.full_name ??
      verificationData?.full_name ??
      verificationData?.customer_name ??
      null,


    customer_name:
      customerData?.full_name ??
      verificationData?.customer_name ??
      verificationData?.full_name ??
      null,


    email:
      customerData?.email ??
      verificationData?.email ??
      null,


    phone:
      customerData?.phone ??
      verificationData?.phone ??
      null,


    account_id:
      customerData?.account_id ??
      verificationData?.account_id ??
      null,


    account_number:
      customerData?.account_number ??
      verificationData?.account_number ??
      null,


    locker_id:
      customerData?.locker_id ??
      verificationData?.locker_id ??
      null,


    locker_number:
      customerData?.locker_number ??
      verificationData?.locker_number ??
      null,


    locker_status:
      customerData?.locker_status ??
      verificationData?.locker_status ??
      null,


    branch_name:
      customerData?.branch_name ??
      verificationData?.branch_name ??
      null,


    locker_location:
      customerData?.locker_location ??
      verificationData?.locker_location ??
      customerData?.location ??
      verificationData?.location ??
      null,
  };


  /*
    =================================
    OPEN LOCKER
    =================================
  */
  const handleApprove = () => {

    if (
      verificationData?.state !==
      "APPROVED"
    ) {

      setApiError(
        "Verification must be approved before opening the locker."
      );

      return;

    }


    navigate(
      `/officer/lockers?verification=${verificationId}&status=approved`,
      {
        state: {
          customer:
            displayData,

          verificationId:
            verificationId,
        },
      }
    );

  };


  /*
    =================================
    STATUS
    =================================
  */
  const getStatus = () => {

    const state =
      verificationData?.state;


    if (
      state === "APPROVED"
    ) {

      return {
        label:
          "Approved",

        className:
          "border-green-200 bg-green-50 text-green-700",
      };

    }


    if (
      state === "BLOCKED"
    ) {

      return {
        label:
          "Blocked",

        className:
          "border-red-200 bg-red-50 text-red-700",
      };

    }


    if (
      state === "REVIEW"
    ) {

      return {
        label:
          "Manual Review",

        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    }


    return {
      label:
        state ||
        "In Progress",

      className:
        "border-blue-100 bg-blue-50 text-blue-700",
    };

  };


  const currentStatus =
    getStatus();


  /*
    =================================
    VERIFICATION STATUS
    =================================
  */
  const documentStatus =

    verificationData?.document_match === true
      ? "Verified"

      : verificationData?.document_match === false
        ? "Failed"

        : "Pending";


  const faceStatus =

    verificationData?.face_match === true
      ? "Verified"

      : verificationData?.face_match === false
        ? "Failed"

        : "Pending";


  const documentCompleted =

    verificationData?.document_match === true ||
    verificationData?.document_match === false;


  const faceCompleted =

    verificationData?.face_match === true ||
    verificationData?.face_match === false;


  const verificationFinalized =

    verificationData?.state === "APPROVED" ||
    verificationData?.state === "BLOCKED" ||
    verificationData?.state === "REVIEW";


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


      {/* ERROR */}

      {!loading && apiError && (

        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">

          <h3 className="font-bold text-red-700">
            Verification Error
          </h3>

          <p className="mt-2 text-sm text-red-600">
            {apiError}
          </p>

        </div>

      )}


      {/* MAIN */}

      {!loading &&
        customerData && (

          <>


            {/* HEADER */}

            <div className="mb-6">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/officer/customers"
                  )
                }
                className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#64748B] transition hover:text-[#2563EB]"
              >

                <ArrowLeft size={15} />

                Back to Customer Search

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

                    Reviewing verification for{" "}

                    <span className="font-semibold text-[#111827]">
                      {customerData.full_name}
                    </span>

                  </p>

                </div>


                <div className="flex items-center gap-3">

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


            {/* STEPPER */}

            <VerificationStepper
              verificationData={
                displayData
              }
            />


            {/* CUSTOMER DETAILS */}

            <div className="mt-6">

              <CustomerDetails
                customer={
                  displayData
                }
              />

            </div>


            {/* VERIFICATION RESULTS */}

            <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h3 className="text-lg font-bold text-[#111827]">
                  Verification Results
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  Complete the document and face verification checks.
                </p>

              </div>


              <div className="grid gap-4 md:grid-cols-2">


                {/* DOCUMENT */}

                <div className="rounded-xl border border-[#E2E8F0] p-5">

                  <div className="flex items-center justify-between">

                    <FileCheck2
                      size={22}
                      className="text-[#2563EB]"
                    />

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${documentStatus === "Verified"
                          ? "bg-green-50 text-green-700"
                          : documentStatus === "Failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      {documentStatus}
                    </span>

                  </div>


                  <h4 className="mt-4 font-semibold text-[#111827]">
                    Document Verification
                  </h4>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Confirm whether the customer's identity document matches.
                  </p>


                  {!verificationFinalized && (

                    <div className="mt-5 flex gap-3">

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleDocumentVerification(
                            true
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >

                        <CircleCheck size={15} />

                        Mark Passed

                      </button>


                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleDocumentVerification(
                            false
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >

                        <CircleX size={15} />

                        Mark Failed

                      </button>

                    </div>

                  )}

                </div>


                {/* FACE */}

                <div className="rounded-xl border border-[#E2E8F0] p-5">

                  <div className="flex items-center justify-between">

                    <ScanFace
                      size={22}
                      className="text-[#2563EB]"
                    />

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${faceStatus === "Verified"
                          ? "bg-green-50 text-green-700"
                          : faceStatus === "Failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      {faceStatus}
                    </span>

                  </div>


                  <h4 className="mt-4 font-semibold text-[#111827]">
                    Face Match
                  </h4>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Confirm whether the customer's face matches the identity.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-[#111827]">

                    Match Score:{" "}

                    <span className="text-[#2563EB]">

                      {displayData?.face_match_score != null
                        ? `${Number(
                          displayData.face_match_score
                        ).toFixed(1)}%`
                        : "Pending"}

                    </span>

                  </p>


                  {!verificationFinalized && (

                    <div className="mt-5 flex gap-3">

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleFaceVerification(
                            true
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >

                        <CircleCheck size={15} />

                        Mark Passed

                      </button>


                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleFaceVerification(
                            false
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >

                        <CircleX size={15} />

                        Mark Failed

                      </button>

                    </div>

                  )}

                </div>

              </div>


              {/* FINALIZE */}

              <div className="mt-6 border-t border-[#E2E8F0] pt-5">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <h4 className="font-semibold text-[#111827]">
                      Final Verification Decision
                    </h4>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Finalize after completing document and face verification.
                    </p>

                  </div>


                  <button
                    type="button"
                    disabled={
                      actionLoading ||
                      verificationFinalized ||
                      !documentCompleted ||
                      !faceCompleted
                    }
                    onClick={
                      handleFinalizeVerification
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <ShieldAlert size={17} />

                    {verificationFinalized
                      ? "Verification Finalized"
                      : "Finalize Verification"}

                  </button>

                </div>

              </div>

            </div>


            {/* VERIFICATION SIGNALS */}

            <div className="mt-6">

              <VerificationSignals
                verificationData={
                  displayData
                }
              />

            </div>


            {/* RISK + RECOMMENDATION */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              <RiskAssessment
                verificationData={
                  displayData
                }
              />

              <RecommendationCard
                verificationData={
                  displayData
                }
              />

            </div>


            {/* OFFICER DECISION */}

            <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div>

                  <div className="flex items-center gap-2">

                    <ShieldAlert
                      size={19}
                      className="text-[#2563EB]"
                    />

                    <h3 className="text-lg font-bold text-[#111827]">
                      Final Operation
                    </h3>

                  </div>

                  <p className="mt-2 text-sm text-[#64748B]">
                    The locker can only be opened after the backend approves the verification.
                  </p>

                </div>

              </div>


              {verificationFinalized && (

                <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">

                  <p className="text-sm font-semibold text-[#111827]">

                    Verification Result:{" "}

                    <span
                      className={
                        verificationData?.state ===
                          "APPROVED"
                          ? "text-green-600"
                          : verificationData?.state ===
                            "BLOCKED"
                            ? "text-red-600"
                            : "text-amber-600"
                      }
                    >

                      {verificationData?.state}

                    </span>

                  </p>


                  {verificationData?.reason && (

                    <p className="mt-2 text-xs text-[#64748B]">
                      {verificationData.reason}
                    </p>

                  )}

                </div>

              )}


              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={
                    actionLoading ||
                    verificationData?.state !==
                    "APPROVED"
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <CheckCircle2 size={17} />

                  Open Approved Locker

                </button>

              </div>

            </div>

          </>

        )}

    </OfficerLayout>

  );

}


export default CustomerVerification;