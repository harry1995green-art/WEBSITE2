import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  CheckSquare,
  PoundSterling,
  Calendar,
  Wallet,
  UserCog,
  FilePlus,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/contacts", label: "Contacts", icon: UserCircle },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/finance", label: "Finance", icon: PoundSterling },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/wages", label: "Wages", icon: Wallet },
  { href: "/staff", label: "Staff", icon: UserCog },
];

export const SURVEY_NAV: NavItem[] = [
  { href: "/surveys/new", label: "New Survey", icon: FilePlus },
  { href: "/surveys", label: "Survey Reports", icon: FileText },
];
