"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { resetOrgData } from "@/lib/resetOrgData";

export async function createContact(formData: FormData) {
  const org = await getActiveOrg();

  const contact = await prisma.contact.create({
    data: {
      orgId: org.id,
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(contactId: string, formData: FormData) {
  await prisma.contact.update({
    where: { id: contactId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
}

export async function bulkDeleteContacts(formData: FormData) {
  const ids = formData.getAll("contactIds").map(String).filter(Boolean);
  if (ids.length === 0) {
    redirect("/contacts");
  }

  // A duplicate contact from a botched import usually came bundled with a
  // duplicate lead — remove those too. Anything more substantial (jobs,
  // tasks, surveys) just gets unlinked, not destroyed.
  await prisma.lead.deleteMany({ where: { contactId: { in: ids } } });
  await prisma.job.updateMany({ where: { contactId: { in: ids } }, data: { contactId: null } });
  await prisma.task.updateMany({ where: { contactId: { in: ids } }, data: { contactId: null } });
  await prisma.survey.updateMany({ where: { contactId: { in: ids } }, data: { contactId: null } });

  const { count } = await prisma.contact.deleteMany({ where: { id: { in: ids } } });

  revalidatePath("/contacts");
  revalidatePath("/leads");
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/contacts?bulkDeleted=${count}`);
}

export async function deleteAllOrgData(formData: FormData) {
  const org = await getActiveOrg();
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== org.name) {
    redirect(`/contacts?resetError=${encodeURIComponent("Typed name didn't match — nothing was deleted.")}`);
  }

  await resetOrgData(org.id);

  revalidatePath("/contacts");
  revalidatePath("/leads");
  revalidatePath("/jobs");
  revalidatePath("/tasks");
  revalidatePath("/finance");
  revalidatePath("/calendar");
  revalidatePath("/surveys");
  revalidatePath("/dashboard");
  redirect("/contacts?reset=done");
}
