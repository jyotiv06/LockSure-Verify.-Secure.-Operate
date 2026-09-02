import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  FileCheck2,
  ScanFace,
  CircleCheck,
  CircleX,
  Loader2,
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
    Page loading
  */
  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
    Current action loading

    Values:
    document-pass
    document-fail
    face-pass
    face-fail
    finalize
  */
  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  /*
    API error
  */
  const [
    apiError,
    setApiError,
  ] = useState("");


  /*
    =================================
    NORMALIZE BOOLEAN VALUES
    =================================

    Backend may return:

    true
    false

    OR

    VERIFIED
    FAILED
    PASSED
    REJECTED
  */
  const normalizeBoolean =
    (value) => {

      if (
        value === true ||
        value === "true"
      ) {
        return true;
      }


      if (
        value === false ||
        value === "false"
      ) {
        return false;
      }


      if (
        typeof value === "string"
      ) {

        const normalized =
          value
            .trim()
            .toUpperCase();


        if (
          [
            "VERIFIED",
            "PASSED",
            "SUCCESS",
            "MATCHED",
            "APPROVED",
          ].includes(normalized)
        ) {
          return true;
        }


        if (
          [
            "FAILED",
            "REJECTED",
            "NOT_MATCHED",
            "BLOCKED",
          ].includes(normalized)
        ) {
          return false;
        }

      }


      return null;

    };


  /*
    =================================
    GET DOCUMENT RESULT

    Supports different possible
    backend response structures.
  */
  const getDocumentMatch =
    (data) => {

      if (!data) {
        return null;
      }


      const direct =
        normalizeBoolean(
          data.document_match
        );


      if (
        direct !== null
      ) {
        return direct;
      }


      const result =
        normalizeBoolean(
          data.document_result
        );


      if (
        result !== null
      ) {
        return result;
      }


      const nestedResult =
        normalizeBoolean(
          data.document_verification?.result
        );


      if (
        nestedResult !== null
      ) {
        return nestedResult;
      }


      const nestedMatch =
        normalizeBoolean(
          data.document_verification?.document_match
        );


      if (
        nestedMatch !== null
      ) {
        return nestedMatch;
      }


      return null;

    };


  /*
    =================================
    GET FACE RESULT
    =================================
  */
  const getFaceMatch =
    (data) => {

      if (!data) {
        return null;
      }


      const direct =
        normalizeBoolean(
          data.face_match
        );


      if (
        direct !== null
      ) {
        return direct;
      }


      const result =
        normalizeBoolean(
          data.face_result
        );


      if (
        result !== null
      ) {
        return result;
      }


      const nestedResult =
        normalizeBoolean(
          data.face_verification?.result
        );


      if (
        nestedResult !== null
      ) {
        return nestedResult;
      }


      const nestedMatch =
        normalizeBoolean(
          data.face_verification?.face_match
        );


      if (
        nestedMatch !== null
      ) {
        return nestedMatch;
      }


      return null;

    };


  /*
    =================================
    FETCH VERIFICATION
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
            STEP 1:
            FETCH CUSTOMER
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
            STEP 2:
            PREPARE VALUES
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
            VALIDATE CUSTOMER
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
            VALIDATE LOCKER
          */
          if (
            !verificationLockerNumber
          ) {

            throw new Error(
              "Customer does not have a valid locker number."
            );

          }


          /*
            STEP 3:
            START VERIFICATION
          */
          const response =
            await api.post(
              "/verification/start",
              {
                customer_id:
                  Number(
                    verificationCustomerId
                  ),

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
            GET VERIFICATION ID
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
            SAVE SESSION
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


          localStorage.setItem(
            "verificationLockerId",
            String(
              verificationLockerNumber
            )
          );


          /*
            USE RESPONSE IMMEDIATELY
          */
          setVerificationData(
            response.data
          );


          /*
            FETCH COMPLETE SESSION
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
            Allow retry
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


      const loadingAction =
        documentMatch
          ? "document-pass"
          : "document-fail";


      try {

        setActionLoading(
          loadingAction
        );

        setApiError("");


        console.log(
          "Document verification request:",
          {
            verificationId,
            document_match:
              documentMatch,
          }
        );


        const response =
          await api.post(
            `/verification/${verificationId}/document`,
            {
              document_match:
                documentMatch,
            }
          );


        console.log(
          "Document verification response:",
          response.data
        );


        /*
          Update immediately.

          This is important because
          GET response may arrive slightly
          later than POST response.
        */
        setVerificationData(
          (previousData) => ({
            ...(previousData || {}),
            ...(response.data || {}),
            document_match:
              documentMatch,
          })
        );


        /*
          Get latest backend state
        */
        const latestData =
          await fetchVerification(
            verificationId
          );


        /*
          If backend GET does not expose
          document_match correctly,
          preserve the clicked result.
        */
        if (
          latestData &&
          getDocumentMatch(latestData) === null
        ) {

          setVerificationData(
            (previousData) => ({
              ...(previousData || {}),
              document_match:
                documentMatch,
            })
          );

        }


      } catch (error) {

        console.error(
          "Document verification failed:",
          error.response?.data ||
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to update document verification."
        );


      } finally {

        setActionLoading(
          null
        );

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


      const loadingAction =
        faceMatch
          ? "face-pass"
          : "face-fail";


      try {

        setActionLoading(
          loadingAction
        );

        setApiError("");


        console.log(
          "Face verification request:",
          {
            verificationId,
            face_match:
              faceMatch,
          }
        );


        const response =
          await api.post(
            `/verification/${verificationId}/face`,
            {
              face_match:
                faceMatch,
            }
          );


        console.log(
          "Face verification response:",
          response.data
        );


        /*
          Update immediately
        */
        setVerificationData(
          (previousData) => ({
            ...(previousData || {}),
            ...(response.data || {}),
            face_match:
              faceMatch,
          })
        );


        /*
          Fetch latest backend state
        */
        const latestData =
          await fetchVerification(
            verificationId
          );


        /*
          Preserve result if GET response
          does not return face_match.
        */
        if (
          latestData &&
          getFaceMatch(latestData) === null
        ) {

          setVerificationData(
            (previousData) => ({
              ...(previousData || {}),
              face_match:
                faceMatch,
            })
          );

        }


      } catch (error) {

        console.error(
          "Face verification failed:",
          error.response?.data ||
          error
        );


        setApiError(
          error.response?.data?.detail ||
          "Failed to update face verification."
        );


      } finally {

        setActionLoading(
          null
        );

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

        setActionLoading(
          "finalize"
        );

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


        const finalState =
          response.data.state ||
          response.data.status;


        if (finalState) {

          localStorage.setItem(
            "verificationDecision",
            finalState
          );

        }


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

        setActionLoading(
          null
        );

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

    const state =
      verificationData?.state ||
      verificationData?.status;


    if (
      state !== "APPROVED"
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
      verificationData?.state ||
      verificationData?.status;


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
    DOCUMENT STATUS
    =================================
  */
  const documentMatch =
    getDocumentMatch(
      verificationData
    );


  const documentStatus =

    documentMatch === true
      ? "Verified"

      : documentMatch === false
        ? "Failed"

        : "Pending";


  /*
    =================================
    FACE STATUS
    =================================
  */
  const faceMatch =
    getFaceMatch(
      verificationData
    );


  const faceStatus =

    faceMatch === true
      ? "Verified"

      : faceMatch === false
        ? "Failed"

        : "Pending";


  /*
    =================================
    COMPLETION STATUS
    =================================
  */
  const documentCompleted =

    documentMatch === true ||
    documentMatch === false;


  const faceCompleted =

    faceMatch === true ||
    faceMatch === false;


  const verificationState =
    verificationData?.state ||
    verificationData?.status;


  const verificationFinalized =

    verificationState === "APPROVED" ||
    verificationState === "BLOCKED" ||
    verificationState === "REVIEW";


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
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        documentStatus === "Verified"
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
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          handleDocumentVerification(
                            true
                          )
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          documentStatus === "Verified"
                            ? "bg-green-700 ring-2 ring-green-200"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >

                        {actionLoading ===
                        "document-pass" ? (

                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                        ) : (

                          <CircleCheck size={15} />

                        )}

                        {actionLoading ===
                        "document-pass"
                          ? "Saving..."
                          : "Mark Passed"}

                      </button>


                      <button
                        type="button"
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          handleDocumentVerification(
                            false
                          )
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          documentStatus === "Failed"
                            ? "bg-red-700 ring-2 ring-red-200"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >

                        {actionLoading ===
                        "document-fail" ? (

                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                        ) : (

                          <CircleX size={15} />

                        )}

                        {actionLoading ===
                        "document-fail"
                          ? "Saving..."
                          : "Mark Failed"}

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
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        faceStatus === "Verified"
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
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          handleFaceVerification(
                            true
                          )
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          faceStatus === "Verified"
                            ? "bg-green-700 ring-2 ring-green-200"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >

                        {actionLoading ===
                        "face-pass" ? (

                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                        ) : (

                          <CircleCheck size={15} />

                        )}

                        {actionLoading ===
                        "face-pass"
                          ? "Saving..."
                          : "Mark Passed"}

                      </button>


                      <button
                        type="button"
                        disabled={
                          actionLoading !== null
                        }
                        onClick={() =>
                          handleFaceVerification(
                            false
                          )
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          faceStatus === "Failed"
                            ? "bg-red-700 ring-2 ring-red-200"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >

                        {actionLoading ===
                        "face-fail" ? (

                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                        ) : (

                          <CircleX size={15} />

                        )}

                        {actionLoading ===
                        "face-fail"
                          ? "Saving..."
                          : "Mark Failed"}

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

                      {!documentCompleted ||
                      !faceCompleted
                        ? "Complete both document and face verification before finalizing."
                        : "Both verification checks are complete. You can now finalize the decision."}

                    </p>

                  </div>


                  <button
                    type="button"
                    disabled={
                      actionLoading !== null ||
                      verificationFinalized ||
                      !documentCompleted ||
                      !faceCompleted
                    }
                    onClick={
                      handleFinalizeVerification
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {actionLoading ===
                    "finalize" ? (

                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                    ) : (

                      <ShieldAlert size={17} />

                    )}

                    {verificationFinalized
                      ? "Verification Finalized"
                      : actionLoading === "finalize"
                        ? "Finalizing..."
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
                        verificationState ===
                        "APPROVED"
                          ? "text-green-600"
                          : verificationState ===
                            "BLOCKED"
                            ? "text-red-600"
                            : "text-amber-600"
                      }
                    >

                      {verificationState}

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
                    actionLoading !== null ||
                    verificationState !==
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