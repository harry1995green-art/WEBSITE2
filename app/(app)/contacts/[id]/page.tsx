import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatDateShort } from "@/lib/constants";
import { Card, Label, Input, Textarea, SubmitButton } from "@/components/ui";
import { updateContact } from "../actions";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getActiveOrg();
  const contact = await prisma.contact.findFirst({
    where: { id, orgId: org.id },
    include: {
      leads: { orderBy: { createdAt: "desc" } },
      jobs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!contact) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{contact.name}</h1>
        <p className="text-slate-500 mt-1">Added {formatDateShort(contact.createdAt)}</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Details</h2>
        <form action={updateContact.bind(null, contact.id)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" defaultValue={contact.name} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" defaultValue={contact.email ?? ""} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" defaultValue={contact.phone ?? ""} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input name="address" defaultValue={contact.address ?? ""} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" rows={4} defaultValue={contact.notes ?? ""} />
          </div>
          <SubmitButton>Save changes</SubmitButton>
        </form>
      </Card>

      {contact.leads.length > 0 ? (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-3">Leads</h2>
          <ul className="space-y-2 text-sm">
            {contact.leads.map((l) => (
              <li key={l.id}>
                <Link href={`/leads/${l.id}`} className="text-slate-700 hover:underline">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {contact.jobs.length > 0 ? (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-3">Jobs</h2>
          <ul className="space-y-2 text-sm">
            {contact.jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="text-slate-700 hover:underline">
                  {j.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
