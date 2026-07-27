"use server";

import { cookies } from "next/headers";
import type { OrgSlug } from "@/lib/constants";

export async function setActiveOrg(slug: OrgSlug) {
  const store = await cookies();
  store.set("activeOrg", slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
