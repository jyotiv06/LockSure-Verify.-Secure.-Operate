import { useState } from "react";

import {
  Search,
  UserRound,
  CreditCard,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  History,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import OfficerLayout from "../../components/officer/OfficerLayout";
import api from "../../services/api";

function CustomerSearch() {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchValue = customerId.trim();

    if (!searchValue) {
      setCustomer(null);
      setSearched(true);
      setErrorMessage(
        "Please enter a Customer ID or Customer Number."
      );
      return;
    }

    try {
      setLoading(true);
      setCustomer(null);
      setSearched(false);
      setErrorMessage("");

      const response = await api.get(
        `/customers/${encodeURIComponent(searchValue)}`
      );

      console.log(
        "CUSTOMER SEARCH RESPONSE:",
        response.data
      );

      setCustomer(response.data);
      setSearched(true);
    } catch (error) {
      console.error(
        "Customer search error:",
        error
      );

      setCustomer(null);
      setSearched(true);

      if (error.response?.status === 404) {
        setErrorMessage(
          "No customer matched the entered Customer ID or Customer Number."
        );
      } else if (error.response?.status === 401) {
        setErrorMessage(
          "Your session has expired. Please login again."
        );
      } else {
        setErrorMessage(
          error.response?.data?.detail ||
            "Unable to search for the customer. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStyles = (status) => {
    const normalizedStatus = String(
      status || ""
    ).toUpperCase();

    if (
      normalizedStatus === "APPROVED" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "VERIFIED"
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      normalizedStatus === "FAILED" ||
      normalizedStatus === "REJECTED"
    ) {
      return "bg-red-50 text-red-700";
    }

    if (
      normalizedStatus === "IN_PROGRESS" ||
      normalizedStatus === "PENDING"
    ) {
      return "bg-yellow-50 text-yellow-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getCustomerName = () => {
    return (
      customer?.full_name ||
      customer?.customer_name ||
      customer?.name ||
      "Unknown Customer"
    );
  };

  const getCustomerNumber = () => {
    return (
      customer?.customer_number ||
      customer?.customer_id ||
      "N/A"
    );
  };

  const handleBeginVerification = () => {
    /*
      Backend returns:

      customer_db_id  -> numeric database ID
      customer_id     -> currently numeric customer ID
      customer_number -> customer number such as CUST001

      Verification API expects numeric customer_id,
      so customer_db_id is the safest value.
    */

    const verificationCustomerId =
      customer?.customer_db_id ||
      customer?.customer_id;

    if (!verificationCustomerId) {
      console.error(
        "Customer database ID is missing from API response.",
        customer
      );

      setErrorMessage(
        "Customer ID is missing. Unable to begin verification."
      );

      return;
    }

    navigate(
      `/officer/customer-verification?customer=${encodeURIComponent(
        verificationCustomerId
      )}`
    );
  };

  return (
    <OfficerLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
          Customer Management
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Customer Search
        </h1>

        <p className="mt-2 text-sm text-[#64748B]">
          Find a customer to begin verification and locker operations.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Search
              size={20}
              className="text-[#2563EB]"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Search Customer
            </h2>

            <p className="mt-1 text-xs text-[#64748B]">
              Search using Customer Number or Customer ID.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <UserRound
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter Customer ID e.g. CUST001 or 1001"
              className="w-full rounded-xl border border-[#CBD5E1] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Searching...
              </>
            ) : (
              <>
                <Search size={17} />
                Search
              </>
            )}
          </button>
        </form>

        <p className="mt-3 text-xs text-[#94A3B8]">
          Example: CUST001 or 1001
        </p>
      </div>

      {/* Error */}
      {searched && !customer && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              size={22}
              className="text-[#EF4444]"
            />
          </div>

          <h3 className="mt-4 font-bold text-[#111827]">
            Customer Not Found
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Customer Result */}
      {customer && (
        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

          {/* Customer Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                Customer Found
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#111827]">
                {getCustomerName()}
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                {getCustomerNumber()}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${getVerificationStyles(
                customer.verification_status
              )}`}
            >
              <CheckCircle2 size={14} />

              {customer.verification_status ||
                "NOT_STARTED"}
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={UserRound}
              label="Customer ID"
              value={getCustomerNumber()}
            />

            <InfoItem
              icon={UserRound}
              label="Customer Name"
              value={getCustomerName()}
            />

            <InfoItem
              icon={CreditCard}
              label="Account"
              value={
                customer.account_number ||
                "No account assigned"
              }
            />

            <InfoItem
              icon={CheckCircle2}
              label="Account Status"
              value={
                customer.account_status ||
                "N/A"
              }
            />

            <InfoItem
              icon={LockKeyhole}
              label="Locker"
              value={
                customer.locker_number ||
                customer.locker_id ||
                "No locker assigned"
              }
            />

            <InfoItem
              icon={LockKeyhole}
              label="Locker Status"
              value={
                customer.locker_status ||
                "N/A"
              }
            />

            <InfoItem
              icon={History}
              label="Previous Operations"
              value={`${customer.previous_operations || 0} operations`}
            />

            <InfoItem
              icon={CheckCircle2}
              label="Verification"
              value={
                customer.verification_status ||
                "NOT_STARTED"
              }
            />

            <InfoItem
              icon={UserRound}
              label="Branch"
              value={
                customer.branch_name ||
                customer.branch ||
                "N/A"
              }
            />

          </div>

          {/* Action */}
          <div className="flex justify-end border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
            <button
              type="button"
              onClick={handleBeginVerification}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Begin Verification

              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      )}
    </OfficerLayout>
  );
}


function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-xs text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#111827]">
          {value}
        </p>
      </div>
    </div>
  );
}


export default CustomerSearch;