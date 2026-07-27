import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "success";
}) {
  const valueColor =
    tone === "warning"
      ? "text-amber-500"
      : tone === "success"
        ? "text-emerald-500"
        : "text-slate-900";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-500 mb-2">{label}</div>
        <div className={`text-3xl font-extrabold ${valueColor}`}>{value}</div>
      </div>
      {Icon ? (
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
          <Icon size={18} />
        </div>
      ) : null}
    </div>
  );
}
