"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveOrg } from "./actions";
import type { OrgSlug } from "@/lib/constants";

export default function OrgSwitcher({ active }: { active: OrgSlug }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(slug: OrgSlug) {
    if (slug === active || isPending) return;
    startTransition(async () => {
      await setActiveOrg(slug);
      router.refresh();
    });
  }

  return (
    <div className="flex rounded-full border border-slate-300 overflow-hidden text-sm font-semibold">
      {(["AR", "BA"] as const).map((slug) => (
        <button
          key={slug}
          type="button"
          onClick={() => switchTo(slug)}
          className={`px-4 py-1.5 transition ${
            active === slug
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          {slug}
        </button>
      ))}
    </div>
  );
}
