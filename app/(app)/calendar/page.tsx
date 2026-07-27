import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatDateShort } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, Badge, EmptyState } from "@/components/ui";

type AgendaItem = {
  id: string;
  date: Date;
  title: string;
  type: string;
  jobTitle?: string | null;
};

export default async function CalendarPage() {
  const org = await getActiveOrg();
  const [events, scheduledJobs] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { orgId: org.id },
      include: { job: true },
      orderBy: { date: "asc" },
    }),
    prisma.job.findMany({
      where: { orgId: org.id, scheduledDate: { not: null } },
      orderBy: { scheduledDate: "asc" },
    }),
  ]);

  const items: AgendaItem[] = [
    ...events.map((e) => ({
      id: `event-${e.id}`,
      date: e.date,
      title: e.title,
      type: e.type ?? "Event",
      jobTitle: e.job?.title,
    })),
    ...scheduledJobs.map((j) => ({
      id: `job-${j.id}`,
      date: j.scheduledDate as Date,
      title: j.title,
      type: "Job scheduled",
      jobTitle: null,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const now = new Date();
  const upcoming = items.filter((i) => i.date >= now);
  const past = items.filter((i) => i.date < now).reverse();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Calendar"
        action={
          <PrimaryLink href="/calendar/new">
            <Plus size={16} /> New Event
          </PrimaryLink>
        }
      />

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Upcoming</h2>
      {upcoming.length === 0 ? (
        <EmptyState message="Nothing scheduled." />
      ) : (
        <Card className="divide-y divide-slate-100 mb-8">
          {upcoming.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <div className="font-medium text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDateShort(item.date)}
                  {item.jobTitle ? ` · ${item.jobTitle}` : ""}
                </div>
              </div>
              <Badge>{item.type}</Badge>
            </div>
          ))}
        </Card>
      )}

      {past.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Past</h2>
          <Card className="divide-y divide-slate-100">
            {past.slice(0, 20).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 opacity-60">
                <div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatDateShort(item.date)}
                    {item.jobTitle ? ` · ${item.jobTitle}` : ""}
                  </div>
                </div>
                <Badge>{item.type}</Badge>
              </div>
            ))}
          </Card>
        </>
      ) : null}
    </div>
  );
}
