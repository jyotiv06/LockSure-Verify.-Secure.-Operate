import {
  UserCheck,
  LockKeyhole,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Verify Customer",
    description: "Review a pending verification",
    icon: UserCheck,
    path: "/officer/customers",
    variant: "blue",
  },
  {
    title: "Locker Operation",
    description: "Manage approved locker access",
    icon: LockKeyhole,
    path: "/officer/lockers",
    variant: "cyan",
  },
  {
    title: "Review High Risk",
    description: "Investigate suspicious activity",
    icon: ShieldAlert,
    path: "/officer/security-alerts",
    variant: "red",
  },
];

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

      <div>
        <h3 className="text-base font-bold text-[#111827]">
          Quick Actions
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Frequently used officer operations.
        </p>
      </div>

      <div className="mt-5 space-y-3">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={() => navigate(action.path)}
              className="group flex w-full items-center gap-3 rounded-xl border border-[#E2E8F0] p-3.5 text-left transition-all duration-200 hover:border-[#BFDBFE] hover:bg-[#F8FAFF]"
            >

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.variant === "red"
                    ? "bg-red-50 text-[#EF4444]"
                    : action.variant === "cyan"
                      ? "bg-cyan-50 text-[#06B6D4]"
                      : "bg-blue-50 text-[#2563EB]"
                  }`}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-[#111827]">
                  {action.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                  {action.description}
                </p>

              </div>

              <ArrowRight
                size={17}
                className="text-[#94A3B8] transition-transform group-hover:translate-x-1 group-hover:text-[#2563EB]"
              />

            </button>
          );
        })}

      </div>

    </div>
  );
}

export default QuickActions;