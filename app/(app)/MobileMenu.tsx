"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import SidebarNav from "./SidebarNav";

export default function MobileMenu({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden p-2 text-slate-700"
      >
        <Menu size={24} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900">{orgName}</div>
                <div className="text-xs text-slate-500">CRM</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={22} className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
