import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://yulnanfbthhbokdskpnp.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_zufxpFoWrFcUPRy8KZ8yiQ_pXcWp0Bm";
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

function initDeleteMessage() {
  const rows = document.getElementById("messageRows");
  const modal = document.getElementById("messageModal");
  const actions = document.querySelector(".replyActions");
  if (!rows || !modal || !actions || document.getElementById("deleteMessageBtn")) return;

  rows.addEventListener("click", (event) => {
    const tr = event.target.closest("tr[data-id]");
    if (tr) modal.dataset.messageId = tr.dataset.id || "";
  }, true);

  const button = document.createElement("button");
  button.id = "deleteMessageBtn";
  button.type = "button";
  button.textContent = "Șterge definitiv";
  button.style.cssText = "border:1px solid #e0b8b8;background:#fff5f5;color:#a32727;border-radius:12px;padding:11px 14px;cursor:pointer;font-weight:700";
  actions.appendChild(button);

  button.addEventListener("click", async () => {
    const id = modal.dataset.messageId;
    if (!id) { alert("Nu am putut identifica mesajul selectat."); return; }
    const email = document.getElementById("detailEmail")?.textContent || "acest utilizator";
    if (!confirm(`Ștergi DEFINITIV mesajul de la ${email}?\n\nMesajul va fi eliminat din Supabase și nu va putea fi recuperat. Copia primită deja pe e-mail nu este ștearsă.`)) return;

    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Se șterge...";
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", { body: { action: "delete_message", id } });
      if (error) throw error;
      if (!data?.ok || !data?.data?.deleted) throw new Error(data?.error || "delete_failed");
      modal.classList.add("hidden");
      modal.dataset.messageId = "";
      const refresh = document.getElementById("refreshBtn");
      if (refresh) refresh.click();
      alert("Mesajul a fost șters definitiv din Supabase.");
    } catch (error) {
      console.error("Ștergere mesaj eșuată", error);
      alert("Mesajul nu a putut fi șters. Nu s-a făcut nicio ștergere parțială. Reîncearcă.");
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDeleteMessage);
else initDeleteMessage();