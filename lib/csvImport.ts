import { parse } from "csv-parse/sync";

export type ImportedLeadRow = {
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  title: string | null;
  source: string | null;
  value: number | null;
  notes: string | null;
};

// Accepts a variety of header spellings so a raw HubSpot-style export
// doesn't need to be manually renamed before pasting in.
const HEADER_ALIASES: Record<string, keyof ImportedLeadRow> = {
  name: "contactName",
  "contact name": "contactName",
  "full name": "contactName",
  email: "contactEmail",
  "email address": "contactEmail",
  phone: "contactPhone",
  "phone number": "contactPhone",
  mobile: "contactPhone",
  address: "contactAddress",
  title: "title",
  "lead title": "title",
  enquiry: "title",
  source: "source",
  "lead source": "source",
  value: "value",
  "estimated value": "value",
  "deal value": "value",
  notes: "notes",
  note: "notes",
  description: "notes",
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseLeadImportCsv(text: string): {
  rows: ImportedLeadRow[];
  errors: string[];
} {
  const records: Record<string, string>[] = parse(text, {
    columns: (headers: string[]) => headers.map((h) => normalizeHeader(h)),
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const rows: ImportedLeadRow[] = [];
  const errors: string[] = [];

  records.forEach((record, index) => {
    const mapped: Partial<ImportedLeadRow> = {};
    for (const [header, value] of Object.entries(record)) {
      const field = HEADER_ALIASES[header];
      if (!field || !value) continue;
      if (field === "value") {
        const num = Number(String(value).replace(/[^0-9.-]/g, ""));
        mapped.value = Number.isFinite(num) && num !== 0 ? num : null;
      } else {
        mapped[field] = value.trim();
      }
    }

    const contactName = mapped.contactName?.trim();
    if (!contactName) {
      errors.push(`Row ${index + 2}: missing a Name — skipped.`);
      return;
    }

    rows.push({
      contactName,
      contactEmail: mapped.contactEmail ?? null,
      contactPhone: mapped.contactPhone ?? null,
      contactAddress: mapped.contactAddress ?? null,
      title: mapped.title ?? null,
      source: mapped.source ?? null,
      value: mapped.value ?? null,
      notes: mapped.notes ?? null,
    });
  });

  return { rows, errors };
}
