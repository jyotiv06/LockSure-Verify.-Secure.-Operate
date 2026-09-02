import { useEffect, useState } from "react";

import {
  ShieldCheck,
  FileCheck2,
  ScanFace,
  Server,
  AlertTriangle,
} from "lucide-react";

import api from "../../services/api";


function SecurityOverview() {

  // =====================================
  // METRICS
  // =====================================

  const [metrics, setMetrics] =
    useState([
      {
        label:
          "Identity Verification",

        value:
          0,

        icon:
          ShieldCheck,
      },

      {
        label:
          "Document Verification",

        value:
          0,

        icon:
          FileCheck2,
      },

      {
        label:
          "Face Match Success",

        value:
          0,

        icon:
          ScanFace,
      },
    ]);


  // =====================================
  // LOADING
  // =====================================

  const [loading, setLoading] =
    useState(true);


  // =====================================
  // ERROR
  // =====================================

  const [error, setError] =
    useState("");


  // =====================================
  // FETCH SECURITY OVERVIEW
  // =====================================

  const fetchVerificationOverview =
    async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await api.get(
            "/verification/overview"
          );


        console.log(
          "VERIFICATION OVERVIEW RESPONSE:",
          response.data
        );


        const data =
          response.data || {};


        /*
          Backend response:

          {
            total_verifications,

            identity_verification_success_rate,

            document_verification_success_rate,

            face_match_success_rate,

            identity_approved,

            documents_verified,

            faces_verified
          }
        */

        setMetrics([
          {
            label:
              "Identity Verification",

            value:
              Number(
                data.identity_verification_success_rate ||
                0
              ),

            icon:
              ShieldCheck,
          },

          {
            label:
              "Document Verification",

            value:
              Number(
                data.document_verification_success_rate ||
                0
              ),

            icon:
              FileCheck2,
          },

          {
            label:
              "Face Match Success",

            value:
              Number(
                data.face_match_success_rate ||
                0
              ),

            icon:
              ScanFace,
          },
        ]);


      } catch (error) {

        console.error(
          "Security overview API error:",
          error
        );


        setError(
          error.response?.data?.detail ||
          error.message ||
          "Unable to load security overview."
        );


      } finally {

        setLoading(false);

      }

    };


  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {

    fetchVerificationOverview();

  }, []);


  // =====================================
  // UI
  // =====================================

  return (

    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">


      {/* HEADER */}

      <div className="flex items-start justify-between">


        <div>

          <h3 className="text-base font-bold text-[#111827]">
            Security Overview
          </h3>


          <p className="mt-1 text-sm text-[#64748B]">
            Verification performance across locker operations.
          </p>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">

          <ShieldCheck
            size={20}
            className="text-[#06B6D4]"
          />

        </div>


      </div>


      {/* ERROR */}

      {!loading &&
        error && (

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">


            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />


            <div>

              <p className="text-sm font-semibold text-red-700">
                Unable to load security metrics
              </p>


              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>


              <button
                type="button"
                onClick={
                  fetchVerificationOverview
                }
                className="mt-2 text-xs font-semibold text-red-700 underline"
              >

                Try again

              </button>


            </div>


          </div>

        )}


      {/* VERIFICATION METRICS */}

      {!error && (

        <div className="mt-6 space-y-5">


          {metrics.map(
            (item) => {

              const Icon =
                item.icon;


              const safeValue =
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      item.value
                    ) || 0
                  )
                );


              return (

                <div
                  key={
                    item.label
                  }
                >


                  <div className="mb-2 flex items-center justify-between">


                    <div className="flex items-center gap-2">


                      <Icon
                        size={16}
                        className="text-[#64748B]"
                        strokeWidth={1.8}
                      />


                      <span className="text-sm font-medium text-[#334155]">

                        {item.label}

                      </span>


                    </div>


                    <span className="text-sm font-bold text-[#111827]">

                      {loading
                        ? "..."
                        : `${safeValue.toFixed(2)}%`}

                    </span>


                  </div>


                  <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">


                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-700"
                      style={{
                        width:
                          loading
                            ? "0%"
                            : `${safeValue}%`,
                      }}
                    />


                  </div>


                </div>

              );

            }
          )}


        </div>

      )}


      {/* SYSTEM STATUS */}

      <div className="mt-7 border-t border-[#E2E8F0] pt-5">


        <div className="mb-3 flex items-center gap-2">


          <Server
            size={16}
            className="text-[#64748B]"
          />


          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            System Status
          </span>


        </div>


        <div className="grid grid-cols-2 gap-3">


          <StatusItem
            label="Identity Services"
            loading={loading}
            error={error}
          />


          <StatusItem
            label="Document Services"
            loading={loading}
            error={error}
          />


          <StatusItem
            label="Face Verification"
            loading={loading}
            error={error}
          />


          <StatusItem
            label="Locker Controller"
            loading={false}
            error=""
          />


        </div>


      </div>


    </div>

  );

}


// =====================================
// SYSTEM STATUS ITEM
// =====================================

function StatusItem({

  label,

  loading,

  error,

}) {

  const isOnline =
    !loading &&
    !error;


  return (

    <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2">


      <span
        className={`h-2 w-2 rounded-full ${
          loading
            ? "bg-amber-400"
            : isOnline
              ? "bg-[#10B981]"
              : "bg-red-500"
        }`}
      />


      <span className="truncate text-xs font-medium text-[#475569]">

        {label}

      </span>


    </div>

  );

}


export default SecurityOverview;