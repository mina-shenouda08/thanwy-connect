import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Bookmark, QrCode as QrIcon, Users, CalendarDays } from "lucide-react";

const STUDENT_ITEMS = [
  { to: "/student", icon: Home, label: "الرئيسية", exact: true },
  { to: "/student/bible", icon: BookOpen, label: "الكتاب" },
  { to: "/student/notebook", icon: Bookmark, label: "النوتة" },
  { to: "/student/qr", icon: QrIcon, label: "الحضور" },
] as const;

const SERVANT_ITEMS = [
  { to: "/servant", icon: Home, label: "الرئيسية", exact: true },
  { to: "/servant/events", icon: CalendarDays, label: "الفعاليات" },
  { to: "/servant/students", icon: Users, label: "المخدومين" },
  { to: "/servant/qr", icon: QrIcon, label: "المسح" },
] as const;

export function BottomNav({ base }: { base: "/student" | "/servant" }) {
  const items = base === "/student" ? STUDENT_ITEMS : SERVANT_ITEMS;
  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t border-border">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {items.map(({ to, icon: Icon, label, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: Boolean(exact) }}
            className="press flex flex-col items-center gap-1 text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}