import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Bookmark, QrCode as QrIcon } from "lucide-react";

export function BottomNav({ base }: { base: "/student" | "/servant" }) {
  const items = [
    { to: base, icon: Home, label: "الرئيسية", exact: true },
    { to: `${base}/bible`, icon: BookOpen, label: "الكتاب" },
    { to: `${base}/notebook`, icon: Bookmark, label: "النوتة" },
    { to: `${base}/qr`, icon: QrIcon, label: "الحضور" },
  ];
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