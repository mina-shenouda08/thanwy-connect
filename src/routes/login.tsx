import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | اجتماعات ثانوي" },
      { name: "description", content: "سجّل الدخول للوصول إلى حسابك في اجتماع ثانوي." },
      { property: "og:title", content: "تسجيل الدخول | اجتماعات ثانوي" },
      { property: "og:description", content: "سجّل الدخول للوصول إلى حسابك في اجتماع ثانوي." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isServant = (roles ?? []).some((r) => r.role === "servant");
    setLoading(false);
    void navigate({ to: isServant ? "/servant" : "/student" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 bg-background px-5 py-10">
      <Logo size={140} />
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">أهلاً بك في اجتماع ثانوي</h1>
        <p className="text-sm text-muted-foreground">يرجى تسجيل الدخول للوصول إلى حسابك</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full space-y-5 rounded-3xl border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-muted-foreground">
            البريد الإلكتروني
          </label>
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Mail className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-muted-foreground">
            كلمة المرور
          </label>
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label="إظهار كلمة المرور"
              className="shrink-0 text-muted-foreground"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <input
              id="password"
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Lock className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast("تواصل مع أمين الاجتماع لإعادة تعيين كلمة المرور")}
          className="text-xs text-primary-soft"
        >
          نسيت كلمة المرور؟
        </button>

        <button
          type="submit"
          disabled={loading}
          className="press flex w-full items-center justify-center gap-2 rounded-full bg-primary-soft py-3.5 text-sm font-semibold text-primary-soft-foreground disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" />
          {loading ? "جاري الدخول…" : "تسجيل الدخول"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        لسة معملتش حساب؟{" "}
        <Link to="/signup" className="font-semibold text-primary-soft">
          إنشاء حساب
        </Link>
      </p>
    </main>
  );
}