import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

// Temporary escape hatch: directly sets the login user's email/password,
// bypassing ADMIN_EMAIL/ADMIN_NAME/ADMIN_PASSWORD entirely, for when the
// env-var-driven seeding isn't producing a working login for some reason.
// Still gated by CRM_API_KEY. Remove this route once login is confirmed
// working normally.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key || key !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const password = url.searchParams.get("password");
  const name = url.searchParams.get("name")?.trim() || "Admin";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Both 'email' and 'password' query params are required" },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  return NextResponse.json({ ok: true, email: user.email, name: user.name });
}
