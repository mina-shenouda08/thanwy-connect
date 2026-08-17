import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, LogOut } from "lucide-react";
import { useState } from "react";
import { EventCard, type EventRow } from "@/components/EventCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { useAuth, signOut } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PRAYERS, formatDate, testamentLabel, todayISO } from "@/lib/thanwy";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "حسابي | اجتماعات ثانوي" },
      { name: "description", content: "نظرة سريعة على فعالياتك ونوتتك الروحية وقراءاتك." },
      { property: "og:title", content: "حسابي | اجتماعات ثانوي" },
      { property: "og:description", content: "نظرة سريعة على فعالياتك ونوتتك الروحية وقراءاتك." },
    ],
  }),
  component: StudentHome,
});

function StudentHome() {
  const { data: me } = useAuth();
  const [selected, setSelected] = useState<EventRow | null>(null);

  const { data: className } = useQuery({
    queryKey: ["class", me?.profile?.class_id],
    enabled: Boolean(me?.profile?.class_id),
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("name")
        .eq("id", me!.profile!.class_id!)
        .maybeSingle();
      return data?.name ?? null;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, type, event_date, start_time, end_time, location, status")
        .gte("event_date", todayISO())
        .order("event_date")
        .limit(10);
      return (data ?? []) as EventRow[];
    },
  });

  const { data: journal = [] } = useQuery({
    queryKey: ["journal", "recent", me?.userId],
    enabled: Boolean(me?.userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("spiritual_journal")
        .select("id, kind, entry_date, prayers, testament, book, chapter")
        .eq("student_id", me!.userId)
        .order("entry_date", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const prayerDays = journal.filter((r) => r.kind === "prayers").slice(0, 4);
  const readings = journal.filter((r) => r.kind === "reading").slice(0, 3);

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={me?.profile?.full_name ?? "—"}
        grade={me?.profile?.grade_level}
        className={className ?? null}
        {...(me?.userId ? { userId: me.userId } : {})}
      />

      <section className="space-y-4">
        <h2 className="flex items-center justify-end gap-2 text-base font-semibold text-foreground">
          الفعاليات القادمة <CalendarDays className="h-4 w-4 text-secondary" />
        </h2>
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد فعاليات قادمة</p>
          )}
          {events.map((e) => (
            <EventCard key={e.id} event={e} onSelect={setSelected} />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <Link to="/student/notebook" className="text-xs font-semibold text-primary-soft">
            عرض الكل
          </Link>
          <h2 className="text-base font-semibold text-foreground">النوتة الروحية</h2>
        </div>
        {prayerDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تُسجل صلوات بعد</p>
        ) : (
          <ul className="space-y-2">
            {prayerDays.map((d) => {
              const p = (d.prayers ?? {}) as Record<string, boolean>;
              const done = PRAYERS.filter((x) => p[x.key]).length;
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 text-sm"
                >
                  <span className="text-secondary">
                    {done}/{PRAYERS.length}
                  </span>
                  <span className="text-muted-foreground">{formatDate(d.entry_date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <Link to="/student/bible" className="text-xs font-semibold text-primary-soft">
            عرض الكل
          </Link>
          <h2 className="text-base font-semibold text-foreground">آخر القراءات</h2>
        </div>
        {readings.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تُسجل قراءات بعد</p>
        ) : (
          <ul className="space-y-2">
            {readings.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 text-sm"
              >
                <span className="text-xs text-muted-foreground">{formatDate(r.entry_date)}</span>
                <span className="text-foreground">
                  {testamentLabel(r.testament)} — {r.book} {r.chapter}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => void signOut().then(() => (window.location.href = "/login"))}
        className="press flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm text-muted-foreground"
      >
        <LogOut className="h-4 w-4" /> تسجيل الخروج
      </button>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="text-right">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected ? formatDate(selected.event_date) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>المكان: {selected?.location ?? "—"}</p>
            <p>
              الوقت: {selected?.start_time?.slice(0, 5) ?? "—"}
              {selected?.end_time ? ` – ${selected.end_time.slice(0, 5)}` : ""}
            </p>
            <p>الحالة: {selected?.status === "cancelled" ? "ملغى" : "مؤكد"}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}