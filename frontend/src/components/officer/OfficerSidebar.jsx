import {
  LayoutDashboard,
  UserCheck,
  LockKeyhole,
  ShieldAlert,
  History,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/officer/dashboard",
  },
  {
    label: "Customer Search",
    icon: UserCheck,
    path: "/officer/customers",
  },
  {
    label: "Locker Operations",
    icon: LockKeyhole,
    path: "/officer/lockers",
  },
  {
  label: "Security Alerts",
  icon: ShieldAlert,
  path: "/officer/alerts",
}
];

const systemItems = [
  {
    label: "Operation History",
    icon: History,
    path: "/officer/history",
  }
];

function OfficerSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0B1220] text-white">
      
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              LockSure
            </h1>

            <p className="text-[10px] font-medium tracking-[0.18em] text-slate-400">
              SECURE BANKING
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Main
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.path}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className="transition-colors group-hover:text-[#06B6D4]"
                />

                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          System
        </p>

        <nav className="space-y-1">
          {systemItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.path}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className="group-hover:text-[#06B6D4]"
                />

                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Officer Profile */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3">

          <div className="flex items-center gap-3">

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold">
                AA
              </div>

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-[#10B981]" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Officer
              </p>

              <p className="truncate text-xs text-slate-500">
                OF-2041
              </p>
            </div>

          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#10B981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            System Secure
          </div>

        </div>
      </div>
    </aside>
  );
}

export default OfficerSidebar;