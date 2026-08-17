import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/servant")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { userId: data.user.id };
  },
  component: ServantLayout,
});

function ServantLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background px-5 pb-20 pt-6">
      <Outlet />
      <BottomNav base="/servant" />
    </div>
  );
}