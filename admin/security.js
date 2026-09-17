import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const PROJECT_REF = "yulnanfbthhbokdskpnp";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const PUBLISHABLE_KEY = "sb_publishable_zufxpFoWrFcUPRy8KZ8yiQ_pXcWp0Bm";
const authClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
});

function removeProjectAuthStorage(storage) {
  try {
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.includes(PROJECT_REF) || key.startsWith("supabase.auth.")) storage.removeItem(key);
    }
  } catch (e) {
    console.warn("Nu am putut curăța complet storage-ul local", e);
  }
}

async function secureGlobalLogout() {
  const button = document.getElementById("logoutBtn");
  if (!button) return;
  if (!confirm("Deconectare securizată? Vor fi închise toate sesiunile de administrator active pentru acest cont.")) return;

  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Se închide sesiunea...";

  try {
    const { error } = await authClient.auth.signOut({ scope: "global" });
    if (error) throw error;

    removeProjectAuthStorage(localStorage);
    removeProjectAuthStorage(sessionStorage);
    history.replaceState(null, "", "/admin/");
    location.replace("/admin/?logged_out=1");
  } catch (error) {
    console.error("Deconectarea globală a eșuat", error);
    alert("Deconectarea securizată nu a putut fi confirmată de server. Sesiunea NU este considerată închisă. Verifică conexiunea și încearcă din nou.");
    button.disabled = false;
    button.textContent = oldText;
  }
}

window.addEventListener("load", async () => {
  const button = document.getElementById("logoutBtn");
  if (button) {
    button.classList.add("logoutSecure");
    button.textContent = "Deconectare securizată";
    button.title = "Închide toate sesiunile de administrator și șterge autentificarea locală";
    button.onclick = secureGlobalLogout;
  }

  try {
    const { data: { session } } = await authClient.auth.getSession();
    if (session && (location.hash || /[?&](code|access_token|refresh_token)=/.test(location.search))) {
      history.replaceState(null, "", "/admin/");
    }
  } catch {}
});