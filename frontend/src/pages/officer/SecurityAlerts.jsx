import { useEffect, useState } from "react";

import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  X,
  Clock3,
  User,
  Loader2,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";


const API_URL = "http://127.0.0.1:8000/security-alerts/";


function SecurityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // FETCH SECURITY ALERTS
  // =========================================================

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Failed to load security alerts."
          );
        }

        const data = await response.json();

        // Convert backend response into UI structure
        const formattedAlerts = data.map((alert) => ({
          id: alert.alert_id,

          severity: alert.severity,

          title:
            alert.severity === "HIGH"
              ? "High Risk Security Alert"
              : "Verification Requires Review",

          description: alert.incident_reason,

          customer:
            alert.customer_name || "Unknown Customer",

          customerId:
            alert.customer_id || "N/A",

          lockerId:
            alert.locker_number ||
            alert.locker_id ||
            "N/A",

          recommendedAction:
            alert.recommended_action,

          verificationId:
            alert.verification_id,

          timestamp:
            alert.timestamp,

          time: formatTime(alert.timestamp),
        }));

        setAlerts(formattedAlerts);
      } catch (error) {
        console.error(
          "Security Alerts API Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load security alerts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);


  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "Unknown time";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    const difference =
      Date.now() - date.getTime();

    const minutes =
      Math.floor(
        difference / (1000 * 60)
      );

    const hours =
      Math.floor(
        difference / (1000 * 60 * 60)
      );

    const days =
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes !== 1 ? "s" : ""
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;
    }

    return `${days} day${
      days !== 1 ? "s" : ""
    } ago`;
  };


  // =========================================================
  // RESOLVE ALERT
  // =========================================================

  const resolveAlert = (alert) => {
    setAlerts((previousAlerts) =>
      previousAlerts.filter(
        (item) => item.id !== alert.id
      )
    );

    setResolvedAlerts(
      (previousAlerts) => [
        {
          ...alert,
          resolvedAt: "Just now",
        },
        ...previousAlerts,
      ]
    );
  };


  // =========================================================
  // DISMISS ALERT
  // =========================================================

  const dismissAlert = (alertId) => {
    setAlerts((previousAlerts) =>
      previousAlerts.filter(
        (alert) =>
          alert.id !== alertId
      )
    );
  };


  // =========================================================
  // ALERT STYLE
  // =========================================================

  const getAlertStyle = (severity) => {
    if (severity === "HIGH") {
      return {
        icon: ShieldAlert,

        badge:
          "bg-red-50 text-red-600 border-red-200",

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


  // =========================================================
  // STATISTICS
  // =========================================================

  const highAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "HIGH"
    ).length;


  const mediumAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "MEDIUM"
    ).length;


  const lowAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "LOW"
    ).length;


  return (
    <OfficerLayout>

      {/* HEADER */}

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


      {/* ALERT STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">

        {/* HIGH */}

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


        {/* MEDIUM */}

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


        {/* LOW */}

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


      {/* ACTIVE ALERTS */}

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


        {/* LOADING */}

        {loading && (

          <div className="flex items-center justify-center py-16">

            <Loader2
              size={28}
              className="animate-spin text-[#2563EB]"
            />

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

          </div>

        )}


        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          alerts.length === 0 && (

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


        {/* ALERT LIST */}

        {!loading &&
          !error &&
          alerts.length > 0 && (

          <div className="mt-6 space-y-4">

            {alerts.map((alert) => {

              const style =
                getAlertStyle(
                  alert.severity
                );

              const Icon =
                style.icon;

              return (

                <div
                  key={alert.id}
                  className={`rounded-xl border ${style.border} p-5 transition hover:shadow-sm`}
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">


                    {/* LEFT */}

                    <div className="flex gap-4">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
                      >

                        <Icon
                          size={20}
                          className={
                            style.iconColor
                          }
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


                        {/* RECOMMENDED ACTION */}

                        {alert.recommendedAction && (

                          <p className="mt-2 text-xs font-semibold text-[#475569]">

                            Recommended Action:
                            {" "}
                            {alert.recommendedAction}

                          </p>

                        )}


                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">

                          <div className="flex items-center gap-1.5">

                            <User size={14} />

                            {alert.customer}

                          </div>


                          <span>
                            Customer ID:
                            {" "}
                            {alert.customerId}
                          </span>


                          <span>
                            Locker:
                            {" "}
                            {alert.lockerId}
                          </span>


                          <div className="flex items-center gap-1.5">

                            <Clock3 size={14} />

                            {alert.time}

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* ACTIONS */}

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
                          dismissAlert(
                            alert.id
                          )
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

        )}

      </div>


      {/* RESOLVED ALERTS */}

      {resolvedAlerts.length > 0 && (

        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

          <h2 className="text-base font-bold text-[#111827]">
            Recently Resolved
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            Alerts resolved during this officer session.
          </p>


          <div className="mt-5 space-y-3">

            {resolvedAlerts.map(
              (alert) => (

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
                        {alert.customer}
                        {" · "}
                        {alert.customerId}
                      </p>

                    </div>

                  </div>


                  <span className="text-xs font-medium text-green-600">

                    Resolved
                    {" "}
                    {alert.resolvedAt}

                  </span>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </OfficerLayout>
  );
}


export default SecurityAlerts;