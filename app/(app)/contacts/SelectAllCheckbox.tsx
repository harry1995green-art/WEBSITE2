"use client";

export default function SelectAllCheckbox() {
  return (
    <input
      type="checkbox"
      aria-label="Select all contacts"
      className="h-4 w-4 rounded border-slate-300"
      onChange={(e) => {
        const checked = e.currentTarget.checked;
        document
          .querySelectorAll<HTMLInputElement>('input[name="contactIds"]')
          .forEach((cb) => {
            cb.checked = checked;
          });
      }}
    />
  );
}
