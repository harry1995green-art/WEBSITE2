import { prisma } from "./prisma";

export async function findOrCreateContact(
  orgId: string,
  data: { name: string; email?: string | null; phone?: string | null; address?: string | null },
) {
  const name = data.name.trim();
  if (!name) throw new Error("Contact name is required");
  const email = data.email?.trim() || null;
  const phone = data.phone?.trim() || null;
  const address = data.address?.trim() || null;

  let existing = null;
  if (email) {
    existing = await prisma.contact.findFirst({ where: { orgId, email } });
  }
  if (!existing && phone) {
    existing = await prisma.contact.findFirst({ where: { orgId, phone } });
  }

  if (existing) {
    return prisma.contact.update({
      where: { id: existing.id },
      data: {
        name,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
        address: address ?? existing.address,
      },
    });
  }

  return prisma.contact.create({
    data: { orgId, name, email, phone, address },
  });
}
