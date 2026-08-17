import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, LogOut } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EventCard, type EventRow } from "@/components/EventCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { signOut, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, todayISO } from "@/lib/thanwy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/servant/")({
  head: () => ({
    meta: [
      { title: "لوحة الخادم | اجتماعات ثانوي" },
      { name: "description", content: "تابع الفعاليات القادمة ونسبة الحضور لمخدوميك." },
      { property: "og:title", content: "لوحة الخادم | اجتماعات ثانوي" },
      { property: "og:description", content: "تابع الفعاليات القادمة ونسبة الحضور لمخدوميك." },
    ],
  }),
  component: ServantHome,
});

function ServantHome() {
  const { data: me } = useAuth();
  const [selected, setSelected] = useState<EventRow | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["events", "servant-upcoming"],
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

  const { data: chart = [] } = useQuery({
    queryKey: ["attendance", "overview"],
    queryFn: async () => {
      const { data: recent } = await supabase
        .from("events")
        .select("id, title, event_date")
        .lte("event_date", todayISO())
        .order("event_date", { ascending: false })
        .limit(5);
      const list = recent ?? [];
      const out: { name: string; present: number }[] = [];
      for (const ev of list) {
        const { count } = await supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("event_id", ev.id)
          .eq("present", true);
        out.push({ name: ev.title.slice(0, 10), present: count ?? 0 });
      }
      return out.reverse();
    },
  });

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={me?.profile?.full_name ?? "—"}
        grade={me?.profile?.grade_level}
        className="خادم"
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
        <h2 className="text-right text-base font-semibold text-foreground">نظرة على الحضور</h2>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Bar dataKey="present" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
            <p>الحالة: {selected?.status === "cancelled" ? "ملغى" : "مؤكد"}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}