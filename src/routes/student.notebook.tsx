import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PRAYERS, formatDate, todayISO } from "@/lib/thanwy";

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
  const todayPrayers = (todayRow?.prayers ?? {}) as Record<string, boolean>;

  const toggle = useMutation({
    mutationFn: async (key: string) => {
      const next = { ...todayPrayers, [key]: !todayPrayers[key] };
      const { error } = await supabase.from("spiritual_journal").upsert(
        {
          student_id: me!.userId,
          kind: "prayers",
          entry_date: today,
          prayers: next,
        },
        { onConflict: "student_id,kind,entry_date" },
      );
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["journal"] }),
    onError: () => toast.error("تعذر الحفظ، حاول مرة أخرى"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-end gap-2">
        <h1 className="text-xl font-bold text-foreground">النوتة الروحية</h1>
        <NotebookPen className="h-5 w-5 text-secondary" />
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-right text-sm text-muted-foreground">صلوات اليوم — {formatDate(today)}</p>
        <ul className="space-y-2">
          {PRAYERS.map((p) => {
            const done = Boolean(todayPrayers[p.key]);
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => toggle.mutate(p.key)}
                  className="press flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                      done ? "border-secondary bg-secondary text-secondary-foreground" : "border-border"
                    }`}
                  >
                    {done && <Check className="h-4 w-4" />}
                  </span>
                  <span className="text-foreground">{p.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-right text-base font-semibold text-foreground">آخر الأيام</h2>
        {rows.length === 0 ? (
          <p className="text-right text-sm text-muted-foreground">لا يوجد سجل بعد</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => {
              const p = (r.prayers ?? {}) as Record<string, boolean>;
              const done = PRAYERS.filter((x) => p[x.key]).length;
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-2 text-sm"
                >
                  <span className="text-secondary">
                    {done}/{PRAYERS.length}
                  </span>
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