export const ORG_SLUGS = ["AR", "BA"] as const;
export type OrgSlug = (typeof ORG_SLUGS)[number];

export const PIPELINE_STAGES = [
  { value: "NEW_ENQUIRY", label: "New Enquiry", dot: "bg-slate-400" },
  { value: "CONTACTED", label: "Contacted", dot: "bg-blue-400" },
  { value: "SITE_VISIT", label: "Site Visit", dot: "bg-violet-400" },
  { value: "QUOTE_SENT", label: "Quote Sent", dot: "bg-amber-400" },
  { value: "ACCEPTED", label: "Accepted", dot: "bg-emerald-400" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-slate-700" },
  { value: "COMPLETED", label: "Completed", dot: "bg-teal-500" },
  { value: "INVOICED", label: "Invoiced", dot: "bg-indigo-500" },
  { value: "LOST", label: "Lost", dot: "bg-red-400" },
] as const;

export type PipelineStageValue = (typeof PIPELINE_STAGES)[number]["value"];

export const CLOSED_STAGES: PipelineStageValue[] = ["COMPLETED", "INVOICED", "LOST"];

export function stageLabel(stage: string) {
  return PIPELINE_STAGES.find((s) => s.value === stage)?.label ?? stage;
}

export function stageDot(stage: string) {
  return PIPELINE_STAGES.find((s) => s.value === stage)?.dot ?? "bg-slate-400";
}

export const LEAD_STATUSES = ["NEW", "QUALIFIED", "CONVERTED", "LOST"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const TASK_STATUSES = ["OPEN", "DONE"] as const;
export const INVOICE_STATUSES = ["OUTSTANDING", "PAID"] as const;
export const SURVEY_STATUSES = ["DRAFT", "COMPLETED"] as const;

export const SURVEY_CONDITIONS = ["Good", "Fair", "Poor", "Needs Attention"] as const;

export const DEFAULT_SURVEY_SECTIONS = [
  "Ridge Tiles",
  "Roof Slopes / Tiles",
  "Flashing",
  "Guttering & Fascia",
  "Chimney",
  "Felt / Underlay",
  "Timber & Structure",
];

export function formatGBP(value: number | null | undefined) {
  const amount = value ?? 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
