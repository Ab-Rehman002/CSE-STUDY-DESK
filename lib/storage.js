import { createClient } from "@supabase/supabase-js";

// Set these in a local .env file (copy .env.example) and in your Vercel
// project's Environment Variables. Never hardcode real values here again —
// that's how they end up committed to git history.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing Supabase config — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See .env.example."
  );
}

// The anon key is meant to be public — it ships in the browser bundle no
// matter what. It is NOT what protects this app. Every real rule about who
// can read or write data lives in Postgres Row-Level Security policies.
// See supabase/security_hardening.sql — run it before deploying.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getDocData(collectionName, id) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", `${collectionName}:${id}`)
    .maybeSingle();
  if (error) { console.error("getDocData error:", error); return null; }
  return data ? data.value : null;
}

export async function setDocData(collectionName, id, value) {
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key: `${collectionName}:${id}`, value, updated_at: new Date().toISOString() });
  if (error) {
    console.error("setDocData error:", error);
    throw error;
  }
}

export async function deleteDocData(collectionName, id) {
  const { error } = await supabase
    .from("kv_store")
    .delete()
    .eq("key", `${collectionName}:${id}`);
  if (error) {
    console.error("deleteDocData error:", error);
    throw error;
  }
}

export async function getAllDocs(collectionName) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("key, value")
    .like("key", `${collectionName}:%`);
  if (error) { console.error("getAllDocs error:", error); return {}; }
  const result = {};
  (data || []).forEach((row) => {
    const id = row.key.slice(collectionName.length + 1);
    result[id] = row.value;
  });
  return result;
}

// --- Community resources -------------------------------------------------
// A separate table on purpose. Anyone can post here without logging in —
// that's the intended feature, not a bug. Keeping it out of kv_store means
// the open "anyone can insert" policy this needs can never accidentally
// apply to courses, notices, or semesters.
export async function getCommunityPosts(courseId) {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, title, url, author, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getCommunityPosts error:", error); return []; }
  return data || [];
}

export async function addCommunityPost({ courseId, title, url, author }) {
  const { error } = await supabase.from("community_posts").insert({
    course_id: courseId,
    title: title.slice(0, 120),
    url: url.slice(0, 500),
    author: (author || "Anonymous").slice(0, 60),
  });
  if (error) throw error;
}

export async function deleteCommunityPost(id) {
  const { error } = await supabase.from("community_posts").delete().eq("id", id);
  if (error) throw error;
}

// --- Admin auth ------------------------------------------------------------
export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
