import { getActiveOrg, getActiveOrgSlug } from "@/lib/org";
import OrgSwitcher from "./OrgSwitcher";
import SidebarNav from "./SidebarNav";
import MobileMenu from "./MobileMenu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [org, slug] = await Promise.all([getActiveOrg(), getActiveOrgSlug()]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 print:hidden">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {slug}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 leading-tight truncate">
                {org.name}
              </div>
              <div className="text-xs text-slate-500 leading-tight">CRM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrgSwitcher active={slug} />
            <MobileMenu orgName={org.name} />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] py-4 print:hidden">
          <SidebarNav />
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
