import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "اجتماعات ثانوي — متابعة روحية للمرحلة الثانوية" },
      {
        name: "description",
        content: "سجّل حضورك، نوتتك الروحية، وقراءات الكتاب المقدس في مكان واحد.",
      },
      { property: "og:title", content: "اجتماعات ثانوي" },
      {
        property: "og:description",
        content: "سجّل حضورك، نوتتك الروحية، وقراءات الكتاب المقدس في مكان واحد.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { data, isPending } = useAuth();

  useEffect(() => {
    if (isPending) return;
    if (!data) void navigate({ to: "/login" });
    else void navigate({ to: data.role === "servant" ? "/servant" : "/student" });
  }, [data, isPending, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <Logo size={120} />
      <h1 className="text-lg font-semibold text-foreground">اجتماعات ثانوي</h1>
      <p className="text-sm text-muted-foreground">جاري التحميل…</p>
    </main>
  );
}
