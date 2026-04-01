import { createClient } from "./client.js";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.drivingschooltv.com";

export async function signUpWithEmail({ email, password, name, transmission }) {
  const supabase = createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: appUrl,
      data: {
        name: name?.trim() || "",
        transmission: transmission || "manual",
      },
    },
  });
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