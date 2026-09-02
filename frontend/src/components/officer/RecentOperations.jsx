import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";

const operations = [
  {
    id: "OP-20941",
    customer: "Rahul Sharma",
    locker: "LKR-204",
    operation: "Open Locker",
    status: "Approved",
    risk: "Low",
    time: "08:42 PM",
  },
  {
    id: "OP-20940",
    customer: "Priya Shah",
    locker: "LKR-102",
    operation: "Open Locker",
    status: "Pending",
    risk: "Medium",
    time: "08:37 PM",
  },
  {
    id: "OP-20939",
    customer: "Amit Kumar",
    locker: "LKR-311",
    operation: "Open Locker",
    status: "Review",
    risk: "High",
    time: "08:29 PM",
  },
  {
    id: "OP-20938",
    customer: "Neha Patil",
    locker: "LKR-087",
    operation: "Close Locker",
    status: "Approved",
    risk: "Low",
    time: "08:18 PM",
  },
];

function RecentOperations() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">

        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Recent Locker Operations
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Latest activity across the locker system.
          </p>
        </div>

        <a
          href="/officer/history"
          className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          View all
          <ArrowRight size={15} />
        </a>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[800px]">

          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

              <TableHeader>ID</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Locker</TableHeader>
              <TableHeader>Operation</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Risk</TableHeader>
              <TableHeader>Time</TableHeader>

            </tr>
          </thead>

          <tbody>

            {operations.map((operation) => (
              <tr
                key={operation.id}
                className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
              >

                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-semibold text-[#475569]">
                    {operation.id}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-[#111827]">
                    {operation.customer}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="font-mono text-xs text-[#64748B]">
                    {operation.locker}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="text-sm text-[#475569]">
                    {operation.operation}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={operation.status} />
                </td>

                <td className="px-4 py-4">
                  <RiskBadge risk={operation.risk} />
                </td>

                <td className="px-4 py-4">
                  <span className="text-xs text-[#64748B]">
                    {operation.time}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const config = {
    Approved: {
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    Pending: {
      icon: Clock3,
      classes: "bg-amber-50 text-amber-700 border-amber-100",
    },
    Review: {
      icon: AlertTriangle,
      classes: "bg-red-50 text-red-700 border-red-100",
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.classes}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function RiskBadge({ risk }) {
  const classes = {
    Low: "bg-emerald-50 text-emerald-700",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[risk]}`}
    >
      {risk}
    </span>
  );
}

export default RecentOperations;