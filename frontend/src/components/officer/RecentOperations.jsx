import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
  Lock,
  Unlock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";


function RecentOperations() {

  const navigate = useNavigate();


  // =====================================
  // STATE
  // =====================================

  const [operations, setOperations] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================
  // FETCH OPERATIONS
  // =====================================

  const fetchOperations = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get(
          "/locker/operations"
        );


      console.log(
        "RECENT OPERATIONS RESPONSE:",
        response.data
      );


      const data =
        response.data;


      /*
        Backend may return:

        [
          ...
        ]

        OR

        {
          operations: [...]
        }
      */

      const operationsData =
        Array.isArray(data)
          ? data
          : data?.operations || [];


      /*
        Sort latest first
      */

      const sortedOperations =
        [...operationsData].sort(
          (a, b) => {

            const firstDate =
              new Date(
                a.operated_at ||
                a.created_at ||
                a.timestamp ||
                0
              );


            const secondDate =
              new Date(
                b.operated_at ||
                b.created_at ||
                b.timestamp ||
                0
              );


            return (
              secondDate -
              firstDate
            );

          }
        );


      /*
        Dashboard shows
        only latest 5 operations
      */

      setOperations(
        sortedOperations.slice(
          0,
          5
        )
      );


    } catch (error) {

      console.error(
        "Recent operations API error:",
        error
      );


      setError(
        error.response?.data?.detail ||
        error.message ||
        "Unable to load recent operations."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {

    fetchOperations();

  }, []);


  // =====================================
  // FORMAT TIME
  // =====================================

  const formatTime =
    (dateTime) => {

      if (!dateTime) {

        return "-";

      }


      const date =
        new Date(
          dateTime
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateTime;

      }


      return date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    };


  // =====================================
  // FORMAT OPERATION
  // =====================================

  const formatOperation =
    (operationType) => {

      if (!operationType) {

        return "-";

      }


      return String(
        operationType
      )
        .toLowerCase()
        .replace(
          /_/g,
          " "
        )
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );

    };


  // =====================================
  // FORMAT STATUS
  // =====================================

  const formatStatus =
    (status) => {

      if (!status) {

        return "Pending";

      }


      return String(
        status
      )
        .toLowerCase()
        .replace(
          /_/g,
          " "
        )
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );

    };


  // =====================================
  // OPERATION ICON
  // =====================================

  const getOperationIcon =
    (operationType) => {

      const operation =
        String(
          operationType || ""
        ).toUpperCase();


      if (
        operation.includes(
          "OPEN"
        )
      ) {

        return Unlock;

      }


      if (
        operation.includes(
          "CLOSE"
        )
      ) {

        return Lock;

      }


      return Clock3;

    };


  // =====================================
  // UI
  // =====================================

  return (

    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">


      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">


        <div>

          <h3 className="text-base font-bold text-[#111827]">
            Recent Locker Operations
          </h3>


          <p className="mt-1 text-sm text-[#64748B]">
            Latest activity across the locker system.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/officer/history"
            )
          }
          className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >

          View all

          <ArrowRight
            size={15}
          />

        </button>


      </div>


      {/* LOADING */}

      {loading && (

        <div className="flex justify-center py-12">

          <p className="text-sm text-[#64748B]">
            Loading recent operations...
          </p>

        </div>

      )}


      {/* ERROR */}

      {!loading &&
        error && (

          <div className="px-6 py-12 text-center">


            <p className="text-sm text-red-500">
              {error}
            </p>


            <button
              type="button"
              onClick={
                fetchOperations
              }
              className="mt-3 text-sm font-semibold text-[#2563EB]"
            >

              Try again

            </button>


          </div>

        )}


      {/* EMPTY STATE */}

      {!loading &&
        !error &&
        operations.length === 0 && (

          <div className="px-6 py-12 text-center">


            <p className="font-semibold text-[#111827]">
              No locker operations found
            </p>


            <p className="mt-2 text-sm text-[#64748B]">
              Locker operations will appear here once
              customers start using the system.
            </p>


          </div>

        )}


      {/* OPERATIONS TABLE */}

      {!loading &&
        !error &&
        operations.length > 0 && (

          <div className="overflow-x-auto">


            <table className="w-full min-w-[700px]">


              <thead>

                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                  <TableHeader>
                    ID
                  </TableHeader>

                  <TableHeader>
                    Customer ID
                  </TableHeader>

                  <TableHeader>
                    Locker
                  </TableHeader>

                  <TableHeader>
                    Operation
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader>
                    Time
                  </TableHeader>

                </tr>

              </thead>


              <tbody>


                {operations.map(
                  (operation) => {


                    const OperationIcon =
                      getOperationIcon(
                        operation.operation_type
                      );


                    const operationId =
                      operation.operation_id ||
                      operation.id;


                    const customerId =
                      operation.customer_id ||
                      operation.customer?.customer_id;


                    const lockerId =
                      operation.locker_id ||
                      operation.locker?.locker_id;


                    const operationType =
                      operation.operation_type ||
                      operation.action;


                    const operationStatus =
                      operation.operation_status ||
                      operation.status;


                    const operationTime =
                      operation.operated_at ||
                      operation.created_at ||
                      operation.timestamp;


                    return (

                      <tr
                        key={
                          operationId ||
                          `${lockerId}-${operationTime}`
                        }
                        className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                      >


                        {/* OPERATION ID */}

                        <td className="px-6 py-4">

                          <span className="font-mono text-xs font-semibold text-[#475569]">

                            OP-
                            {operationId
                              ? String(
                                  operationId
                                ).slice(
                                  0,
                                  8
                                )
                              : "-"}

                          </span>

                        </td>


                        {/* CUSTOMER */}

                        <td className="px-4 py-4">

                          <span className="text-sm font-semibold text-[#111827]">

                            {customerId
                              ? `Customer #${customerId}`
                              : "-"}

                          </span>

                        </td>


                        {/* LOCKER */}

                        <td className="px-4 py-4">

                          <span className="font-mono text-xs text-[#64748B]">

                            {lockerId
                              ? `LKR-${lockerId}`
                              : "-"}

                          </span>

                        </td>


                        {/* OPERATION */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <OperationIcon
                              size={15}
                              className="text-[#2563EB]"
                            />


                            <span className="text-sm text-[#475569]">

                              {formatOperation(
                                operationType
                              )}

                            </span>

                          </div>

                        </td>


                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <StatusBadge
                            status={
                              formatStatus(
                                operationStatus
                              )
                            }
                          />

                        </td>


                        {/* TIME */}

                        <td className="px-4 py-4">

                          <span className="text-xs text-[#64748B]">

                            {formatTime(
                              operationTime
                            )}

                          </span>

                        </td>


                      </tr>

                    );

                  }
                )}


              </tbody>


            </table>


          </div>

        )}


    </div>

  );

}


// =====================================
// TABLE HEADER
// =====================================

function TableHeader({
  children,
}) {

  return (

    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">

      {children}

    </th>

  );

}


// =====================================
// STATUS BADGE
// =====================================

function StatusBadge({
  status,
}) {

  const normalizedStatus =
    String(
      status || ""
    ).toUpperCase();


  let Icon =
    Clock3;

  let classes =
    "bg-amber-50 text-amber-700 border-amber-100";


  // SUCCESS / COMPLETED

  if (

    normalizedStatus ===
      "SUCCESS" ||

    normalizedStatus ===
      "SUCCESSFUL" ||

    normalizedStatus ===
      "COMPLETED" ||

    normalizedStatus ===
      "APPROVED"

  ) {

    Icon =
      CheckCircle2;

    classes =
      "bg-emerald-50 text-emerald-700 border-emerald-100";

  }


  // FAILED / BLOCKED

  else if (

    normalizedStatus ===
      "FAILED" ||

    normalizedStatus ===
      "REJECTED" ||

    normalizedStatus ===
      "BLOCKED" ||

    normalizedStatus ===
      "ERROR"

  ) {

    Icon =
      AlertTriangle;

    classes =
      "bg-red-50 text-red-700 border-red-100";

  }


  // REVIEW

  else if (

    normalizedStatus ===
    "REVIEW"

  ) {

    Icon =
      AlertTriangle;

    classes =
      "bg-orange-50 text-orange-700 border-orange-100";

  }


  return (

    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${classes}`}
    >

      <Icon
        size={13}
      />

      {status}

    </span>

  );

}


export default RecentOperations;