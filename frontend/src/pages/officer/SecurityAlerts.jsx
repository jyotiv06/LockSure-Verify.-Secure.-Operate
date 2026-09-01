import { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  X,
  Clock3,
  User,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";

const initialAlerts = [
  {
    id: 1,
    severity: "HIGH",
    title: "Multiple Failed Verification Attempts",
    description:
      "Multiple verification attempts were detected for the same customer.",
    customer: "Rahul Sharma",
    customerId: "CUS-10482",
    time: "10 minutes ago",
  },
  {
    id: 2,
    severity: "MEDIUM",
    title: "Unusual Locker Access Attempt",
    description:
      "An access request was initiated outside the customer's normal activity pattern.",
    customer: "Amit Patel",
    customerId: "CUS-10921",
    time: "25 minutes ago",
  },
  {
    id: 3,
    severity: "LOW",
    title: "Verification Timeout",
    description:
      "A verification session remained inactive for an extended period.",
    customer: "Priya Shah",
    customerId: "CUS-10344",
    time: "1 hour ago",
  },
  {
    id: 4,
    severity: "MEDIUM",
    title: "Repeated Locker Operation",
    description:
      "Multiple locker open requests were detected within a short period.",
    customer: "Neha Verma",
    customerId: "CUS-10876",
    time: "2 hours ago",
  },
];

function SecurityAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);

  const resolveAlert = (alert) => {
    setAlerts((previousAlerts) =>
      previousAlerts.filter(
        (item) => item.id !== alert.id
      )
    );

    setResolvedAlerts((previousAlerts) => [
      {
        ...alert,
        resolvedAt: "Just now",
      },
      ...previousAlerts,
    ]);
  };

  const dismissAlert = (alertId) => {
    setAlerts((previousAlerts) =>
      previousAlerts.filter(
        (alert) => alert.id !== alertId
      )
    );
  };

  const getAlertStyle = (severity) => {
    if (severity === "HIGH") {
      return {
        icon: ShieldAlert,
        badge: "bg-red-50 text-red-600 border-red-200",
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        border: "border-red-100",
      };
    }

    if (severity === "MEDIUM") {
      return {
        icon: AlertTriangle,
        badge:
          "bg-amber-50 text-amber-700 border-amber-200",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        border: "border-amber-100",
      };
    }

    return {
      icon: Info,
      badge:
        "bg-blue-50 text-blue-600 border-blue-200",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      border: "border-blue-100",
    };
  };

  const highAlerts = alerts.filter(
    (alert) => alert.severity === "HIGH"
  ).length;

  const mediumAlerts = alerts.filter(
    (alert) => alert.severity === "MEDIUM"
  ).length;

  const lowAlerts = alerts.filter(
    (alert) => alert.severity === "LOW"
  ).length;

  return (
    <OfficerLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Security Monitoring
        </p>

        <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
          Security Alerts
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Monitor and respond to suspicious verification and locker activity.
        </p>
      </div>

      {/* Alert Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* High */}
        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            High Priority
          </p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-red-500">
              {highAlerts}
            </p>

            <ShieldAlert
              size={25}
              className="text-red-500"
            />
          </div>
        </div>

        {/* Medium */}
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Medium Priority
          </p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-amber-500">
              {mediumAlerts}
            </p>

            <AlertTriangle
              size={25}
              className="text-amber-500"
            />
          </div>
        </div>

        {/* Low */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Low Priority
          </p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-blue-500">
              {lowAlerts}
            </p>

            <Info
              size={25}
              className="text-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Active Alerts
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Security events requiring officer attention.
            </p>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] px-3 py-1.5">
            <span className="text-xs font-semibold text-[#475569]">
              {alerts.length} Active
            </span>
          </div>
        </div>

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2
                size={28}
                className="text-green-500"
              />
            </div>

            <h3 className="mt-4 font-bold text-[#111827]">
              No Active Security Alerts
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              All current security events have been resolved.
            </p>
          </div>
        )}

        {/* Alert List */}
        <div className="mt-6 space-y-4">
          {alerts.map((alert) => {
            const style = getAlertStyle(
              alert.severity
            );

            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-xl border ${style.border} p-5 transition hover:shadow-sm`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  {/* Left */}
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
                    >
                      <Icon
                        size={20}
                        className={style.iconColor}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#111827]">
                          {alert.title}
                        </h3>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
                        {alert.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                        <div className="flex items-center gap-1.5">
                          <User size={14} />

                          {alert.customer}
                        </div>

                        <span>
                          {alert.customerId}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Clock3 size={14} />

                          {alert.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        resolveAlert(alert)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      <CheckCircle2 size={15} />

                      Resolve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dismissAlert(alert.id)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition hover:bg-red-50 hover:text-red-500"
                      title="Dismiss Alert"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#111827]">
            Recently Resolved
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Alerts resolved during this officer session.
          </p>

          <div className="mt-5 space-y-3">
            {resolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-3 rounded-xl border border-green-100 bg-green-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="text-green-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {alert.title}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {alert.customer} · {alert.customerId}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-medium text-green-600">
                  Resolved {alert.resolvedAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}

export default SecurityAlerts;