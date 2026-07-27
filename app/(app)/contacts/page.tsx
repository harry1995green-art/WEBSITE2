import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { PageHeader, PrimaryLink, Card, Label, Input, DangerButton, EmptyState } from "@/components/ui";
import { bulkDeleteContacts, deleteAllOrgData } from "./actions";
import SelectAllCheckbox from "./SelectAllCheckbox";
import DeleteSelectedButton from "./DeleteSelectedButton";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; resetError?: string; bulkDeleted?: string }>;
}) {
  const { reset, resetError, bulkDeleted } = await searchParams;
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

      {reset === "done" ? (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 border border-emerald-100">
          All {org.name} data has been deleted.
        </div>
      ) : null}
      {bulkDeleted ? (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 border border-emerald-100">
          Deleted {bulkDeleted} contact{bulkDeleted === "1" ? "" : "s"} (and their leads).
        </div>
      ) : null}
      {resetError ? (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">
          {resetError}
        </div>
      ) : null}

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet." />
      ) : (
        <form action={bulkDeleteContacts}>
          <Card className="overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium w-8">
                    <SelectAllCheckbox />
                  </th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Phone</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        name="contactIds"
                        value={c.id}
                        aria-label={`Select ${c.name}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
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
          <div className="mb-8">
            <DeleteSelectedButton />
          </div>
        </form>
      )}

      <Card className="p-6 border-red-200">
        <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
          <AlertTriangle size={18} />
          Danger zone
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Permanently deletes every contact, lead, job, task, invoice, calendar event, and
          survey for <strong>{org.name}</strong>. Staff and wages are not affected. This cannot
          be undone.
        </p>
        <form action={deleteAllOrgData} className="flex items-end gap-3 flex-wrap">
          <div className="w-64">
            <Label>Type &ldquo;{org.name}&rdquo; to confirm</Label>
            <Input name="confirmation" placeholder={org.name} required />
          </div>
          <DangerButton type="submit">Delete all {org.name} data</DangerButton>
        </form>
      </Card>
    </div>
  );
}
