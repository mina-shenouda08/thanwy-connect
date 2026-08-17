import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { booksFor, formatDate, testamentLabel, todayISO } from "@/lib/thanwy";

export const Route = createFileRoute("/student/bible")({
  head: () => ({
    meta: [
      { title: "الكتاب المقدس | اجتماعات ثانوي" },
      { name: "description", content: "سجّل قراءاتك اليومية وسلّم واجبات درس الكتاب." },
      { property: "og:title", content: "الكتاب المقدس | اجتماعات ثانوي" },
      { property: "og:description", content: "سجّل قراءاتك اليومية وسلّم واجبات درس الكتاب." },
    ],
  }),
  component: BiblePage,
});

const field = "w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground outline-none";

function BiblePage() {
  const { data: me } = useAuth();
  const qc = useQueryClient();
  const [testament, setTestament] = useState("new");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");

  const { data: readings = [] } = useQuery({
    queryKey: ["journal", "reading", me?.userId],
    enabled: Boolean(me?.userId),
    queryFn: async () => {
      const { data } = await supabase
        .from("spiritual_journal")
        .select("id, entry_date, testament, book, chapter")
        .eq("student_id", me!.userId)
        .eq("kind", "reading")
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["book-study", me?.profile?.grade_level],
    enabled: Boolean(me?.profile?.grade_level),
    queryFn: async () => {
      const { data } = await supabase
        .from("book_study_assignments")
        .select("id, title, description, due_date")
        .eq("grade_level", me!.profile!.grade_level!)
        .order("due_date", { ascending: true });
      return data ?? [];
    },
  });

  const addReading = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("spiritual_journal").insert({
        student_id: me!.userId,
        kind: "reading",
        entry_date: todayISO(),
        testament,
        book,
        chapter: Number(chapter),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBook("");
      setChapter("");
      toast.success("تم تسجيل القراءة");
      void qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: () => toast.error("تعذر تسجيل القراءة"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-end gap-2">
        <h1 className="text-xl font-bold text-foreground">الكتاب المقدس</h1>
        <BookOpen className="h-5 w-5 text-secondary" />
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 text-right">
        <h2 className="text-base font-semibold text-foreground">تسجيل قراءة</h2>
        <select
          aria-label="العهد"
          value={testament}
          onChange={(e) => {
            setTestament(e.target.value);
            setBook("");
          }}
          className={field}
        >
          <option value="new">عهد جديد</option>
          <option value="old">عهد قديم</option>
        </select>
        <select
          aria-label="السفر"
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className={field}
        >
          <option value="">اختر السفر</option>
          {booksFor(testament).map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          aria-label="الإصحاح"
          type="number"
          min={1}
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="رقم الإصحاح"
          className={field}
        />
        <button
          type="button"
          disabled={!book || !chapter || addReading.isPending}
          onClick={() => addReading.mutate()}
          className="press flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3 text-sm font-semibold text-secondary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> إضافة
        </button>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-right text-base font-semibold text-foreground">آخر القراءات</h2>
        {readings.length === 0 ? (
          <p className="text-right text-sm text-muted-foreground">لا توجد قراءات</p>
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

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-right text-base font-semibold text-foreground">درس الكتاب</h2>
        {assignments.length === 0 ? (
          <p className="text-right text-sm text-muted-foreground">لا توجد واجبات حالياً</p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((a) => (
              <li key={a.id} className="rounded-xl bg-surface px-4 py-3 text-right">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                )}
                {a.due_date && (
                  <p className="mt-1 text-xs text-primary-soft">
                    التسليم: {formatDate(a.due_date)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}