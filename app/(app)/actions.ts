"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/auth";
import type { OrgSlug } from "@/lib/constants";

export async function setActiveOrg(slug: OrgSlug) {
  const store = await cookies();
  store.set("activeOrg", slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
