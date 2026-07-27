"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, SURVEY_NAV, type NavItem } from "./nav";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
      {item.label}
    </Link>
  );
}

export default function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {MAIN_NAV.map((item) => (
        <NavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}
      <div className="mt-4 mb-1 px-4 text-xs font-semibold tracking-wide text-slate-400">
        SURVEY TOOL
      </div>
      {SURVEY_NAV.map((item) => (
        <NavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
