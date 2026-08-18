import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarDays, Minus, NotebookPen, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { PRAYER_COUNTERS, SACRAMENTS, formatDate, todayISO } from "@/lib/thanwy";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/student/notebook")({
  head: () => ({
    meta: [
      { title: "النوتة الروحية | اجتماعات ثانوي" },
      { name: "description", content: "سجّل صلواتك اليومية وتابع التزامك خلال الأسبوع." },
      { property: "og:title", content: "النوتة الروحية | اجتماعات ثانوي" },
      { property: "og:description", content: "سجّل صلواتك اليومية وتابع التزامك خلال الأسبوع." },
    ],
  }),
  component: NotebookPage,
});

function NotebookPage() {
  const { data: me } = useAuth();
  const qc = useQueryClient();
  const today = todayISO();

  const { data: rows = [] } = useQuery({
    queryKey: ["journal", "prayers", me?.userId],
    enabled: Boolean(me?.userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("spiritual_journal")
        .select("id, entry_date, prayers")
        .eq("student_id", me!.userId)
        .eq("kind", "prayers")
        .order("entry_date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const todayRow = rows.find((r) => r.entry_date === today);
  const todayPrayers = (todayRow?.prayers ?? {}) as Record<string, unknown>;

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [dates, setDates] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      const c: Record<string, number> = {};
      PRAYER_COUNTERS.forEach((p) => {
        const v = todayPrayers[p.key];
        c[p.key] = typeof v === "number" ? v : 0;
      });
      const d: Record<string, string> = {};
      SACRAMENTS.forEach((s) => {
        const v = todayPrayers[s.key];
        d[s.key] = typeof v === "string" ? v : "";
      });
      setCounts(c);
      setDates(d);
    }
  }, [todayRow?.id, dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async () => {
      const prayersObj: Record<string, string | number> = {};
      PRAYER_COUNTERS.forEach((p) => {
        prayersObj[p.key] = counts[p.key] ?? 0;
      });
      SACRAMENTS.forEach((s) => {
        if (dates[s.key]) prayersObj[s.key] = dates[s.key]!;
      });
      const prayers: Json = prayersObj;
      const { error } = await supabase.from("spiritual_journal").upsert(
        {
          student_id: me!.userId,
          kind: "prayers",
          entry_date: today,
          prayers,
        },
        { onConflict: "student_id,kind,entry_date" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setDirty(false);
      toast.success("تم حفظ صلوات اليوم في النوتة الروحية");
      void qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: () => toast.error("تعذر الحفظ، حاول مرة أخرى"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-end gap-2">
        <h1 className="text-xl font-bold text-foreground">النوتة الروحية</h1>
        <NotebookPen className="h-5 w-5 text-secondary" />
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-right text-sm text-muted-foreground">
          صلوات اليوم — {formatDate(today)}
        </p>
        <ul className="space-y-2">
          {PRAYER_COUNTERS.map((p) => (
            <li key={p.key}>
              <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setDirty(true);
                      setCounts((c) => ({
                        ...c,
                        [p.key]: Math.max(0, (c[p.key] ?? 0) - 1),
                      }));
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold text-foreground">
                    {counts[p.key] ?? 0}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setDirty(true);
                      setCounts((c) => ({
                        ...c,
                        [p.key]: (c[p.key] ?? 0) + 1,
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-foreground">{p.label}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-border pt-3">
          <p className="mb-2 text-right text-sm text-muted-foreground">الأسرار المقدسة</p>
          <ul className="space-y-2">
            {SACRAMENTS.map((s) => {
              const selectedDate = dates[s.key] ? new Date(dates[s.key] + "T00:00:00") : undefined;
              return (
                <li key={s.key}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="press flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm"
                      >
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {selectedDate ? formatDate(dates[s.key]!) : s.label}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(day) => {
                          setDirty(true);
                          if (day) {
                            const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                            setDates((d) => ({ ...d, [s.key]: iso }));
                          } else {
                            setDates((d) => ({ ...d, [s.key]: "" }));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </li>
              );
            })}
          </ul>
        </div>

        <Button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="press w-full rounded-full bg-secondary py-3 text-sm font-semibold text-secondary-foreground disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> تأكيد
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-right text-base font-semibold text-foreground">آخر الأيام</h2>
        {rows.length === 0 ? (
          <p className="text-right text-sm text-muted-foreground">لا يوجد سجل بعد</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => {
              const p = (r.prayers ?? {}) as Record<string, unknown>;
              let total = 0;
              PRAYER_COUNTERS.forEach((x) => {
                const v = p[x.key];
                if (typeof v === "number") total += v;
              });
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 text-sm"
                >
                  <span className="text-secondary">{total} صلاة</span>
                  <span className="text-muted-foreground">{formatDate(r.entry_date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
