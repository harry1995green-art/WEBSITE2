"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { findOrCreateContact } from "@/lib/crm";
import { parseLeadImportCsv } from "@/lib/csvImport";

export async function importLeads(formData: FormData) {
  const org = await getActiveOrg();

  const file = formData.get("file");
  const pastedText = String(formData.get("csvText") ?? "");
  const text = file instanceof File && file.size > 0 ? await file.text() : pastedText;

  if (!text.trim()) {
    redirect(`/leads/import?error=${encodeURIComponent("No CSV data provided.")}`);
  }

  const { rows, errors } = parseLeadImportCsv(text);
  const rowErrors: string[] = [...errors];
  let imported = 0;

  for (const row of rows) {
    try {
      const contact = await findOrCreateContact(org.id, {
        name: row.contactName,
        email: row.contactEmail,
        phone: row.contactPhone,
        address: row.contactAddress,
      });

      await prisma.lead.create({
        data: {
          orgId: org.id,
          contactId: contact.id,
          title: row.title || `Enquiry from ${contact.name}`,
          source: row.source,
          value: row.value,
          notes: row.notes,
        },
      });
      imported++;
    } catch (err) {
      rowErrors.push(`${row.contactName}: ${err instanceof Error ? err.message : "failed to import"}`);
    }
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");

  const params = new URLSearchParams();
  params.set("imported", String(imported));
  params.set("errorCount", String(rowErrors.length));
  if (rowErrors.length) params.set("errors", rowErrors.slice(0, 15).join(" | "));

  redirect(`/leads/import/result?${params.toString()}`);
}
