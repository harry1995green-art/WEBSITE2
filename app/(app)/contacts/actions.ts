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
