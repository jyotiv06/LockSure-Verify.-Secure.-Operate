import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  ArrowLeft,
  Lock,
  Unlock,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  Power,
  AlertTriangle,
  Search,
  Loader2,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";
import api from "../../services/api";


function LockerOperations() {
  const navigate = useNavigate();
  const location = useLocation();


  // =====================================
  // STATES
  // =====================================

  const [lockerOpen, setLockerOpen] =
    useState(false);

  const [operationMessage, setOperationMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [statusLoading, setStatusLoading] =
    useState(false);


  // =====================================
  // DATA RECEIVED FROM
  // CUSTOMER VERIFICATION PAGE
  // =====================================

  const operationData =
    location.state || {};

  const customer =
    operationData.customer || {};

  const verificationId =
    operationData.verificationId ||
    operationData.verification_id ||
    null;


  // =====================================
  // CUSTOMER DATA
  // =====================================

  const customerName =
    customer.full_name ||
    customer.customer_name ||
    customer.name ||
    "Customer Not Available";


  const customerId =
    customer.customer_id ||
    customer.id ||
    null;


  // =====================================
  // LOCKER DATA
  //
  // locker_id:
  // Database numeric ID
  // Used for backend API calls.
  //
  // locker_number:
  // Business/display value
  // Used only in UI.
  // =====================================

  const lockerId =
    customer.locker_id ||
    operationData.lockerId ||
    operationData.locker_id ||
    null;


  const lockerNumber =
    customer.locker_number ||
    operationData.locker_number ||
    "No locker assigned";


  const branchName =
    customer.branch_name ||
    customer.branch ||
    "Branch Not Available";


  const lockerLocation =
    customer.locker_location ||
    customer.location ||
    "Location Not Available";


  // =====================================
  // VALIDATE OPERATION DATA
  // =====================================

  const hasOperationData =
    customerId !== null &&
    customerId !== undefined &&
    lockerId !== null &&
    lockerId !== undefined &&
    verificationId;


  // =====================================
  // FETCH CURRENT LOCKER STATUS
  // =====================================

  const fetchLockerStatus =
    useCallback(async () => {

      if (
        lockerId === null ||
        lockerId === undefined
      ) {
        return;
      }


      try {

        setStatusLoading(true);


        const response =
          await api.get(
            `/locker/${Number(
              lockerId
            )}/status`
          );


        console.log(
          "LOCKER STATUS RESPONSE:",
          response.data
        );


        const status =
          response.data?.locker_status ||
          response.data?.status ||
          "";


        setLockerOpen(
          String(
            status
          ).toUpperCase() === "OPEN"
        );


      } catch (error) {

        console.error(
          "FAILED TO FETCH LOCKER STATUS:",
          error.response?.data ||
          error
        );


        setErrorMessage(
          error.response?.data?.detail ||
          "Failed to fetch current locker status."
        );


      } finally {

        setStatusLoading(false);

      }


    }, [lockerId]);


  // =====================================
  // INITIAL STATUS + AUTO REFRESH
  // =====================================

  useEffect(() => {

    if (
      lockerId === null ||
      lockerId === undefined
    ) {
      return;
    }


    fetchLockerStatus();


    // Refresh backend status every 5 seconds

    const interval =
      setInterval(
        fetchLockerStatus,
        5000
      );


    return () => {

      clearInterval(
        interval
      );

    };


  }, [
    lockerId,
    fetchLockerStatus
  ]);


  // =====================================
  // OPEN LOCKER
  // =====================================

  const handleOpenLocker =
    async () => {

      setErrorMessage("");
      setOperationMessage("");


      if (!hasOperationData) {

        setErrorMessage(
          "Customer, locker, or verification information is missing. Please start from Customer Verification."
        );

        return;

      }


      console.log(
        "OPEN LOCKER REQUEST:",
        {
          customer_id:
            Number(customerId),

          locker_id:
            Number(lockerId),

          verification_id:
            String(verificationId),

          officer_id:
            1,
        }
      );


      try {

        setLoading(true);


        const response =
          await api.post(
            `/locker/${Number(
              lockerId
            )}/open`,
            {
              customer_id:
                Number(customerId),

              verification_id:
                String(
                  verificationId
                ),

              officer_id:
                1,
            }
          );


        console.log(
          "OPEN LOCKER RESPONSE:",
          response.data
        );


        setOperationMessage(
          response.data?.message ||
          "Locker opened successfully."
        );


        // Fetch actual backend status

        await fetchLockerStatus();


      } catch (error) {

        console.error(
          "FAILED TO OPEN LOCKER:",
          error.response?.data ||
          error
        );


        const detail =
          error.response?.data?.detail;


        setErrorMessage(

          Array.isArray(
            detail
          )

            ? detail
              .map(
                (item) =>
                  item.msg
              )
              .join(", ")

            : detail ||
              error.message ||
              "Failed to open locker."

        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================
  // CLOSE LOCKER
  // =====================================

  const handleCloseLocker =
    async () => {

      setErrorMessage("");
      setOperationMessage("");


      if (!hasOperationData) {

        setErrorMessage(
          "Customer, locker, or verification information is missing. Please start from Customer Verification."
        );

        return;

      }


      console.log(
        "CLOSE LOCKER REQUEST:",
        {
          customer_id:
            Number(customerId),

          locker_id:
            Number(lockerId),

          verification_id:
            String(verificationId),

          officer_id:
            1,
        }
      );


      try {

        setLoading(true);


        const response =
          await api.post(
            `/locker/${Number(
              lockerId
            )}/close`,
            {
              customer_id:
                Number(customerId),

              verification_id:
                String(
                  verificationId
                ),

              officer_id:
                1,
            }
          );


        console.log(
          "CLOSE LOCKER RESPONSE:",
          response.data
        );


        setOperationMessage(
          response.data?.message ||
          "Locker closed successfully."
        );


        // Fetch actual backend status

        await fetchLockerStatus();


      } catch (error) {

        console.error(
          "FAILED TO CLOSE LOCKER:",
          error.response?.data ||
          error
        );


        const detail =
          error.response?.data?.detail;


        setErrorMessage(

          Array.isArray(
            detail
          )

            ? detail
              .map(
                (item) =>
                  item.msg
              )
              .join(", ")

            : detail ||
              error.message ||
              "Failed to close locker."

        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================
  // END OPERATION
  // =====================================

  const handleEndOperation =
    () => {

      navigate(
        "/officer/dashboard"
      );

    };


  // =====================================
  // DIRECT ACCESS WITHOUT
  // CUSTOMER VERIFICATION
  // =====================================

  if (!hasOperationData) {

    return (

      <OfficerLayout>


        <div className="mb-6">

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">

            Locker Control

          </p>


          <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">

            Locker Operations

          </h1>


          <p className="mt-2 text-sm text-[#64748B]">

            Select a verified customer before starting a locker operation.

          </p>

        </div>


        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">


          <div className="mx-auto flex max-w-lg flex-col items-center text-center">


            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">

              <AlertTriangle
                size={32}
                className="text-amber-500"
              />

            </div>


            <h2 className="mt-5 text-xl font-bold text-[#111827]">

              No Active Customer Operation

            </h2>


            <p className="mt-3 text-sm leading-6 text-[#64748B]">

              Locker operations require an approved customer verification.
              Search for a customer, complete verification,
              and then continue to the assigned locker.

            </p>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/officer/customers"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >

              <Search size={17} />

              Search Customer

            </button>


          </div>


        </div>


      </OfficerLayout>

    );

  }


  // =====================================
  // MAIN PAGE
  // =====================================

  return (

    <OfficerLayout>


      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          navigate(-1)
        }
        className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#64748B] transition hover:text-[#2563EB]"
      >

        <ArrowLeft size={16} />

        Back

      </button>


      {/* HEADER */}

      <div className="mb-6">


        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">

          Locker Control

        </p>


        <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">

          Locker Operations

        </h1>


        <p className="mt-2 text-sm text-[#64748B]">

          Monitor and control the customer's assigned locker.

        </p>


      </div>


      {/* SUCCESS */}

      {operationMessage && (

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

          <ShieldCheck size={18} />

          {operationMessage}

        </div>

      )}


      {/* ERROR */}

      {errorMessage && (

        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

          {errorMessage}

        </div>

      )}


      {/* MAIN GRID */}

      <div className="grid gap-6 lg:grid-cols-3">


        {/* STATUS CARD */}

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm lg:col-span-2">


          <div className="flex flex-col items-center justify-center py-10 text-center">


            <div
              className={`flex h-28 w-28 items-center justify-center rounded-3xl ${
                lockerOpen
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >

              {lockerOpen ? (

                <Unlock
                  size={52}
                  className="text-green-600"
                />

              ) : (

                <Lock
                  size={52}
                  className="text-red-500"
                />

              )}

            </div>


            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#64748B]">

              Current Locker Status

            </p>


            <h2
              className={`mt-2 text-3xl font-bold ${
                lockerOpen
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >

              {statusLoading
                ? "CHECKING..."
                : lockerOpen
                  ? "OPEN"
                  : "LOCKED"}

            </h2>


            <p className="mt-3 max-w-md text-sm text-[#64748B]">

              {statusLoading
                ? "Fetching the latest locker status from the backend..."
                : lockerOpen
                  ? "The locker is currently open and ready for customer access."
                  : "The locker is securely locked and no access is currently active."
              }

            </p>


            {/* CONTROLS */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">


              {!lockerOpen ? (

                <button
                  type="button"
                  onClick={
                    handleOpenLocker
                  }
                  disabled={
                    loading ||
                    statusLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                  ) : (

                    <Unlock
                      size={17}
                    />

                  )}

                  {loading
                    ? "Opening..."
                    : "Open Locker"}

                </button>

              ) : (

                <button
                  type="button"
                  onClick={
                    handleCloseLocker
                  }
                  disabled={
                    loading ||
                    statusLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                  ) : (

                    <Lock
                      size={17}
                    />

                  )}

                  {loading
                    ? "Closing..."
                    : "Close Locker"}

                </button>

              )}


              <button
                type="button"
                onClick={
                  handleEndOperation
                }
                disabled={
                  loading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-6 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
              >

                <Power size={17} />

                End Operation

              </button>


            </div>


          </div>


        </div>


        {/* INFORMATION */}

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">


          <h3 className="text-base font-bold text-[#111827]">

            Locker Information

          </h3>


          <p className="mt-1 text-sm text-[#64748B]">

            Active operation details.

          </p>


          <div className="mt-6 space-y-5">


            {/* CUSTOMER */}

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">

                <User
                  size={17}
                  className="text-[#2563EB]"
                />

              </div>


              <div>

                <p className="text-xs text-[#94A3B8]">

                  Customer

                </p>


                <p className="mt-1 text-sm font-semibold text-[#111827]">

                  {customerName}

                </p>


                <p className="mt-1 text-xs text-[#64748B]">

                  Customer #{customerId}

                </p>


              </div>


            </div>


            {/* LOCKER */}

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">

                <Lock
                  size={17}
                  className="text-[#2563EB]"
                />

              </div>


              <div>

                <p className="text-xs text-[#94A3B8]">

                  Locker Number

                </p>


                <p className="mt-1 text-sm font-semibold text-[#111827]">

                  {lockerNumber}

                </p>


                <p className="mt-1 text-xs text-[#64748B]">

                  Database Locker ID: {lockerId}

                </p>


              </div>


            </div>


            {/* BRANCH */}

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">

                <Building2
                  size={17}
                  className="text-[#2563EB]"
                />

              </div>


              <div>

                <p className="text-xs text-[#94A3B8]">

                  Branch

                </p>


                <p className="mt-1 text-sm font-semibold text-[#111827]">

                  {branchName}

                </p>


              </div>


            </div>


            {/* LOCATION */}

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">

                <MapPin
                  size={17}
                  className="text-[#2563EB]"
                />

              </div>


              <div>

                <p className="text-xs text-[#94A3B8]">

                  Locker Location

                </p>


                <p className="mt-1 text-sm font-semibold text-[#111827]">

                  {lockerLocation}

                </p>


              </div>


            </div>


          </div>


          {/* SECURITY */}

          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">


            <div className="flex items-center gap-2">

              <ShieldCheck
                size={17}
                className="text-green-600"
              />


              <span className="text-sm font-semibold text-green-700">

                Verification Approved

              </span>


            </div>


            <p className="mt-2 text-xs leading-5 text-green-700">

              Customer verification has been approved.
              Locker access is authorized for this operation.

            </p>


          </div>


        </div>


      </div>


      {/* FOOTER NOTE */}

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">

        <p className="text-xs leading-5 text-[#64748B]">

          Locker status is automatically refreshed from the backend every
          5 seconds. Open and close operations are also verified against
          the latest backend status.

        </p>

      </div>


    </OfficerLayout>

  );

}


export default LockerOperations;