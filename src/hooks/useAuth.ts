import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  grade_level: string | null;
  class_id: string | null;
  address: string | null;
  avatar_url: string | null;
};

export function useAuth() {
  const qc = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        qc.invalidateQueries({ queryKey: ["auth"] });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("users")
          .select("id, full_name, email, grade_level, class_id, address, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const isServant = (roles ?? []).some((r) => r.role === "servant");
      return {
        userId: user.id,
        profile: (profile ?? null) as Profile | null,
        role: isServant ? ("servant" as const) : ("student" as const),
      };
    },
    staleTime: 30_000,
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}