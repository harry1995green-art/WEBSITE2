import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { PageHeader, PrimaryLink, Card, EmptyState } from "@/components/ui";

export default async function ContactsPage() {
  const org = await getActiveOrg();
  const contacts = await prisma.contact.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} total`}
        action={
          <PrimaryLink href="/contacts/new">
            <Plus size={16} /> New Contact
          </PrimaryLink>
        }
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/contacts/${c.id}`} className="font-semibold text-slate-900 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-slate-600">{c.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
