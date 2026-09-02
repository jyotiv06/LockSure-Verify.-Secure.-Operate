import { useEffect, useState } from "react";

import {
  Activity,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";
import StatCard from "../../components/officer/StatCard";
import SecurityOverview from "../../components/officer/SecurityOverview";
import QuickActions from "../../components/officer/QuickActions";
import RecentOperations from "../../components/officer/RecentOperations";

import api from "../../services/api";


function OfficerDashboard() {

  // =====================================
  // DASHBOARD STATISTICS
  // =====================================

  const [stats, setStats] = useState({
    totalOperations: 0,
    successfulOperations: 0,
    pendingOperations: 0,
    highRiskAlerts: 0,
  });


  // =====================================
  // LOADING STATE
  // =====================================

  const [loading, setLoading] = useState(true);


  // =====================================
  // FETCH DASHBOARD DATA
  // =====================================

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        setLoading(true);


        /*
          Fetch locker operations
          and security alerts together
        */

        const [
          operationsResponse,
          alertsResponse,
        ] = await Promise.allSettled([

          api.get(
            "/locker/operations"
          ),

          api.get(
            "/security-alerts/"
          ),

        ]);


        // =====================================
        // OPERATIONS DATA
        // =====================================

        let operations = [];


        if (
          operationsResponse.status ===
          "fulfilled"
        ) {

          const operationsData =
            operationsResponse.value.data;


          operations =
            Array.isArray(
              operationsData
            )
              ? operationsData
              : operationsData?.operations || [];


        } else {

          console.error(
            "Failed to fetch operations:",
            operationsResponse.reason
          );

        }


        // =====================================
        // SECURITY ALERTS DATA
        // =====================================

        let alerts = [];


        if (
          alertsResponse.status ===
          "fulfilled"
        ) {

          const alertsData =
            alertsResponse.value.data;


          alerts =
            Array.isArray(
              alertsData
            )
              ? alertsData
              : alertsData?.alerts || [];


        } else {

          console.error(
            "Failed to fetch security alerts:",
            alertsResponse.reason
          );

        }


        console.log(
          "DASHBOARD OPERATIONS:",
          operations
        );


        console.log(
          "DASHBOARD ALERTS:",
          alerts
        );


        // =====================================
        // SUCCESSFUL OPERATIONS
        // =====================================

        const successfulOperations =
          operations.filter(
            (operation) => {

              const status =
                String(
                  operation.operation_status ||
                  operation.status ||
                  ""
                ).toUpperCase();


              return (
                status === "SUCCESS" ||
                status === "SUCCESSFUL" ||
                status === "COMPLETED"
              );

            }
          ).length;


        // =====================================
        // PENDING OPERATIONS
        // =====================================

        const pendingOperations =
          operations.filter(
            (operation) => {

              const status =
                String(
                  operation.operation_status ||
                  operation.status ||
                  ""
                ).toUpperCase();


              return (
                status === "PENDING" ||
                status === "IN_PROGRESS" ||
                status === "PROCESSING"
              );

            }
          ).length;


        // =====================================
        // HIGH RISK ALERTS
        // =====================================

        const highRiskAlerts =
          alerts.filter(
            (alert) => {

              const severity =
                String(
                  alert.severity ||
                  alert.risk_level ||
                  ""
                ).toUpperCase();


              return (
                severity === "HIGH" ||
                severity === "CRITICAL"
              );

            }
          ).length;


        // =====================================
        // UPDATE DASHBOARD
        // =====================================

        setStats({

          totalOperations:
            operations.length,

          successfulOperations,

          pendingOperations,

          highRiskAlerts,

        });


      } catch (error) {

        console.error(
          "Dashboard data fetch error:",
          error
        );


      } finally {

        setLoading(false);

      }

    };


    fetchDashboardData();


  }, []);


  // =====================================
  // UI
  // =====================================

  return (

    <OfficerLayout>


      {/* PAGE HEADER */}

      <div className="mb-7">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">


          {/* HEADER TEXT */}

          <div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Operations Center
            </p>


            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Officer Dashboard
            </h1>


            <p className="mt-2 text-sm text-[#64748B]">
              Monitor locker operations, customer verification and security activity.
            </p>

          </div>


          {/* SYSTEM STATUS */}

          <div className="flex items-center gap-2 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2">

            <Activity
              size={16}
              className="text-[#10B981]"
            />


            <span className="text-xs font-semibold text-[#047857]">
              All systems operational
            </span>

          </div>


        </div>

      </div>


      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">


        {/* TOTAL OPERATIONS */}

        <StatCard
          title="Total Locker Operations"
          value={
            loading
              ? "..."
              : stats.totalOperations
          }
          description="Real-time operation data"
          icon={Activity}
          variant="blue"
        />


        {/* SUCCESSFUL */}

        <StatCard
          title="Successful"
          value={
            loading
              ? "..."
              : stats.successfulOperations
          }
          description="Successful locker operations"
          icon={CheckCircle2}
          variant="green"
        />


        {/* PENDING */}

        <StatCard
          title="Pending"
          value={
            loading
              ? "..."
              : stats.pendingOperations
          }
          description="Awaiting completion"
          icon={Clock3}
          variant="amber"
        />


        {/* HIGH RISK */}

        <StatCard
          title="High Risk"
          value={
            loading
              ? "..."
              : stats.highRiskAlerts
          }
          description="Requires immediate attention"
          icon={ShieldAlert}
          variant="red"
        />


      </div>


      {/* SECURITY + QUICK ACTIONS */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">


        <SecurityOverview />


        <QuickActions />


      </div>


      {/* RECENT OPERATIONS */}

      <div className="mt-6">

        <RecentOperations />

      </div>


    </OfficerLayout>

  );

}


export default OfficerDashboard;