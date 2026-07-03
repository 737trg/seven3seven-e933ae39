
-- Install the on_auth_user_created trigger so every new sign-up gets a
-- matching profiles + user_roles row via the existing handle_new_user()
-- function. The function was defined but the trigger was never attached.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
