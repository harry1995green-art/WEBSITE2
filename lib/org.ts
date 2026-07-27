import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { OrgSlug } from "./constants";

const ORG_COOKIE = "activeOrg";

export async function getActiveOrgSlug(): Promise<OrgSlug> {
  const store = await cookies();
  const v = store.get(ORG_COOKIE)?.value;
  return v === "BA" ? "BA" : "AR";
}

export async function getActiveOrg() {
  const slug = await getActiveOrgSlug();
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    throw new Error(`Organization "${slug}" not found — run "npm run db:seed" first.`);
  }
  return org;
}
