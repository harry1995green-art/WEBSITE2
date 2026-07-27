"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";

export async function createWageEntry(formData: FormData) {
  const org = await getActiveOrg();

  await prisma.wageEntry.create({
    data: {
      orgId: org.id,
      staffId: String(formData.get("staffId") ?? ""),
      weekEnding: new Date(String(formData.get("weekEnding") ?? "")),
      hours: Number(String(formData.get("hours") ?? "0")),
      amount: Number(String(formData.get("amount") ?? "0")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/wages");
  redirect("/wages");
}

export async function toggleWagePaid(wageId: string) {
  const wage = await prisma.wageEntry.findUniqueOrThrow({ where: { id: wageId } });
  await prisma.wageEntry.update({ where: { id: wageId }, data: { paid: !wage.paid } });
  revalidatePath("/wages");
}
