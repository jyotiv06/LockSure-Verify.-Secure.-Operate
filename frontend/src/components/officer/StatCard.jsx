import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "blue",
}) {
  const variants = {
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-[#2563EB]",
      accent: "bg-[#2563EB]",
    },
    green: {
      iconBg: "bg-emerald-50",
      iconColor: "text-[#10B981]",
      accent: "bg-[#10B981]",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconColor: "text-[#F59E0B]",
      accent: "bg-[#F59E0B]",
    },
    red: {
      iconBg: "bg-red-50",
      iconColor: "text-[#EF4444]",
      accent: "bg-[#EF4444]",
    },
  };

  const style = variants[variant];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      {/* Top */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-[#64748B]">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          <Icon
            size={21}
            strokeWidth={1.8}
            className={style.iconColor}
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <ArrowUpRight
          size={14}
          className={style.iconColor}
        />

        <span className="font-medium text-[#64748B]">
          {description}
        </span>
      </div>

      {/* Bottom accent */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 ${style.accent} transition-all duration-300 group-hover:w-full`}
      />

    </div>
  );
}

export default StatCard;