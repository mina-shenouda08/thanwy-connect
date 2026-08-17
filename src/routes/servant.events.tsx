import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarPlus, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_TYPES, GRADES, formatDate, formatTime, todayISO } from "@/lib/thanwy";

export const Route = createFileRoute("/servant/events")({
  head: () => ({
    meta: [
      { title: "إدارة الفعاليات | اجتماعات ثانوي" },
      { name: "description", content: "أضف الفعاليات وحدّد مواعيدها أو ألغِها بسهولة." },
      { property: "og:title", content: "إدارة الفعاليات | اجتماعات ثانوي" },
      { property: "og:description", content: "أضف الفعاليات وحدّد مواعيدها أو ألغِها بسهولة." },
    ],
  }),
  component: ServantEvents,
});

const field = "w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground outline-none";

function ServantEvents() {
  const { data: me } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState(EVENT_TYPES[0].value as string);
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [grade, setGrade] = useState("");

  const { data: events = [] } = useQuery({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, type, event_date, start_time, end_time, location, status, grade_level")
        .order("event_date", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        title: title.trim(),
        type,
        event_date: date,
        start_time: start || null,
        end_time: end || null,
        location: location.trim() || null,
        grade_level: grade || null,
        created_by: me?.userId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setLocation("");
      toast.success("تمت إضافة الفعالية");
      void qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("تعذر إضافة الفعالية"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("events").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["events"] }),
    onError: () => toast.error("تعذر تحديث الحالة"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-end gap-2">
        <h1 className="text-xl font-bold text-foreground">الفعاليات</h1>
        <CalendarPlus className="h-5 w-5 text-secondary" />
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 text-right">
        <h2 className="text-base font-semibold text-foreground">إضافة فعالية</h2>
        <input
          aria-label="اسم الفعالية"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="اسم الفعالية"
          className={field}
        />
        <select aria-label="النوع" value={type} onChange={(e) => setType(e.target.value)} className={field}>
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          aria-label="التاريخ"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="من"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={field}
          />
          <input
            aria-label="إلى"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={field}
          />
        </div>
        <input
          aria-label="المكان"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="المكان"
          className={field}
        />
        <select
          aria-label="المرحلة"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className={field}
        >
          <option value="">كل المراحل</option>
          {GRADES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!title.trim() || create.isPending}
          onClick={() => create.mutate()}
          className="press w-full rounded-full bg-primary-soft py-3 text-sm font-semibold text-primary-soft-foreground disabled:opacity-50"
        >
          إضافة
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-right text-base font-semibold text-foreground">كل الفعاليات</h2>
        {events.length === 0 && (
          <p className="text-right text-sm text-muted-foreground">لا توجد فعاليات</p>
        )}
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="space-y-2 rounded-2xl border border-border bg-card p-4 text-right">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${e.status === "cancelled" ? "text-destructive" : "text-secondary"}`}
                >
                  {e.status === "cancelled" ? "ملغى" : "مؤكد"}
                </span>
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(e.event_date)} {formatTime(e.start_time)}
                {e.location ? ` — ${e.location}` : ""}
              </p>
              <button
                type="button"
                onClick={() =>
                  setStatus.mutate({
                    id: e.id,
                    status: e.status === "cancelled" ? "scheduled" : "cancelled",
                  })
                }
                className="press flex w-full items-center justify-center gap-2 rounded-full border border-border py-2 text-xs text-muted-foreground"
              >
                {e.status === "cancelled" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> إعادة التأكيد
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" /> إلغاء الفعالية
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}