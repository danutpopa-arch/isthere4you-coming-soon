(()=>{
"use strict";
const BASE_URL="https://isthere4you.com/";
const REF_API="https://yulnanfbthhbokdskpnp.supabase.co/functions/v1/prelaunch-referral";
const STORAGE_KEY="it4y-referral-code";
const COPY={
  ro:{button:"Distribuie IsThere4You",copied:"Link copiat ✓",text:"Am găsit o idee interesantă: IsThere4You — ajutor local atunci când tu nu poți fi acolo.",examples:["De exemplu: ai plecat din oraș și ți-ai dat seama că ai uitat pașaportul, cheile sau un obiect important la hotel? IsThere4You te-ar putea conecta cu cineva aflat acolo, care să te ajute.","De exemplu: ai găsit online un apartament, o mașină sau un obiect la sute de kilometri distanță? IsThere4You te-ar putea conecta cu cineva aflat aproape, care să vadă locul sau obiectul înainte să faci drumul.","De exemplu: vrei să afli dacă un magazin este deschis, dacă este aglomerat sau dacă un produs mai este pe stoc într-un alt oraș? IsThere4You te-ar putea conecta cu cineva aflat acolo."],refTitle:"Invită pe cineva",refBody:"Acesta este linkul tău personal. Vezi câte persoane îl deschid și câte se înscriu prin el.",copy:"Copiază",copiedLink:"Copiat ✓",clicks:"deschideri",signups:"înscrieri",shareInvite:"Distribuie invitația"},
  en:{button:"Share IsThere4You",copied:"Link copied ✓",text:"I found an interesting idea: IsThere4You — local help when you cannot be there yourself.",examples:["For example: left town and realized you forgot your passport, keys, or another important item at the hotel? IsThere4You could connect you with someone who is there and may be able to help.","For example: found an apartment, a car, or an item online hundreds of kilometres away? IsThere4You could connect you with someone nearby who may be able to see the place or item before you make the trip.","For example: want to know whether a shop is open, how busy it is, or whether a product is still in stock in another city? IsThere4You could connect you with someone who is there."],refTitle:"Invite someone",refBody:"This is your personal invite link. See how many people open it and how many sign up through it.",copy:"Copy",copiedLink:"Copied ✓",clicks:"link opens",signups:"signups",shareInvite:"Share your invite"},
  de:{button:"IsThere4You teilen",copied:"Link kopiert ✓",text:"Ich habe eine interessante Idee entdeckt: IsThere4You — lokale Hilfe, wenn du selbst nicht vor Ort sein kannst.",examples:["Zum Beispiel: Du bist bereits abgereist und merkst, dass du deinen Reisepass, deine Schlüssel oder einen wichtigen Gegenstand im Hotel vergessen hast? IsThere4You könnte dich mit jemandem vor Ort verbinden, der dir vielleicht helfen kann.","Zum Beispiel: Du hast online eine Wohnung, ein Auto oder einen Gegenstand gefunden, der Hunderte Kilometer entfernt ist? IsThere4You könnte dich mit jemandem in der Nähe verbinden, der sich den Ort oder Gegenstand möglicherweise ansehen kann, bevor du die Fahrt machst.","Zum Beispiel: Du möchtest wissen, ob ein Geschäft geöffnet ist, wie voll es ist oder ob ein Produkt in einer anderen Stadt noch verfügbar ist? IsThere4You könnte dich mit jemandem verbinden, der bereits dort ist."],refTitle:"Jemanden einladen",refBody:"Das ist dein persönlicher Einladungslink. Du siehst, wie oft er geöffnet wird und wie viele Anmeldungen darüber erfolgen.",copy:"Kopieren",copiedLink:"Kopiert ✓",clicks:"Link-Aufrufe",signups:"Anmeldungen",shareInvite:"Einladung teilen"},
  fr:{button:"Partager IsThere4You",copied:"Lien copié ✓",text:"J’ai découvert une idée intéressante : IsThere4You — une aide locale lorsque vous ne pouvez pas être sur place.",examples:["Par exemple : vous avez quitté la ville puis réalisé que vous aviez oublié votre passeport, vos clés ou un objet important à l’hôtel ? IsThere4You pourrait vous mettre en relation avec quelqu’un qui se trouve sur place et pourrait peut-être vous aider.","Par exemple : vous avez trouvé en ligne un appartement, une voiture ou un objet situé à des centaines de kilomètres ? IsThere4You pourrait vous mettre en relation avec quelqu’un à proximité qui pourrait voir le lieu ou l’objet avant votre déplacement.","Par exemple : vous voulez savoir si un magasin est ouvert, s’il y a du monde ou si un produit est encore en stock dans une autre ville ? IsThere4You pourrait vous mettre en relation avec quelqu’un qui se trouve sur place."],refTitle:"Inviter quelqu’un",refBody:"Voici votre lien d’invitation personnel. Voyez combien de personnes l’ouvrent et combien s’inscrivent grâce à lui.",copy:"Copier",copiedLink:"Copié ✓",clicks:"ouvertures",signups:"inscriptions",shareInvite:"Partager l’invitation"},
  es:{button:"Compartir IsThere4You",copied:"Enlace copiado ✓",text:"He encontrado una idea interesante: IsThere4You — ayuda local cuando tú no puedes estar allí.",examples:["Por ejemplo: ¿ya te has ido de la ciudad y te das cuenta de que olvidaste el pasaporte, las llaves o un objeto importante en el hotel? IsThere4You podría conectarte con alguien que esté allí y quizá pueda ayudarte.","Por ejemplo: ¿has encontrado en internet un piso, un coche o un objeto a cientos de kilómetros? IsThere4You podría conectarte con alguien cercano que quizá pueda ver el lugar o el objeto antes de que hagas el viaje.","Por ejemplo: ¿quieres saber si una tienda está abierta, si hay mucha gente o si un producto sigue disponible en otra ciudad? IsThere4You podría conectarte con alguien que esté allí."],refTitle:"Invita a alguien",refBody:"Este es tu enlace personal de invitación. Mira cuántas personas lo abren y cuántas se registran a través de él.",copy:"Copiar",copiedLink:"Copiado ✓",clicks:"aperturas",signups:"registros",shareInvite:"Compartir invitación"},
  ru:{button:"Поделиться IsThere4You",copied:"Ссылка скопирована ✓",text:"Я нашёл интересную идею: IsThere4You — помощь на месте, когда вы сами не можете там находиться.",examples:["Например: вы уже уехали из города и поняли, что забыли паспорт, ключи или важную вещь в отеле? IsThere4You могла бы связать вас с человеком, который находится там и, возможно, сможет помочь.","Например: вы нашли в интернете квартиру, автомобиль или вещь за сотни километров от вас? IsThere4You могла бы связать вас с человеком поблизости, который, возможно, сможет увидеть место или вещь до вашей поездки.","Например: хотите узнать, открыт ли магазин, много ли там людей или есть ли товар в наличии в другом городе? IsThere4You могла бы связать вас с человеком, который уже находится там."],refTitle:"Пригласить человека",refBody:"Это ваша персональная ссылка-приглашение. Здесь видно, сколько людей её открыли и сколько зарегистрировались.",copy:"Копировать",copiedLink:"Скопировано ✓",clicks:"открытий",signups:"регистраций",shareInvite:"Поделиться приглашением"},
  "zh-CN":{button:"分享 IsThere4You",copied:"链接已复制 ✓",text:"我发现了一个很有意思的想法：IsThere4You——当你无法亲自到场时，为你连接当地的帮助。",examples:["例如：你已经离开一座城市，却发现把护照、钥匙或重要物品忘在酒店？IsThere4You 或许可以帮你连接一位就在当地的人，看看是否能提供帮助。","例如：你在网上看到一套公寓、一辆车或一件远在数百公里外的物品？IsThere4You 或许可以帮你连接附近的人，在你亲自前往之前先看看现场或物品。","例如：你想知道另一个城市的商店是否营业、是否拥挤，或某件商品是否还有库存？IsThere4You 或许可以帮你连接就在当地的人。"],refTitle:"邀请朋友",refBody:"这是你的专属邀请链接。你可以看到有多少人打开链接，以及有多少人通过它注册。",copy:"复制",copiedLink:"已复制 ✓",clicks:"打开次数",signups:"注册人数",shareInvite:"分享邀请"}
};

function validCode(value){return typeof value==="string"&&/^[A-F0-9]{10}$/.test(value.trim().toUpperCase())}
function lang(){const selected=document.getElementById("lang")?.value;if(selected)return selected;try{return localStorage.getItem("isthere4you-language")||"en"}catch{return "en"}}
function copy(){return COPY[lang()]||COPY.en}
function ownCode(){try{const c=(localStorage.getItem(STORAGE_KEY)||"").trim().toUpperCase();return validCode(c)?c:null}catch{return null}}
function saveOwnCode(code){if(!validCode(code))return;try{localStorage.setItem(STORAGE_KEY,code.trim().toUpperCase())}catch{}}
function inboundCode(){try{const c=(new URLSearchParams(location.search).get("ref")||"").trim().toUpperCase();return validCode(c)?c:null}catch{return null}}
function personalUrl(code=ownCode()){return code?`${BASE_URL}?ref=${encodeURIComponent(code)}`:BASE_URL}

function renderButtons(){
  const c=copy(),code=ownCode();
  document.querySelectorAll("[data-share-isthere4you]").forEach(btn=>{
    const label=btn.querySelector(".share-label");
    const text=btn.id==="shareReferralBtn"&&code?c.shareInvite:c.button;
    if(label&&!btn.dataset.busy)label.textContent=text;
    btn.setAttribute("aria-label",text);
  });
}

function renderReferralPanel(stats){
  const code=ownCode(),panel=document.getElementById("referralPanel");
  if(!panel)return;
  if(!code){panel.classList.add("hidden");return}
  const c=copy();
  panel.classList.remove("hidden");
  const title=document.getElementById("referralTitle"),body=document.getElementById("referralBody"),input=document.getElementById("referralLink"),copyBtn=document.getElementById("copyReferralLink"),clicksLabel=document.getElementById("referralClicksLabel"),signupsLabel=document.getElementById("referralSignupsLabel");
  if(title)title.textContent=c.refTitle;if(body)body.textContent=c.refBody;if(input)input.value=personalUrl(code);if(copyBtn&&!copyBtn.dataset.busy)copyBtn.textContent=c.copy;if(clicksLabel)clicksLabel.textContent=c.clicks;if(signupsLabel)signupsLabel.textContent=c.signups;
  if(stats){const clicks=document.getElementById("referralClicks"),signups=document.getElementById("referralSignups");if(clicks)clicks.textContent=String(Number(stats.clicks??stats.referralClicks??0));if(signups)signups.textContent=String(Number(stats.signups??stats.referralSignups??0))}
}

async function api(action,referralCode){
  const r=await fetch(REF_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,referralCode})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.ok)throw new Error(d.error||"referral_error");
  return d;
}

async function loadStats(code=ownCode()){
  if(!code)return;
  try{const d=await api("stats",code);renderReferralPanel(d)}catch{}
}

async function recordInbound(){
  const incoming=inboundCode(),mine=ownCode();
  if(!incoming||incoming===mine)return;
  let key=`it4y-ref-click:${incoming}`;
  try{if(sessionStorage.getItem(key)==="1")return}catch{}
  try{await api("click",incoming);try{sessionStorage.setItem(key,"1")}catch{}}catch{}
}

function buildSharePayload(){
  const c=copy(),example=c.examples[Math.floor(Math.random()*c.examples.length)],url=personalUrl();
  return {c,url,text:`${c.text}\n\n${example}`,fallback:`${c.text}\n\n${example}\n\n${url}`};
}

async function fallbackCopy(message){
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(message);return}
  const ta=document.createElement("textarea");ta.value=message;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
}

async function share(btn){
  const {c,url,text,fallback}=buildSharePayload();
  try{
    if(navigator.share){await navigator.share({title:"IsThere4You",text,url});return}
    await fallbackCopy(fallback);
  }catch(e){
    if(e?.name==="AbortError")return;
    try{await fallbackCopy(fallback)}catch{return}
  }
  const label=btn.querySelector(".share-label");
  if(label){btn.dataset.busy="1";label.textContent=c.copied;setTimeout(()=>{delete btn.dataset.busy;renderButtons()},1800)}
}

async function copyReferral(){
  const code=ownCode(),btn=document.getElementById("copyReferralLink");if(!code||!btn)return;
  const c=copy();
  try{await fallbackCopy(personalUrl(code));btn.dataset.busy="1";btn.textContent=c.copiedLink;setTimeout(()=>{delete btn.dataset.busy;renderReferralPanel()},1600)}catch{}
}

function render(){
  renderButtons();
  renderReferralPanel();
  const success=document.getElementById("signupSuccess");
  if(ownCode()&&success&&!success.classList.contains("hidden"))loadStats();
}

function init(){
  document.querySelectorAll("[data-share-isthere4you]").forEach(btn=>btn.addEventListener("click",()=>share(btn)));
  document.getElementById("copyReferralLink")?.addEventListener("click",copyReferral);
  document.getElementById("lang")?.addEventListener("change",()=>setTimeout(render,0));
  window.addEventListener("it4y:signup-success",e=>{
    const d=e.detail||{};
    if(validCode(d.referralCode))saveOwnCode(d.referralCode);
    renderButtons();
    renderReferralPanel(d);
    if(ownCode())loadStats();
  });
  render();
  recordInbound();
  setTimeout(render,250);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();