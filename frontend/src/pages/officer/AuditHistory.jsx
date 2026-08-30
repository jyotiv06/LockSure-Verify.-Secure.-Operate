import { useState } from "react";

import OfficerLayout from "../../components/officer/OfficerLayout";
import { auditLogs } from "../../data/officerMockData";

function AuditHistory() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter =
      filter === "All" || log.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      log.customer.toLowerCase().includes(searchText) ||
      log.customerId.toLowerCase().includes(searchText) ||
      log.locker.toLowerCase().includes(searchText) ||
      log.action.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <OfficerLayout>

      {/* Header */}
      <div className="mb-6">

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          System Records
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Audit History
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Complete record of officer actions and locker operations.
        </p>

      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

        {/* Controls */}
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Filters */}
          <div className="flex flex-wrap gap-2">

            {["All", "Approved", "Review", "Blocked"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  filter === item
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

          {/* Search */}
          <div className="w-full lg:w-72">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit records..."
              className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-xs outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
            />

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                <HeaderCell>Time</HeaderCell>
                <HeaderCell>Customer</HeaderCell>
                <HeaderCell>Locker</HeaderCell>
                <HeaderCell>Action</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Officer</HeaderCell>

              </tr>

            </thead>

            <tbody>

              {filteredLogs.map((log) => (

                <tr
                  key={log.id}
                  className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                >

                  {/* Time */}
                  <td className="px-5 py-4">

                    <span className="text-xs text-[#64748B]">
                      {log.time}
                    </span>

                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">

                    <p className="text-sm font-semibold text-[#111827]">
                      {log.customer}
                    </p>

                    <p className="mt-0.5 font-mono text-[10px] text-[#94A3B8]">
                      {log.customerId}
                    </p>

                  </td>

                  {/* Locker */}
                  <td className="px-5 py-4">

                    <span className="font-mono text-xs font-semibold text-[#475569]">
                      {log.locker}
                    </span>

                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">

                    <span className="text-xs font-medium text-[#475569]">
                      {log.action}
                    </span>

                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    <StatusBadge status={log.status} />

                  </td>

                  {/* Officer */}
                  <td className="px-5 py-4">

                    <span className="font-mono text-xs text-[#64748B]">
                      {log.officer}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (

          <div className="p-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-xl">
              📋
            </div>

            <p className="mt-3 text-sm font-semibold text-[#475569]">
              No audit records found
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Try changing the filter or search term.
            </p>

          </div>

        )}

      </div>

    </OfficerLayout>
  );
}


/* ========================= */
/* Table Header               */
/* ========================= */

function HeaderCell({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
      {children}
    </th>
  );
}


/* ========================= */
/* Status Badge               */
/* ========================= */

function StatusBadge({ status }) {

  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
        <span>✓</span>
        Approved
      </span>
    );
  }

  if (status === "Blocked") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
        <span>✕</span>
        Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
      <span>◷</span>
      Review
    </span>
  );
}

export default AuditHistory;