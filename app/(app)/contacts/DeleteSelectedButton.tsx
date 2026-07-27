"use client";

import { Trash2 } from "lucide-react";

export default function DeleteSelectedButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const form = e.currentTarget.closest("form");
        const checked = form?.querySelectorAll('input[name="contactIds"]:checked').length ?? 0;
        if (checked === 0) {
          e.preventDefault();
          alert("Tick at least one contact first.");
          return;
        }
        if (
          !confirm(
            `Delete ${checked} contact${checked === 1 ? "" : "s"}? Any leads linked to them are deleted too; jobs/tasks/surveys are just unlinked, not deleted. This can't be undone.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
    >
      <Trash2 size={16} /> Delete selected
    </button>
  );
}
