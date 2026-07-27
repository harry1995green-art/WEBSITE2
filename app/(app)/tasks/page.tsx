import { Plus, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatDateShort } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, EmptyState } from "@/components/ui";
import { toggleTaskStatus } from "./actions";

export default async function TasksPage() {
  const org = await getActiveOrg();
  const tasks = await prisma.task.findMany({
    where: { orgId: org.id },
    include: { job: true, contact: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.filter((t) => t.status === "OPEN").length} open`}
        action={
          <PrimaryLink href="/tasks/new">
            <Plus size={16} /> New Task
          </PrimaryLink>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState message="No tasks yet." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-5 py-4">
              <form action={toggleTaskStatus.bind(null, task.id)}>
                <button
                  type="submit"
                  aria-label="Toggle done"
                  className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                    task.status === "DONE"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 text-transparent hover:border-slate-400"
                  }`}
                >
                  <Check size={14} />
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium ${
                    task.status === "DONE" ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  {task.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {task.dueDate ? `Due ${formatDateShort(task.dueDate)}` : "No due date"}
                  {task.job ? ` · ${task.job.title}` : ""}
                  {task.contact ? ` · ${task.contact.name}` : ""}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
