import { useState } from "react";
import OfficerLayout from "../../components/officer/OfficerLayout";

const initialAlerts = [
  {
    id: "ALT-001",
    customer: "Anisha Sharma",
    customerId: "CUST023",
    locker: "L-108",
    reason: "4 failed verification attempts",
    risk: "HIGH",
    time: "08:41 PM",
    status: "Active",
  },
  {
    id: "ALT-002",
    customer: "Priya Shah",
    customerId: "CUST108",
    locker: "L-102",
    reason: "Face match below recommended threshold",
    risk: "MEDIUM",
    time: "08:17 PM",
    status: "Under Review",
  },
  {
    id: "ALT-003",
    customer: "Amit Kumar",
    customerId: "CUST114",
    locker: "L-311",
    reason: "Multiple access attempts",
    risk: "MEDIUM",
    time: "07:54 PM",
    status: "Active",
  },
];

function SecurityAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleBlock = (alertId) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: "Blocked" }
          : alert
      )
    );

    setSelectedAlert(null);
  };

  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "Blocked"
  ).length;

  return (
    <OfficerLayout>

      {/* PAGE HEADER */}
      <div className="mb-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600">
              Security Monitoring
            </p>

            <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
              Security Alerts
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Review suspicious activity requiring officer attention.
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2">
            <span className="text-xs font-bold text-red-700">
              {activeAlerts} Active Alerts
            </span>
          </div>

        </div>

      </div>


      {/* ALERTS */}
      <div className="space-y-4">

        {alerts.map((alert) => (

          <div
            key={alert.id}
            className={`rounded-2xl border bg-white p-6 shadow-sm ${alert.risk === "HIGH"
              ? "border-red-200"
              : "border-[#E2E8F0]"
              }`}
          >

            {/* TOP SECTION */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex gap-4">

                {/* Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${alert.risk === "HIGH"
                    ? "bg-red-50"
                    : "bg-amber-50"
                    }`}
                >
                  {alert.risk === "HIGH" ? "🚨" : "⚠️"}
                </div>


                {/* Title */}
                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${alert.risk === "HIGH"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      {alert.risk} RISK
                    </span>

                    <span className="text-xs text-[#94A3B8]">
                      {alert.id}
                    </span>

                    {alert.status === "Blocked" && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        BLOCKED
                      </span>
                    )}

                  </div>

                  <h2 className="mt-2 text-base font-bold text-[#111827]">
                    Suspicious Verification Activity
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {alert.reason}
                  </p>

                </div>

              </div>


              {/* BUTTONS */}
              {alert.status !== "Blocked" && (
                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() => setSelectedAlert(alert)}
                    className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-semibold text-[#334155] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBlock(alert.id)}
                    className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600"
                  >
                    Block
                  </button>

                </div>
              )}

            </div>


            {/* DETAILS */}
            <div className="mt-5 grid gap-4 border-t border-[#E2E8F0] pt-5 sm:grid-cols-2 lg:grid-cols-4">

              <Detail
                label="Customer"
                value={`${alert.customer} (${alert.customerId})`}
              />

              <Detail
                label="Locker"
                value={alert.locker}
              />

              <Detail
                label="Reason"
                value={alert.reason}
              />

              <Detail
                label="Time"
                value={alert.time}
              />

            </div>

          </div>

        ))}

      </div>


      {/* REVIEW MODAL */}
      {selectedAlert && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  Security Review
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#111827]">
                  Suspicious Activity
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              >
                ✕
              </button>

            </div>


            {/* Modal Body */}
            <div className="space-y-5 p-6">

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">

                <p className="text-xs font-bold text-red-700">
                  🚨 HIGH RISK ACTIVITY
                </p>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  {selectedAlert.reason}
                </p>

              </div>


              <div className="grid grid-cols-2 gap-5">

                <Detail
                  label="Customer"
                  value={selectedAlert.customer}
                />

                <Detail
                  label="Customer ID"
                  value={selectedAlert.customerId}
                />

                <Detail
                  label="Locker"
                  value={selectedAlert.locker}
                />

                <Detail
                  label="Time"
                  value={selectedAlert.time}
                />

              </div>


              <div className="rounded-xl bg-[#F8FAFC] p-4">

                <p className="text-xs text-[#94A3B8]">
                  Recommended Action
                </p>

                <p className="mt-1 text-sm font-bold text-[#111827]">
                  Block locker operation and investigate customer identity.
                </p>

              </div>

            </div>


            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] p-6">

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="rounded-xl border border-[#CBD5E1] px-5 py-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleBlock(selectedAlert.id)}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
              >
                Block Customer
              </button>

            </div>

          </div>

        </div>

      )}

    </OfficerLayout>
  );
}


/* ========================= */
/* DETAIL COMPONENT           */
/* ========================= */

function Detail({ label, value }) {
  return (
    <div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-[#334155]">
        {value}
      </p>

    </div>
  );
}


export default SecurityAlerts;