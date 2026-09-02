import { useEffect, useState } from "react";

import OfficerLayout from "../../components/officer/OfficerLayout";


const API_URL = "http://127.0.0.1:8000";


function AuditHistory() {

  const [filter, setFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [operations, setOperations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
    =====================================
    FETCH ALL LOCKER OPERATIONS
    =====================================
  */

  const fetchOperations =
    async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            `${API_URL}/locker/operations`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch locker operations."
          );

        }


        const data =
          await response.json();


        /*
          Support both possible responses:

          []

          OR

          {
            operations: []
          }
        */

        const operationsData =
          Array.isArray(data)
            ? data
            : data.operations || [];


        setOperations(
          operationsData
        );


      } catch (error) {

        console.error(
          "Audit history API error:",
          error
        );


        setError(
          error.message ||
          "Unable to load audit history."
        );


      } finally {

        setLoading(false);

      }

    };


  /*
    =====================================
    LOAD DATA
    =====================================
  */

  useEffect(() => {

    fetchOperations();

  }, []);


  /*
    =====================================
    FORMAT OPERATION
    =====================================
  */

  const formatOperation =
    (operationType) => {

      if (!operationType) {
        return "-";
      }


      return operationType
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );

    };


  /*
    =====================================
    FORMAT STATUS
    =====================================
  */

  const formatStatus =
    (status) => {

      if (!status) {
        return "Pending";
      }


      return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );

    };


  /*
    =====================================
    FORMAT DATE + TIME
    =====================================
  */

  const formatDateTime =
    (dateTime) => {

      if (!dateTime) {
        return "-";
      }


      const date =
        new Date(dateTime);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateTime;

      }


      return date.toLocaleString(
        [],
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    };


  /*
    =====================================
    FILTER + SEARCH
    =====================================
  */

  const filteredOperations =
    operations.filter(
      (operation) => {

        const status =
          formatStatus(
            operation.operation_status
          );


        /*
          FILTER
        */

        const matchesFilter =

          filter === "All" ||

          status.toLowerCase() ===
          filter.toLowerCase();


        /*
          SEARCH
        */

        const searchText =
          search.toLowerCase();


        const operationId =
          String(
            operation.operation_id ||
            ""
          ).toLowerCase();


        const customerId =
          String(
            operation.customer_id ||
            ""
          ).toLowerCase();


        const lockerId =
          String(
            operation.locker_id ||
            ""
          ).toLowerCase();


        const operationType =
          formatOperation(
            operation.operation_type
          ).toLowerCase();


        const matchesSearch =

          operationId.includes(
            searchText
          ) ||

          customerId.includes(
            searchText
          ) ||

          lockerId.includes(
            searchText
          ) ||

          operationType.includes(
            searchText
          );


        return (

          matchesFilter &&
          matchesSearch

        );

      }
    );


  return (

    <OfficerLayout>


      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="mb-6">

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          System Records
        </p>


        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Audit History
        </h1>


        <p className="mt-2 text-sm text-[#64748B]">
          Complete record of locker operations.
        </p>

      </div>


      {/* ========================= */}
      {/* MAIN CARD */}
      {/* ========================= */}

      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">


        {/* CONTROLS */}

        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 lg:flex-row lg:items-center lg:justify-between">


          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Success",
              "Pending",
              "Failed",
            ].map(
              (item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    filter === item
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  }`}
                >

                  {item}

                </button>

              )
            )}

          </div>


          {/* SEARCH */}

          <div className="w-full lg:w-72">

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search operations..."
              className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-xs outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
            />

          </div>

        </div>


        {/* ========================= */}
        {/* LOADING */}
        {/* ========================= */}

        {loading && (

          <div className="flex justify-center py-16">

            <p className="text-sm text-[#64748B]">
              Loading audit history...
            </p>

          </div>

        )}


        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {!loading &&
          error && (

            <div className="p-12 text-center">

              <p className="text-sm font-semibold text-red-600">

                {error}

              </p>


              <button
                type="button"
                onClick={
                  fetchOperations
                }
                className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white"
              >

                Try Again

              </button>

            </div>

          )}


        {/* ========================= */}
        {/* TABLE */}
        {/* ========================= */}

        {!loading &&
          !error &&
          filteredOperations.length > 0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">


                <thead>

                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                    <HeaderCell>
                      Time
                    </HeaderCell>

                    <HeaderCell>
                      Operation ID
                    </HeaderCell>

                    <HeaderCell>
                      Customer
                    </HeaderCell>

                    <HeaderCell>
                      Locker
                    </HeaderCell>

                    <HeaderCell>
                      Action
                    </HeaderCell>

                    <HeaderCell>
                      Status
                    </HeaderCell>

                  </tr>

                </thead>


                <tbody>

                  {filteredOperations.map(
                    (operation) => (

                      <tr
                        key={
                          operation.operation_id
                        }
                        className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                      >


                        {/* TIME */}

                        <td className="px-5 py-4">

                          <span className="text-xs text-[#64748B]">

                            {formatDateTime(
                              operation.operated_at
                            )}

                          </span>

                        </td>


                        {/* OPERATION ID */}

                        <td className="px-5 py-4">

                          <span className="font-mono text-xs font-semibold text-[#475569]">

                            OP-
                            {String(
                              operation.operation_id
                            ).slice(
                              0,
                              8
                            )}

                          </span>

                        </td>


                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <span className="text-sm font-semibold text-[#111827]">

                            {operation.customer_id
                              ? `Customer #${operation.customer_id}`
                              : "-"}

                          </span>

                        </td>


                        {/* LOCKER */}

                        <td className="px-5 py-4">

                          <span className="font-mono text-xs font-semibold text-[#475569]">

                            {operation.locker_id
                              ? `LKR-${operation.locker_id}`
                              : "-"}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <span className="text-xs font-medium text-[#475569]">

                            {formatOperation(
                              operation.operation_type
                            )}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            status={
                              formatStatus(
                                operation.operation_status
                              )
                            }
                          />

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


        {/* ========================= */}
        {/* EMPTY STATE */}
        {/* ========================= */}

        {!loading &&
          !error &&
          filteredOperations.length ===
          0 && (

            <div className="p-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-xl">
                📋
              </div>


              <p className="mt-3 text-sm font-semibold text-[#475569]">
                No operations found
              </p>


              <p className="mt-1 text-xs text-[#94A3B8]">

                Try changing the filter or
                search term.

              </p>

            </div>

          )}

      </div>

    </OfficerLayout>

  );

}


/* ========================= */
/* TABLE HEADER */
/* ========================= */

function HeaderCell({
  children
}) {

  return (

    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">

      {children}

    </th>

  );

}


/* ========================= */
/* STATUS BADGE */
/* ========================= */

function StatusBadge({
  status
}) {

  const config = {

    Success: {
      symbol: "✓",
      classes:
        "bg-emerald-50 text-emerald-700",
    },

    Pending: {
      symbol: "◷",
      classes:
        "bg-amber-50 text-amber-700",
    },

    Failed: {
      symbol: "✕",
      classes:
        "bg-red-50 text-red-700",
    },

  };


  const item =
    config[status] ||
    config.Pending;


  return (

    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.classes}`}
    >

      <span>
        {item.symbol}
      </span>

      {status}

    </span>

  );

}


export default AuditHistory;