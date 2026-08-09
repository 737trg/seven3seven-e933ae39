REVOKE ALL ON FUNCTION public.monthly_leaderboard(date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.monthly_leaderboard(date) TO service_role;