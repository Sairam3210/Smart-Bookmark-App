import Googleauth from "./Googleauth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function GoogleLoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log( { user });
  return <Googleauth user={user} />;
}