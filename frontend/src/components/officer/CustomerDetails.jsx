import {
  UserRound,
  CreditCard,
  LockKeyhole,
  Building2,
  Clock3,
} from "lucide-react";


function CustomerDetails({ customer }) {

  if (!customer) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <p className="text-sm text-[#64748B]">
          Customer information is not available.
        </p>
      </div>
    );
  }


  const details = [
    {
      label: "Customer",
      value: customer.full_name || "N/A",
      icon: UserRound,
    },
    {
      label: "Customer ID",
      value: customer.customer_number || customer.customer_id || "N/A",
      icon: CreditCard,
    },
    {
      label: "Locker",
      value: customer.locker_number || "No locker assigned",
      icon: LockKeyhole,
    },
    {
      label: "Branch",
      value: customer.branch_name || "N/A",
      icon: Building2,
    },
    {
      label: "Requested Operation",
      value: "Open Locker",
      icon: LockKeyhole,
    },
    {
      label: "Request Time",
      value: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: Clock3,
    },
  ];


  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div className="mb-5">

        <h3 className="text-base font-bold text-[#111827]">
          Customer Details
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Information associated with this locker request.
        </p>

      </div>


      <div className="grid gap-5 sm:grid-cols-2">

        {details.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.label}
              className="flex items-start gap-3"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">

                <Icon size={17} />

              </div>


              <div>

                <p className="text-xs text-[#94A3B8]">
                  {item.label}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  {item.value}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}


export default CustomerDetails;