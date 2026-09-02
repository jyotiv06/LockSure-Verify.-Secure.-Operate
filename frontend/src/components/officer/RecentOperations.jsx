import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function RecentOperations() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/locker/operations`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch recent locker operations"
        );
      }

      const data = await response.json();

      const operationsData = Array.isArray(data)
        ? data
        : data.operations || [];

      setOperations(operationsData.slice(0, 5));
    } catch (error) {
      console.error(
        "Recent operations API error:",
        error
      );

      setError(
        error.message ||
        "Unable to load recent operations"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
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

  const formatOperation = (operationType) => {
    if (!operationType) {
      return "-";
    }

    return operationType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <p className="text-sm text-[#64748B]">
            Loading recent operations...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchOperations}
            className="mt-3 text-sm font-semibold text-[#2563EB]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
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

      {/* Table */}
      {!loading &&
        !error &&
        operations.length > 0 && (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                  <TableHeader>ID</TableHeader>
                  <TableHeader>Customer ID</TableHeader>
                  <TableHeader>Locker</TableHeader>
                  <TableHeader>Operation</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Time</TableHeader>

                </tr>
              </thead>

              <tbody>

                {operations.map((operation) => (
                  <tr
                    key={operation.operation_id}
                    className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                  >

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-[#475569]">
                        OP-{String(operation.operation_id).slice(0, 8)}                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-[#111827]">
                        {operation.customer_id
                          ? `Customer #${operation.customer_id}`
                          : "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-[#64748B]">
                        {operation.locker_id
                          ? `LKR-${operation.locker_id}`
                          : "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm text-[#475569]">
                        {formatOperation(
                          operation.operation_type
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={formatStatus(
                          operation.operation_status
                        )}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs text-[#64748B]">
                        {formatTime(
                          operation.operated_at
                        )}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

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
    Success: {
      icon: CheckCircle2,
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
    },

    Approved: {
      icon: CheckCircle2,
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
    },

    Pending: {
      icon: Clock3,
      classes:
        "bg-amber-50 text-amber-700 border-amber-100",
    },

    Failed: {
      icon: AlertTriangle,
      classes:
        "bg-red-50 text-red-700 border-red-100",
    },

    Rejected: {
      icon: AlertTriangle,
      classes:
        "bg-red-50 text-red-700 border-red-100",
    },

    Review: {
      icon: AlertTriangle,
      classes:
        "bg-red-50 text-red-700 border-red-100",
    },
  };

  const item = config[status] || config.Pending;
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

export default RecentOperations;