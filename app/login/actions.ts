"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  const ok = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !ok) {
    redirect("/login?error=1");
  }

  await setSessionCookie(user.id);
  redirect("/dashboard");
}
