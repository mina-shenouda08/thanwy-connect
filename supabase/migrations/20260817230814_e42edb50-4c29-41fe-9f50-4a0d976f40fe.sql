REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.my_grade() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.grade_of(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.supervises(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_grade() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.supervises(uuid) TO authenticated;