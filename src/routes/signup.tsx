import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail, RotateCcw, User, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GRADES } from "@/lib/thanwy";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إنشاء حساب جديد | اجتماعات ثانوي" },
      { name: "description", content: "أنشئ حسابك في اجتماع ثانوي واختر مرحلتك وفصلك." },
      { property: "og:title", content: "إنشاء حساب جديد | اجتماعات ثانوي" },
      { property: "og:description", content: "أنشئ حسابك في اجتماع ثانوي واختر مرحلتك وفصلك." },
    ],
  }),
  component: SignupPage,
});

const fieldWrap = "flex items-center gap-3 rounded-2xl bg-surface px-4 py-3";
const fieldInput =
  "w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground";

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [classId, setClassId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes", grade],
    enabled: Boolean(grade),
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .eq("grade_level", grade)
        .order("name");
      return data ?? [];
    },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullName.trim().length < 3) return toast.error("أدخل الاسم الرباعي");
    if (!grade) return toast.error("اختر المرحلة الدراسية");
    if (password.length < 6) return toast.error("كلمة المرور 6 أحرف على الأقل");
    if (password !== confirm) return toast.error("كلمة المرور غير متطابقة");

    setLoading(true);
    const authEmail = email.trim() || `${crypto.randomUUID().slice(0, 12)}@thanwy.local`;
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "تعذر إنشاء الحساب");
      return;
    }
    if (!data.session) {
      setLoading(false);
      toast.success("تم إنشاء الحساب، راجع بريدك لتأكيد الحساب");
      return;
    }
    await supabase.from("users").insert({
      id: data.user.id,
      full_name: fullName.trim(),
      email: email.trim() || null,
      grade_level: grade,
      class_id: classId || null,
    });
    await supabase.from("user_roles").insert({ user_id: data.user.id, role: "student" });
    setLoading(false);
    void navigate({ to: "/student" });
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-10">
      <header className="relative flex items-center justify-center py-5">
        <span className="text-sm font-semibold text-primary-soft">اجتماعات ثانوي</span>
        <Link to="/login" aria-label="رجوع" className="press absolute right-0 text-foreground">
          <ArrowLeft className="h-6 w-6 rotate-180" />
        </Link>
      </header>

      <div className="space-y-2 py-6 text-center">
        <h1 className="soft-glow text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
        <p className="soft-glow text-xs text-muted-foreground">
          املأ بياناتك للانضمام إلى اجتماع ثانوي
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="name">
            الاسم الرباعي
          </label>
          <div className={fieldWrap}>
            <input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className={fieldInput}
            />
            <User className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="email">
            البريد الإلكتروني (اختياري)
          </label>
          <div className={fieldWrap}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className={fieldInput}
            />
            <Mail className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm text-muted-foreground">المرحلة الدراسية / الفصل</span>
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldWrap}>
              <select
                aria-label="المرحلة الدراسية"
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setClassId("");
                }}
                className={`${fieldInput} appearance-none`}
              >
                <option value="">اختر المرحلة</option>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
            </div>
            <div className={fieldWrap}>
              <select
                aria-label="الفصل"
                value={classId}
                disabled={!grade}
                onChange={(e) => setClassId(e.target.value)}
                className={`${fieldInput} appearance-none disabled:opacity-50`}
              >
                <option value="">اختر الفصل</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Users className="h-5 w-5 shrink-0 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="pw">
            كلمة المرور
          </label>
          <div className={fieldWrap}>
            <button
              type="button"
              aria-label="إظهار كلمة المرور"
              onClick={() => setShow((s) => !s)}
              className="shrink-0 text-muted-foreground"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <input
              id="pw"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={fieldInput}
            />
            <Lock className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="pw2">
            تأكيد كلمة المرور
          </label>
          <div className={fieldWrap}>
            <button
              type="button"
              aria-label="إظهار تأكيد كلمة المرور"
              onClick={() => setShow((s) => !s)}
              className="shrink-0 text-muted-foreground"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <input
              id="pw2"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={fieldInput}
            />
            <RotateCcw className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="press w-full rounded-full bg-primary-soft py-3.5 text-sm font-semibold text-primary-soft-foreground disabled:opacity-60"
        >
          {loading ? "جاري الإنشاء…" : "إنشاء الحساب"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="font-semibold text-primary-soft">
            سجل دخولك
          </Link>
        </p>
      </form>
    </main>
  );
}