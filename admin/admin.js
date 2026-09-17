import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const PROJECT_REF = "yulnanfbthhbokdskpnp";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const PUBLISHABLE_KEY = "sb_publishable_zufxpFoWrFcUPRy8KZ8yiQ_pXcWp0Bm";
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
});

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = v => new Intl.DateTimeFormat("ro-RO", { timeZone:"Europe/Bucharest", dateStyle:"medium", timeStyle:"short" }).format(new Date(v));
const langNames = { ro:"Română", en:"Engleză", de:"Germană", fr:"Franceză", es:"Spaniolă", ru:"Rusă", "zh-CN":"Chineză simplificată" };
const statusLabels = { new:"Noi", read:"Citite", replied:"Răspunse", spam:"Spam", closed:"Închise" };
let currentView = "dashboard", signupData = [], messageData = [], currentMessage = null, searchTimer = null, entering = false;

function show(id, on = true) { const e = $(id); if (e) e.classList.toggle("hidden", !on); }
function setLoginMessage(text, error = false) { const e = $("loginMsg"); e.textContent = text || ""; e.style.color = error ? "#c33b3b" : ""; }
function removeProjectAuthStorage(storage) { try { for (let i = storage.length - 1; i >= 0; i--) { const key = storage.key(i); if (key && (key.includes(PROJECT_REF) || key.startsWith("supabase.auth."))) storage.removeItem(key); } } catch {} }
function taggedError(code, message, original) { const e = new Error(message || code); e.code = code; e.original = original; return e; }

async function api(body) {
  const { data, error } = await supabase.functions.invoke("admin-api", { body });
  if (error) {
    let code = "function_http_error";
    let detail = error.message || "Apelul către admin-api a eșuat.";
    try {
      const response = error.context;
      if (response && typeof response.clone === "function") {
        const payload = await response.clone().json();
        if (payload?.error) code = String(payload.error);
        if (payload?.message) detail = String(payload.message);
      }
    } catch {}
    throw taggedError(code, detail, error);
  }
  if (!data?.ok) throw taggedError(String(data?.error || "server_error"), String(data?.error || "server_error"));
  return data.data;
}

function adminErrorText(e) {
  const code = String(e?.code || "").toLowerCase();
  const msg = String(e?.message || "");
  if (code === "unauthorized") return "Eroare A1 — sesiunea de autentificare nu a fost acceptată de server (unauthorized).";
  if (code === "forbidden") return "Eroare A2 — autentificarea a reușit, dar contul nu are rolul admin activ în admin_users (forbidden).";
  if (code === "server_error") return "Eroare A3 — serverul a întâmpinat o eroare internă în timpul verificării administratorului (server_error).";
  if (code === "function_http_error" || /non-2xx|edge function/i.test(msg)) return `Eroare A4 — funcția admin-api a răspuns cu o eroare HTTP. Detaliu: ${msg}`;
  if (/failed to fetch|network|load failed/i.test(msg)) return `Eroare A5 — browserul nu a putut comunica cu admin-api. Detaliu: ${msg}`;
  if (/auth session missing|session/i.test(msg)) return `Eroare A6 — sesiunea Supabase lipsește sau nu poate fi citită. Detaliu: ${msg}`;
  return `Eroare A9 — eroare neclasificată la verificarea accesului Admin. Detaliu: ${msg || "necunoscut"}`;
}

function dashboardErrorText(e) {
  const code = String(e?.code || e?.message || "necunoscut");
  return `Accesul de administrator a fost confirmat, dar Dashboard-ul nu s-a putut încărca. Cod: ${code}`;
}

async function login() {
  const email = $("loginEmail").value.trim().toLowerCase();
  if (!email || !email.includes("@")) { setLoginMessage("Introdu o adresă de e-mail validă.", true); return; }
  $("loginBtn").disabled = true;
  setLoginMessage("Trimit linkul de acces...");
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin/`, shouldCreateUser: true } });
  $("loginBtn").disabled = false;
  if (error) { setLoginMessage(`Eroare L1 — linkul nu a putut fi trimis: ${error.message}`, true); return; }
  setLoginMessage("Linkul de acces a fost trimis. Verifică e-mailul și deschide linkul pe acest dispozitiv.");
}

async function enterApp() {
  if (entering) return;
  entering = true;
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      show("appView", false); show("loginView", true);
      setLoginMessage(`Eroare S1 — Supabase nu a putut citi sesiunea: ${sessionError.message}`, true);
      return;
    }
    if (!sessionData?.session) {
      show("appView", false); show("loginView", true);
      setLoginMessage("Eroare S2 — linkul a fost deschis, dar nu există o sesiune Supabase activă în browser.", true);
      return;
    }

    let me;
    try {
      me = await api({ action: "me" });
    } catch (e) {
      console.error("Admin access check failed", e);
      show("appView", false); show("loginView", true);
      setLoginMessage(adminErrorText(e), true);
      return;
    }

    $("adminEmail").textContent = me.email || "Administrator";
    show("loginView", false);
    show("appView", true);
    history.replaceState(null, "", "/admin/");

    try {
      await loadDashboard();
    } catch (e) {
      console.error("Dashboard load failed", e);
      $("pageSub").textContent = dashboardErrorText(e);
      alert(dashboardErrorText(e));
    }
  } finally {
    entering = false;
  }
}

async function secureLogout() {
  const btn = $("logoutBtn");
  if (!confirm("Deconectare securizată? Vor fi închise toate sesiunile de administrator active pentru acest cont.")) return;
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "Se închide sesiunea...";
  try {
    const { error } = await supabase.auth.signOut({ scope:"global" });
    if (error) throw error;
    removeProjectAuthStorage(localStorage); removeProjectAuthStorage(sessionStorage);
    history.replaceState(null, "", "/admin/");
    location.replace("/admin/?logged_out=1");
  } catch (e) {
    console.error(e);
    alert(`Eroare O1 — deconectarea securizată nu a putut fi confirmată. Detaliu: ${e?.message || "necunoscut"}`);
    btn.disabled = false; btn.textContent = old;
  }
}

function nav(view) {
  currentView = view;
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  ["dashboard","signups","messages"].forEach(v => show(`${v}View`, v === view));
  const titles = {
    dashboard:["Dashboard","Indicatori utili pentru pre-lansarea IsThere4You"],
    signups:["Preînscrieri","Evidență secundară; adresele sunt mascate implicit"],
    messages:["Mesaje","Mesajele primite prin formularul de contact"],
  };
  $("pageTitle").textContent = titles[view][0];
  $("pageSub").textContent = titles[view][1];
  refresh();
}

async function loadDashboard() {
  const d = await api({ action:"dashboard" });
  $("sTotal").textContent = d.signups.total; $("s24").textContent = d.signups.last24h; $("s7").textContent = d.signups.last7d; $("mNew").textContent = d.messages.byStatus.new || 0;
  $("betaOptIn").textContent = d.signups.betaOptIn ?? 0; $("betaRate").textContent = `${d.signups.betaRate ?? 0}% din înscriși`;
  $("foundingTotal").textContent = d.signups.founding ?? 0; $("verifiedTotal").textContent = d.signups.verified ?? 0; $("verificationRate").textContent = `${d.signups.verificationRate ?? 0}% din înscriși`;
  const g = d.signups.growth7d; $("growth7d").textContent = g === null || g === undefined ? "—" : `${g > 0 ? "+" : ""}${g}%`;
  $("responseRate").textContent = `${d.messages.responseRate ?? 0}%`;
  const n = d.messages.byStatus.new || 0; $("newBadge").textContent = n; show("newBadge", n > 0);
  const maxLang = Math.max(1, ...Object.values(d.languages));
  $("langStats").innerHTML = Object.entries(d.languages).map(([k,v]) => `<div class="statLine"><span>${esc(langNames[k] || k)}</span><div class="bar"><i style="width:${Math.round(v/maxLang*100)}%"></i></div><b>${v}</b></div>`).join("");
  const maxSt = Math.max(1, ...Object.values(d.messages.byStatus));
  $("statusStats").innerHTML = Object.entries(d.messages.byStatus).map(([k,v]) => `<div class="statLine"><span>${statusLabels[k] || k}</span><div class="bar"><i style="width:${Math.round(v/maxSt*100)}%"></i></div><b>${v}</b></div>`).join("");
}

async function revealSignupEmail(id, button, label) {
  if (button.dataset.revealed === "1") { label.textContent = button.dataset.masked || "***"; button.textContent = "Arată"; button.dataset.revealed = "0"; delete button.dataset.full; return; }
  button.disabled = true;
  try { const d = await api({action:"reveal_email",kind:"signup",id}); button.dataset.masked = label.textContent; button.dataset.full = d.email; label.textContent = d.email; button.textContent = "Ascunde"; button.dataset.revealed = "1"; }
  catch (e) { console.error(e); alert(`Eroare P1 — adresa nu a putut fi afișată. ${e?.code || e?.message || ""}`); }
  finally { button.disabled = false; }
}

async function loadSignups() {
  const d = await api({action:"signups",limit:100,search:$("signupSearch").value.trim(),language:$("signupLang").value});
  signupData = d.rows;
  $("signupRows").innerHTML = d.rows.map(r => `<tr><td><div class="emailCell"><span class="maskedEmail">${esc(r.email_masked)}</span><button class="linkBtn revealSignup" data-id="${esc(r.id)}" type="button">Arată</button></div></td><td>${esc(langNames[r.language] || r.language)}</td><td>${esc(fmt(r.created_at))}</td><td>${r.beta_consent_at ? "Da" : "Nu"}</td><td>${r.founding_member_eligible ? "Da" : "Nu"}</td><td><span class="pill">${esc(r.reward_status)}</span></td></tr>`).join("");
  show("signupEmpty", d.rows.length === 0);
  $("signupRows").querySelectorAll(".revealSignup").forEach(button => button.onclick = e => { e.stopPropagation(); revealSignupEmail(button.dataset.id, button, button.parentElement.querySelector(".maskedEmail")); });
}

async function loadMessages() {
  const d = await api({action:"messages",limit:100,search:$("messageSearch").value.trim(),status:$("messageStatus").value});
  messageData = d.rows;
  $("messageRows").innerHTML = d.rows.map(r => `<tr data-id="${esc(r.id)}"><td><b>${esc(r.name || "—")}</b><br><small>${esc(r.email_masked)}</small></td><td>${esc(r.subject)}</td><td>${esc(langNames[r.language] || r.language)}</td><td><span class="pill ${esc(r.status)}">${esc(r.status)}</span></td><td>${esc(fmt(r.created_at))}</td></tr>`).join("");
  show("messageEmpty", d.rows.length === 0);
  $("messageRows").querySelectorAll("tr").forEach(tr => tr.onclick = () => openMessage(tr.dataset.id));
}

async function refresh() {
  $("refreshBtn").disabled = true;
  try { if (currentView === "dashboard") await loadDashboard(); else if (currentView === "signups") await loadSignups(); else await loadMessages(); }
  catch (e) { console.error(e); alert(`Eroare D1 — nu am putut încărca datele. Cod: ${e?.code || e?.message || "necunoscut"}`); }
  finally { $("refreshBtn").disabled = false; }
}

async function openMessage(id) {
  currentMessage = await api({action:"message",id});
  $("detailEmail").textContent = currentMessage.email_masked; $("revealMessageEmail").textContent = "Arată e-mailul"; $("revealMessageEmail").dataset.revealed = "0";
  $("detailSubject").textContent = currentMessage.subject; $("detailName").textContent = currentMessage.name || "Fără nume"; $("detailLang").textContent = langNames[currentMessage.language] || currentMessage.language; $("detailDate").textContent = fmt(currentMessage.created_at); $("detailBody").textContent = currentMessage.message; $("detailStatus").value = currentMessage.status; $("replyDraft").value = "";
  $("replyHint").textContent = "Răspunsul va fi trimis prin infrastructura securizată IsThere4You. Vei confirma expedierea înainte de trimitere.";
  show("messageModal", true); if (currentView === "messages") loadMessages(); loadDashboard();
}

async function revealMessageEmail() {
  if (!currentMessage) return;
  const btn = $("revealMessageEmail");
  if (btn.dataset.revealed === "1") { $("detailEmail").textContent = currentMessage.email_masked; btn.textContent = "Arată e-mailul"; btn.dataset.revealed = "0"; delete currentMessage.email; return; }
  btn.disabled = true;
  try { const d = await api({action:"reveal_email",kind:"message",id:currentMessage.id}); currentMessage.email = d.email; $("detailEmail").textContent = d.email; btn.textContent = "Ascunde e-mailul"; btn.dataset.revealed = "1"; }
  catch (e) { console.error(e); alert(`Eroare M1 — adresa nu a putut fi afișată. ${e?.code || e?.message || ""}`); }
  finally { btn.disabled = false; }
}

async function changeStatus() { if (!currentMessage) return; const status = $("detailStatus").value; const d = await api({action:"message_status",id:currentMessage.id,status}); currentMessage.status = d.status; if (currentView === "messages") await loadMessages(); await loadDashboard(); }

function generateDraft() {
  if (!currentMessage) return;
  const name = currentMessage.name?.trim();
  const templates = {
    ro:`Bună${name ? ` ${name}` : ""},\n\nÎți mulțumim pentru mesaj și pentru interesul acordat IsThere4You. Am primit solicitarea ta privind „${currentMessage.subject}” și o analizăm. Revenim cu informațiile necesare cât mai curând.\n\nCu bine,\nEchipa IsThere4You`,
    en:`Hello${name ? ` ${name}` : ""},\n\nThank you for your message and for your interest in IsThere4You. We received your request regarding “${currentMessage.subject}” and we are reviewing it. We will get back to you with the relevant information as soon as possible.\n\nKind regards,\nIsThere4You Team`,
    de:`Hallo${name ? ` ${name}` : ""},\n\nvielen Dank für deine Nachricht und dein Interesse an IsThere4You. Wir haben deine Anfrage zum Thema „${currentMessage.subject}” erhalten und prüfen sie. Wir melden uns so bald wie möglich mit den entsprechenden Informationen.\n\nViele Grüße\nIsThere4You Team`,
    fr:`Bonjour${name ? ` ${name}` : ""},\n\nMerci pour votre message et pour l’intérêt que vous portez à IsThere4You. Nous avons bien reçu votre demande concernant « ${currentMessage.subject} » et nous l’examinons. Nous reviendrons vers vous avec les informations utiles dès que possible.\n\nCordialement,\nL’équipe IsThere4You`,
    es:`Hola${name ? ` ${name}` : ""},\n\nGracias por tu mensaje y por tu interés en IsThere4You. Hemos recibido tu consulta sobre «${currentMessage.subject}» y la estamos revisando. Te responderemos con la información correspondiente lo antes posible.\n\nUn saludo,\nEquipo IsThere4You`,
    ru:`Здравствуйте${name ? `, ${name}` : ""}!\n\nСпасибо за ваше сообщение и интерес к IsThere4You. Мы получили ваш запрос по теме «${currentMessage.subject}» и рассматриваем его. Мы ответим с необходимой информацией в ближайшее время.\n\nС уважением,\nКоманда IsThere4You`,
    "zh-CN":`您好${name ? `，${name}` : ""}！\n\n感谢您的留言以及对 IsThere4You 的关注。我们已收到您关于“${currentMessage.subject}”的咨询，正在进行处理。我们会尽快向您回复相关信息。\n\n此致\nIsThere4You 团队`,
  };
  $("replyDraft").value = templates[currentMessage.language] || templates.en;
}

async function sendReply() {
  if (!currentMessage) return;
  const reply = $("replyDraft").value.trim();
  if (reply.length < 2) { $("replyHint").textContent = "Scrie sau generează mai întâi un răspuns."; return; }
  const target = currentMessage.email || currentMessage.email_masked;
  if (!confirm(`Trimiți acest răspuns către ${target}?`)) return;
  const btn = $("sendReplyBtn"), old = btn.textContent;
  btn.disabled = true; btn.textContent = "Se trimite..."; $("replyHint").textContent = "Trimit răspunsul...";
  try { const d = await api({action:"send_reply",id:currentMessage.id,reply}); currentMessage.status = d.status; $("detailStatus").value = "replied"; $("replyHint").textContent = "Răspuns trimis cu succes. Mesajul a fost marcat ca răspuns."; if (currentView === "messages") await loadMessages(); await loadDashboard(); }
  catch (e) { console.error(e); $("replyHint").textContent = `Eroare R1 — e-mailul nu a putut fi trimis. Cod: ${e?.code || e?.message || "necunoscut"}`; }
  finally { btn.disabled = false; btn.textContent = old; }
}

async function deleteMessage() {
  if (!currentMessage) return;
  const shown = $("detailEmail").textContent || "acest utilizator";
  if (!confirm(`Ștergi DEFINITIV mesajul de la ${shown}?\n\nMesajul va fi eliminat din Supabase și nu va putea fi recuperat. Copia primită deja pe e-mail nu este ștearsă.`)) return;
  const btn = $("deleteMessageBtn"), old = btn.textContent;
  btn.disabled = true; btn.textContent = "Se șterge...";
  try { await api({action:"delete_message",id:currentMessage.id}); show("messageModal", false); currentMessage = null; if (currentView === "messages") await loadMessages(); await loadDashboard(); alert("Mesajul a fost șters definitiv din Supabase."); }
  catch (e) { console.error(e); alert(`Eroare X1 — mesajul nu a putut fi șters. Cod: ${e?.code || e?.message || "necunoscut"}`); }
  finally { btn.disabled = false; btn.textContent = old; }
}

function exportCsv() {
  const rows = [["email_masked","language","created_at","beta_consent","founding_member","reward_status"], ...signupData.map(r => [r.email_masked,r.language,r.created_at,r.beta_consent_at?"yes":"no",r.founding_member_eligible?"yes":"no",r.reward_status])];
  const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8"})); a.download = `isthere4you-preinscrieri-mascat-${new Date().toISOString().slice(0,10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

$("loginBtn").onclick = login;
$("loginEmail").onkeydown = e => { if (e.key === "Enter") login(); };
$("logoutBtn").onclick = secureLogout;
$("refreshBtn").onclick = refresh;
document.querySelectorAll(".nav").forEach(b => b.onclick = () => nav(b.dataset.view));
$("signupSearch").oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadSignups, 300); };
$("signupLang").onchange = loadSignups;
$("messageSearch").oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadMessages, 300); };
$("messageStatus").onchange = loadMessages;
$("closeModal").onclick = () => show("messageModal", false);
$("messageModal").onclick = e => { if (e.target === $("messageModal")) show("messageModal", false); };
$("revealMessageEmail").onclick = revealMessageEmail;
$("detailStatus").onchange = changeStatus;
$("draftBtn").onclick = generateDraft;
$("copyBtn").onclick = async () => { try { await navigator.clipboard.writeText($("replyDraft").value); $("replyHint").textContent = "Schița a fost copiată."; } catch { $("replyHint").textContent = "Nu am putut copia automat."; } };
$("sendReplyBtn").onclick = sendReply;
$("deleteMessageBtn").onclick = deleteMessage;
$("exportCsv").onclick = exportCsv;

const { data:{ session }, error: initialSessionError } = await supabase.auth.getSession();
if (initialSessionError) {
  show("loginView", true); show("appView", false);
  setLoginMessage(`Eroare S0 — sesiunea inițială nu a putut fi citită: ${initialSessionError.message}`, true);
} else if (session) {
  await enterApp();
} else {
  show("loginView", true); show("appView", false);
}

supabase.auth.onAuthStateChange((event, sessionNow) => {
  if (event === "SIGNED_IN" && sessionNow) setTimeout(() => enterApp(), 0);
  if (event === "SIGNED_OUT") { show("appView", false); show("loginView", true); }
});
