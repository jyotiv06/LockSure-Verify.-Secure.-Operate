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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import OfficerLayout from "../../components/officer/OfficerLayout";
import { officerCustomers } from "../../data/officerMockData";

function CustomerSearch() {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    const result = officerCustomers.find(
      (item) =>
        item.id.toLowerCase() === customerId.trim().toLowerCase()
    );

    setCustomer(result || null);
    setSearched(true);
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
              Search using the customer's unique ID.
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
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter Customer ID e.g. CUST023"
              className="w-full rounded-xl border border-[#CBD5E1] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
            />

          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <Search size={17} />
            Search
          </button>

        </form>

        <p className="mt-3 text-xs text-[#94A3B8]">
          Demo IDs: CUST023, CUST102, CUST108
        </p>

      </div>

      {/* Not Found */}
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
            No customer matched the entered ID.
          </p>

        </div>
      )}

      {/* Customer Result */}
      {customer && (
        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] px-6 py-5 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                Customer Found
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#111827]">
                {customer.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              {customer.verificationStatus}
            </div>

          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              icon={UserRound}
              label="Customer ID"
              value={customer.id}
            />

            <InfoItem
              icon={CreditCard}
              label="Account"
              value={customer.account}
            />

            <InfoItem
              icon={CheckCircle2}
              label="Account Status"
              value={customer.accountStatus}
            />

            <InfoItem
              icon={LockKeyhole}
              label="Locker"
              value={customer.locker}
            />

            <InfoItem
              icon={History}
              label="Previous Operations"
              value="12 operations"
            />

            <InfoItem
              icon={CheckCircle2}
              label="Verification"
              value={customer.verificationStatus}
            />

          </div>

          <div className="flex justify-end border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/officer/verification?customer=${customer.id}`
                )
              }
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

function InfoItem({ icon: Icon, label, value }) {
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