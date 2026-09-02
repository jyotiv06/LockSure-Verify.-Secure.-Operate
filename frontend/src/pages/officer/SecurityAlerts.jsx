import { useEffect, useState } from "react";

import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  RefreshCw,
  Clock3,
  User,
  LockKeyhole,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";

const API_URL = "http://127.0.0.1:8000";

function SecurityAlert() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/security-alerts/`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch security alerts"
        );
      }

      const data = await response.json();

      console.log(
        "SECURITY ALERT RESPONSE:",
        data
      );

      const alertsData = Array.isArray(data)
        ? data
        : data.alerts || [];

      setAlerts(alertsData);

    } catch (error) {
      console.error(
        "Security alerts API error:",
        error
      );

      setError(
        error.message ||
        "Unable to load security alerts"
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

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const getSeverityConfig = (severity) => {
    const level = String(
      severity || ""
    ).toUpperCase();

    if (level === "HIGH") {
      return {
        label: "High Risk",
        classes:
          "bg-red-50 text-red-700 border-red-200",
        icon: AlertTriangle,
      };
    }

    if (level === "MEDIUM") {
      return {
        label: "Medium Risk",
        classes:
          "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Low Risk",
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldAlert,
    };
  };


  return (
    <OfficerLayout>

      {/* HEADER */}

      <div className="mb-7">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
              Security Monitoring
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Security Alerts
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              Monitor high and medium risk verification activity.
            </p>

          </div>


          <button
            type="button"
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <SummaryCard
          title="Total Alerts"
          value={loading ? "..." : alerts.length}
          description="Active risk alerts"
          icon={ShieldAlert}
          variant="blue"
        />

        <SummaryCard
          title="High Risk"
          value={
            loading
              ? "..."
              : alerts.filter(
                  (alert) =>
                    String(
                      alert.severity || ""
                    ).toUpperCase() === "HIGH"
                ).length
          }
          description="Requires immediate action"
          icon={AlertTriangle}
          variant="red"
        />

        <SummaryCard
          title="Under Review"
          value={
            loading
              ? "..."
              : alerts.filter(
                  (alert) =>
                    String(
                      alert.recommended_action || ""
                    ).toUpperCase() === "REVIEW"
                ).length
          }
          description="Requires officer review"
          icon={Eye}
          variant="amber"
        />

      </div>


      {/* ALERT TABLE */}

      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">


        {/* TABLE HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-[#E2E8F0] px-6 py-5 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-base font-bold text-[#111827]">
              Active Security Alerts
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Risk events detected during verification.
            </p>

          </div>

          {!loading && (
            <div className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#64748B]">

              {alerts.length} alerts

            </div>
          )}

        </div>


        {/* LOADING */}

        {loading && (

          <div className="flex flex-col items-center justify-center py-16">

            <RefreshCw
              size={24}
              className="animate-spin text-[#2563EB]"
            />

            <p className="mt-3 text-sm text-[#64748B]">
              Loading security alerts...
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="px-6 py-16 text-center">

            <AlertTriangle
              size={32}
              className="mx-auto text-red-500"
            />

            <p className="mt-4 font-semibold text-[#111827]">
              Unable to load security alerts
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAlerts}
              className="mt-5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          alerts.length === 0 && (

            <div className="px-6 py-16 text-center">

              <ShieldAlert
                size={36}
                className="mx-auto text-[#94A3B8]"
              />

              <p className="mt-4 font-semibold text-[#111827]">
                No security alerts
              </p>

              <p className="mt-2 text-sm text-[#64748B]">
                No high or medium risk verification
                activity has been detected.
              </p>

            </div>

          )}


        {/* TABLE */}

        {!loading &&
          !error &&
          alerts.length > 0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>

                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                    <TableHeader>
                      Alert ID
                    </TableHeader>

                    <TableHeader>
                      Customer
                    </TableHeader>

                    <TableHeader>
                      Locker
                    </TableHeader>

                    <TableHeader>
                      Incident
                    </TableHeader>

                    <TableHeader>
                      Severity
                    </TableHeader>

                    <TableHeader>
                      Recommended Action
                    </TableHeader>

                    <TableHeader>
                      Time
                    </TableHeader>

                  </tr>

                </thead>


                <tbody>

                  {alerts.map((alert) => {

                    const severity =
                      getSeverityConfig(
                        alert.severity
                      );

                    const SeverityIcon =
                      severity.icon;

                    return (

                      <tr
                        key={
                          alert.alert_id ||
                          alert.verification_id
                        }
                        className="border-b border-[#F1F5F9] transition hover:bg-[#F8FAFC]"
                      >


                        {/* ALERT ID */}

                        <td className="px-6 py-4">

                          <span className="font-mono text-xs font-semibold text-[#475569]">

                            {alert.alert_id || "-"}

                          </span>

                        </td>


                        {/* CUSTOMER */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">

                              <User
                                size={15}
                                className="text-[#2563EB]"
                              />

                            </div>

                            <div>

                              <p className="text-sm font-semibold text-[#111827]">

                                {alert.customer_name ||
                                  "Unknown Customer"}

                              </p>

                              <p className="text-xs text-[#64748B]">

                                Customer #
                                {alert.customer_id || "-"}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* LOCKER */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <LockKeyhole
                              size={15}
                              className="text-[#64748B]"
                            />

                            <div>

                              <p className="font-mono text-xs font-semibold text-[#475569]">

                                {alert.locker_number
                                  ? alert.locker_number
                                  : alert.locker_id
                                  ? `LKR-${alert.locker_id}`
                                  : "-"}

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* INCIDENT */}

                        <td className="px-4 py-4">

                          <p className="max-w-[260px] text-sm text-[#475569]">

                            {alert.incident_reason || "-"}

                          </p>

                        </td>


                        {/* SEVERITY */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${severity.classes}`}
                          >

                            <SeverityIcon
                              size={13}
                            />

                            {severity.label}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td className="px-4 py-4">

                          <ActionBadge
                            action={
                              alert.recommended_action
                            }
                          />

                        </td>


                        {/* TIME */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">

                            <Clock3 size={13} />

                            {formatTime(
                              alert.timestamp
                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </OfficerLayout>
  );
}


/* ============================================================
   TABLE HEADER
============================================================ */

function TableHeader({ children }) {
  return (
    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
      {children}
    </th>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
}) {

  const variants = {

    blue: {
      bg: "bg-blue-50",
      icon: "text-[#2563EB]",
    },

    red: {
      bg: "bg-red-50",
      icon: "text-[#DC2626]",
    },

    amber: {
      bg: "bg-amber-50",
      icon: "text-[#D97706]",
    },

  };


  const style =
    variants[variant] ||
    variants.blue;


  return (

    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-[#64748B]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-[#111827]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#94A3B8]">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.bg}`}
        >

          <Icon
            size={21}
            className={style.icon}
          />

        </div>

      </div>

    </div>

  );
}


/* ============================================================
   ACTION BADGE
============================================================ */

function ActionBadge({ action }) {

  const value =
    String(action || "REVIEW")
      .toUpperCase();

  const config = {

    BLOCK: {
      label: "Block",
      classes:
        "bg-red-50 text-red-700 border-red-200",
    },

    REVIEW: {
      label: "Review",
      classes:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    ALLOW: {
      label: "Allow",
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

  };


  const item =
    config[value] ||
    config.REVIEW;


  return (

    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.classes}`}
    >

      {item.label}

    </span>

  );
}


export default SecurityAlert;