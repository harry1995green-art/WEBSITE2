"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";

export async function createStaffMember(formData: FormData) {
  const org = await getActiveOrg();
  const rateRaw = String(formData.get("hourlyRate") ?? "").trim();

  await prisma.staffMember.create({
    data: {
      orgId: org.id,
      name: String(formData.get("name") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      hourlyRate: rateRaw ? Number(rateRaw) : null,
    },
  });

  revalidatePath("/staff");
  redirect("/staff");
}

export async function toggleStaffActive(staffId: string) {
  const staff = await prisma.staffMember.findUniqueOrThrow({ where: { id: staffId } });
  await prisma.staffMember.update({ where: { id: staffId }, data: { active: !staff.active } });
  revalidatePath("/staff");
}
