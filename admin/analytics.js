import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://yulnanfbthhbokdskpnp.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_zufxpFoWrFcUPRy8KZ8yiQ_pXcWp0Bm";
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

const $ = id => document.getElementById(id);

async function loadAnalytics() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  try {
    const { data, error } = await supabase.functions.invoke("admin-api", { body: { action: "dashboard" } });
    if (error || !data?.ok) throw error || new Error(data?.error || "dashboard_error");
    const d = data.data;
    $("betaOptIn").textContent = d.signups.betaOptIn ?? 0;
    $("betaRate").textContent = `${d.signups.betaRate ?? 0}% din înscriși`;
    $("foundingTotal").textContent = d.signups.founding ?? 0;
    $("verifiedTotal").textContent = d.signups.verified ?? 0;
    $("verificationRate").textContent = `${d.signups.verificationRate ?? 0}% din înscriși`;
    const growth = d.signups.growth7d;
    $("growth7d").textContent = growth === null || growth === undefined ? "—" : `${growth > 0 ? "+" : ""}${growth}%`;
    $("responseRate").textContent = `${d.messages.responseRate ?? 0}%`;
  } catch (e) {
    console.error("Admin analytics", e);
  }
}

document.getElementById("refreshBtn")?.addEventListener("click", () => setTimeout(loadAnalytics, 50));
document.querySelector('[data-view="dashboard"]')?.addEventListener("click", () => setTimeout(loadAnalytics, 50));
supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_IN" && session) setTimeout(loadAnalytics, 100); });
setTimeout(loadAnalytics, 150);