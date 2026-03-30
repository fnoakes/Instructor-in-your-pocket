import { createClient } from "./client.js";

export async function signUpWithEmail({ email, password }) {
  const supabase = createClient();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail({ email, password }) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return { data: { user: null }, error: null };
  }

  if (!session) {
    return { data: { user: null }, error: null };
  }

  return supabase.auth.getUser();
}
