import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://yulnanfbthhbokdskpnp.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_zufxpFoWrFcUPRy8KZ8yiQ_pXcWp0Bm";
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, { auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true } });
const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = v => new Intl.DateTimeFormat("ro-RO", { timeZone:"Europe/Bucharest", dateStyle:"medium", timeStyle:"short" }).format(new Date(v));
const langNames = { ro:"Română", en:"Engleză", de:"Germană", fr:"Franceză", es:"Spaniolă", ru:"Rusă", "zh-CN":"Chineză simplificată" };
let currentView = "dashboard", signupData = [], messageData = [], currentMessage = null, searchTimer = null;

function show(id, on=true){ $(id).classList.toggle("hidden", !on); }
function setLoginMessage(text, error=false){ const e=$("loginMsg"); e.textContent=text||""; e.style.color=error?"#c33b3b":""; }
async function api(body){
  const { data, error } = await supabase.functions.invoke("admin-api", { body });
  if(error) throw error;
  if(!data?.ok) throw new Error(data?.error || "server_error");
  return data.data;
}

async function login(){
  const email=$("loginEmail").value.trim().toLowerCase();
  if(!email || !email.includes("@")){ setLoginMessage("Introdu o adresă de e-mail validă.", true); return; }
  $("loginBtn").disabled=true; setLoginMessage("Trimit linkul de acces...");
  const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo:`${location.origin}/admin/`, shouldCreateUser:true } });
  $("loginBtn").disabled=false;
  if(error){ setLoginMessage(`Nu am putut trimite linkul: ${error.message}`, true); return; }
  setLoginMessage("Linkul de acces a fost trimis. Verifică e-mailul și deschide linkul pe acest dispozitiv.");
}

async function enterApp(session){
  try{
    const me=await api({action:"me"});
    $("adminEmail").textContent=me.email||"Administrator";
    show("loginView",false); show("appView",true);
    await loadDashboard();
  }catch(e){
    console.error(e);
    await supabase.auth.signOut();
    show("appView",false); show("loginView",true);
    setLoginMessage("Contul autentificat nu are acces de administrator.", true);
  }
}

async function logout(){ await supabase.auth.signOut(); location.replace("/admin/"); }

function nav(view){
  currentView=view;
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  ["dashboard","signups","messages"].forEach(v=>show(`${v}View`,v===view));
  const titles={dashboard:["Dashboard","Situația pre-lansării IsThere4You"],signups:["Preînscrieri","Utilizatorii înscriși înainte de lansare"],messages:["Mesaje","Mesajele primite prin formularul de contact"]};
  $("pageTitle").textContent=titles[view][0]; $("pageSub").textContent=titles[view][1];
  refresh();
}

async function loadDashboard(){
  const d=await api({action:"dashboard"});
  $("sTotal").textContent=d.signups.total; $("s24").textContent=d.signups.last24h; $("s7").textContent=d.signups.last7d; $("mNew").textContent=d.messages.byStatus.new||0;
  const n=d.messages.byStatus.new||0; $("newBadge").textContent=n; show("newBadge",n>0);
  const maxLang=Math.max(1,...Object.values(d.languages));
  $("langStats").innerHTML=Object.entries(d.languages).map(([k,v])=>`<div class="statLine"><span>${esc(langNames[k]||k)}</span><div class="bar"><i style="width:${Math.round(v/maxLang*100)}%"></i></div><b>${v}</b></div>`).join("");
  const statusLabels={new:"Noi",read:"Citite",replied:"Răspunse",spam:"Spam",closed:"Închise"};
  const maxSt=Math.max(1,...Object.values(d.messages.byStatus));
  $("statusStats").innerHTML=Object.entries(d.messages.byStatus).map(([k,v])=>`<div class="statLine"><span>${statusLabels[k]||k}</span><div class="bar"><i style="width:${Math.round(v/maxSt*100)}%"></i></div><b>${v}</b></div>`).join("");
}

async function loadSignups(){
  const d=await api({action:"signups",limit:100,search:$("signupSearch").value.trim(),language:$("signupLang").value}); signupData=d.rows;
  $("signupRows").innerHTML=d.rows.map(r=>`<tr><td>${esc(r.email)}</td><td>${esc(langNames[r.language]||r.language)}</td><td>${esc(fmt(r.created_at))}</td><td>${r.founding_member_eligible?"Da":"Nu"}</td><td><span class="pill">${esc(r.reward_status)}</span></td></tr>`).join("");
  show("signupEmpty",d.rows.length===0);
}

async function loadMessages(){
  const d=await api({action:"messages",limit:100,search:$("messageSearch").value.trim(),status:$("messageStatus").value}); messageData=d.rows;
  $("messageRows").innerHTML=d.rows.map(r=>`<tr data-id="${esc(r.id)}"><td><b>${esc(r.name||"—")}</b><br><small>${esc(r.email)}</small></td><td>${esc(r.subject)}</td><td>${esc(langNames[r.language]||r.language)}</td><td><span class="pill ${esc(r.status)}">${esc(r.status)}</span></td><td>${esc(fmt(r.created_at))}</td></tr>`).join("");
  show("messageEmpty",d.rows.length===0);
  $("messageRows").querySelectorAll("tr").forEach(tr=>tr.onclick=()=>openMessage(tr.dataset.id));
}

async function refresh(){
  $("refreshBtn").disabled=true;
  try{ if(currentView==="dashboard") await loadDashboard(); else if(currentView==="signups") await loadSignups(); else await loadMessages(); }
  catch(e){ console.error(e); alert("Nu am putut încărca datele. Reîncearcă."); }
  finally{ $("refreshBtn").disabled=false; }
}

async function openMessage(id){
  currentMessage=await api({action:"message",id});
  $("detailEmail").textContent=currentMessage.email; $("detailSubject").textContent=currentMessage.subject; $("detailName").textContent=currentMessage.name||"Fără nume"; $("detailLang").textContent=langNames[currentMessage.language]||currentMessage.language; $("detailDate").textContent=fmt(currentMessage.created_at); $("detailBody").textContent=currentMessage.message; $("detailStatus").value=currentMessage.status; $("replyDraft").value=""; show("messageModal",true);
  if(currentView==="messages") loadMessages(); loadDashboard();
}

async function changeStatus(){
  if(!currentMessage)return;
  const status=$("detailStatus").value;
  const d=await api({action:"message_status",id:currentMessage.id,status}); currentMessage.status=d.status;
  if(currentView==="messages") await loadMessages(); await loadDashboard();
}

function generateDraft(){
  if(!currentMessage)return;
  const name=currentMessage.name?.trim();
  const templates={
    ro:`Bună${name?` ${name}`:""},\n\nÎți mulțumim pentru mesaj și pentru interesul acordat IsThere4You. Am primit solicitarea ta privind „${currentMessage.subject}” și o analizăm. Revenim cu informațiile necesare cât mai curând.\n\nCu bine,\nEchipa IsThere4You`,
    en:`Hello${name?` ${name}`:""},\n\nThank you for your message and for your interest in IsThere4You. We received your request regarding “${currentMessage.subject}” and we are reviewing it. We will get back to you with the relevant information as soon as possible.\n\nKind regards,\nIsThere4You Team`,
    de:`Hallo${name?` ${name}`:""},\n\nvielen Dank für deine Nachricht und dein Interesse an IsThere4You. Wir haben deine Anfrage zum Thema „${currentMessage.subject}“ erhalten und prüfen sie. Wir melden uns so bald wie möglich mit den entsprechenden Informationen.\n\nViele Grüße\nIsThere4You Team`,
    fr:`Bonjour${name?` ${name}`:""},\n\nMerci pour votre message et pour l’intérêt que vous portez à IsThere4You. Nous avons bien reçu votre demande concernant « ${currentMessage.subject} » et nous l’examinons. Nous reviendrons vers vous avec les informations utiles dès que possible.\n\nCordialement,\nL’équipe IsThere4You`,
    es:`Hola${name?` ${name}`:""},\n\nGracias por tu mensaje y por tu interés en IsThere4You. Hemos recibido tu consulta sobre «${currentMessage.subject}» y la estamos revisando. Te responderemos con la información correspondiente lo antes posible.\n\nUn saludo,\nEquipo IsThere4You`,
    ru:`Здравствуйте${name?`, ${name}`:""}!\n\nСпасибо за ваше сообщение и интерес к IsThere4You. Мы получили ваш запрос по теме «${currentMessage.subject}» и рассматриваем его. Мы ответим с необходимой информацией в ближайшее время.\n\nС уважением,\nКоманда IsThere4You`,
    "zh-CN":`您好${name?`，${name}`:""}！\n\n感谢您的留言以及对 IsThere4You 的关注。我们已收到您关于“${currentMessage.subject}”的咨询，正在进行处理。我们会尽快向您回复相关信息。\n\n此致\nIsThere4You 团队`
  };
  $("replyDraft").value=templates[currentMessage.language]||templates.en;
}

function exportCsv(){
  const rows=[["email","language","created_at","founding_member","reward_status"],...signupData.map(r=>[r.email,r.language,r.created_at,r.founding_member_eligible?"yes":"no",r.reward_status])];
  const csv=rows.map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"})); a.download=`isthere4you-preinscrieri-${new Date().toISOString().slice(0,10)}.csv`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

$("loginBtn").onclick=login; $("loginEmail").onkeydown=e=>{if(e.key==="Enter")login()}; $("logoutBtn").onclick=logout; $("refreshBtn").onclick=refresh; document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>nav(b.dataset.view)); $("signupSearch").oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadSignups,300)}; $("signupLang").onchange=loadSignups; $("messageSearch").oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadMessages,300)}; $("messageStatus").onchange=loadMessages; $("closeModal").onclick=()=>show("messageModal",false); $("messageModal").onclick=e=>{if(e.target===$("messageModal"))show("messageModal",false)}; $("detailStatus").onchange=changeStatus; $("draftBtn").onclick=generateDraft; $("copyBtn").onclick=()=>navigator.clipboard.writeText($("replyDraft").value); $("exportCsv").onclick=exportCsv;

const { data:{ session } }=await supabase.auth.getSession(); if(session) await enterApp(session); else { show("loginView",true); show("appView",false); }
supabase.auth.onAuthStateChange(async(event,sessionNow)=>{ if(event==="SIGNED_IN"&&sessionNow) await enterApp(sessionNow); if(event==="SIGNED_OUT"){show("appView",false);show("loginView",true);} });