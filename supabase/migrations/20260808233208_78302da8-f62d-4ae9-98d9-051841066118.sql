REVOKE EXECUTE ON FUNCTION public.has_active_membership(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_club_access(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.monthly_leaderboard(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_membership(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_club_access(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.monthly_leaderboard(date) TO authenticated;