"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";

export async function createEvent(formData: FormData) {
  const org = await getActiveOrg();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;

  await prisma.calendarEvent.create({
    data: {
      orgId: org.id,
      jobId,
      title: String(formData.get("title") ?? "").trim(),
      date: new Date(String(formData.get("date") ?? new Date().toISOString())),
      type: String(formData.get("type") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/calendar");
  redirect("/calendar");
}
