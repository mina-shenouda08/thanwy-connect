import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QrCode as QrIcon } from "lucide-react";
import { QrCode } from "@/components/QrCode";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/thanwy";

export const Route = createFileRoute("/student/qr")({
  head: () => ({
    meta: [
      { title: "كود الحضور | اجتماعات ثانوي" },
      { name: "description", content: "اعرض كود الحضور الخاص بك وتابع سجل حضورك." },
      { property: "og:title", content: "كود الحضور | اجتماعات ثانوي" },
      { property: "og:description", content: "اعرض كود الحضور الخاص بك وتابع سجل حضورك." },
    ],
  }),
  component: StudentQrPage,
});

function StudentQrPage() {
  const { data: me } = useAuth();

  const { data: rows = [] } = useQuery({
    queryKey: ["attendance", me?.userId],
    enabled: Boolean(me?.userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("id, status, created_at, events(title, event_date)")
        .eq("student_id", me!.userId)
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const present = rows.filter((r) => r.status === "present").length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-end gap-2">
        <h1 className="text-xl font-bold text-foreground">كود الحضور</h1>
        <QrIcon className="h-5 w-5 text-secondary" />
      </header>

      <section className="flex flex-col items-center gap-3 rounded-3xl bg-tertiary p-6 text-tertiary-foreground">
        {me?.userId && <QrCode value={me.userId} size={200} />}
        <p className="text-sm font-semibold">{me?.profile?.full_name}</p>
        <p className="text-xs opacity-80">اعرض هذا الكود للخادم لتسجيل حضورك</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{present}</p>
          <p className="text-xs text-muted-foreground">مرات الحضور</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{rows.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي السجلات</p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-right text-base font-semibold text-foreground">سجل الحضور</h2>
        {rows.length === 0 ? (
          <p className="text-right text-sm text-muted-foreground">لا يوجد سجل حضور</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 text-sm"
              >
                <span className="text-xs text-secondary">
                  {r.status === "present" ? "حاضر" : "غائب"}
                </span>
                <span className="text-foreground">
                  {r.events?.title ?? "فعالية"}{" "}
                  <span className="text-xs text-muted-foreground">
                    {r.events?.event_date ? formatDate(r.events.event_date) : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}