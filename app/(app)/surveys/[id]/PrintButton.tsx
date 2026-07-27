"use client";

import { Printer } from "lucide-react";
import { GhostButton } from "@/components/ui";

export default function PrintButton() {
  return (
    <GhostButton onClick={() => window.print()} className="bg-slate-100">
      <Printer size={16} /> Print / Save PDF
    </GhostButton>
  );
}
