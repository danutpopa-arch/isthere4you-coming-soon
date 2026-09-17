(()=>{
"use strict";
const URL="https://isthere4you.com";
const COPY={
  ro:{button:"Distribuie IsThere4You",copied:"Link copiat ✓",text:"Am găsit o idee interesantă: IsThere4You — ajutor local atunci când tu nu poți fi acolo.",examples:["De exemplu: ai plecat din oraș și ți-ai dat seama că ai uitat pașaportul, cheile sau un obiect important la hotel? IsThere4You te poate conecta cu cineva aflat acolo, care să te ajute.","De exemplu: ai găsit online un apartament, o mașină sau un obiect la sute de kilometri distanță? IsThere4You te poate conecta cu cineva aflat aproape, care să vadă locul sau obiectul înainte să faci drumul.","De exemplu: vrei să afli dacă un magazin este deschis, dacă este aglomerat sau dacă un produs mai este pe stoc într-un alt oraș? IsThere4You te poate conecta cu cineva aflat acolo."]},
  en:{button:"Share IsThere4You",copied:"Link copied ✓",text:"I found an interesting idea: IsThere4You — local help when you cannot be there yourself.",examples:["For example: left town and realized you forgot your passport, keys, or another important item at the hotel? IsThere4You can connect you with someone who is there and may be able to help.","For example: found an apartment, a car, or an item online hundreds of kilometres away? IsThere4You can connect you with someone nearby who can see the place or item before you make the trip.","For example: want to know whether a shop is open, how busy it is, or whether a product is still in stock in another city? IsThere4You can connect you with someone who is there."]},
  de:{button:"IsThere4You teilen",copied:"Link kopiert ✓",text:"Ich habe eine interessante Idee entdeckt: IsThere4You — lokale Hilfe, wenn du selbst nicht vor Ort sein kannst.",examples:["Zum Beispiel: Du bist bereits abgereist und merkst, dass du deinen Reisepass, deine Schlüssel oder einen wichtigen Gegenstand im Hotel vergessen hast? IsThere4You kann dich mit jemandem vor Ort verbinden, der dir helfen kann.","Zum Beispiel: Du hast online eine Wohnung, ein Auto oder einen Gegenstand gefunden, der Hunderte Kilometer entfernt ist? IsThere4You kann dich mit jemandem in der Nähe verbinden, der sich den Ort oder Gegenstand ansehen kann, bevor du die Fahrt machst.","Zum Beispiel: Du möchtest wissen, ob ein Geschäft geöffnet ist, wie voll es ist oder ob ein Produkt in einer anderen Stadt noch verfügbar ist? IsThere4You kann dich mit jemandem verbinden, der bereits dort ist."]},
  fr:{button:"Partager IsThere4You",copied:"Lien copié ✓",text:"J’ai découvert une idée intéressante : IsThere4You — une aide locale lorsque vous ne pouvez pas être sur place.",examples:["Par exemple : vous avez quitté la ville puis réalisé que vous aviez oublié votre passeport, vos clés ou un objet important à l’hôtel ? IsThere4You peut vous mettre en relation avec quelqu’un qui se trouve sur place et peut vous aider.","Par exemple : vous avez trouvé en ligne un appartement, une voiture ou un objet situé à des centaines de kilomètres ? IsThere4You peut vous mettre en relation avec quelqu’un à proximité qui peut voir le lieu ou l’objet avant votre déplacement.","Par exemple : vous voulez savoir si un magasin est ouvert, s’il y a du monde ou si un produit est encore en stock dans une autre ville ? IsThere4You peut vous mettre en relation avec quelqu’un qui se trouve sur place."]},
  es:{button:"Compartir IsThere4You",copied:"Enlace copiado ✓",text:"He encontrado una idea interesante: IsThere4You — ayuda local cuando tú no puedes estar allí.",examples:["Por ejemplo: ¿ya te has ido de la ciudad y te das cuenta de que olvidaste el pasaporte, las llaves o un objeto importante en el hotel? IsThere4You puede conectarte con alguien que esté allí y pueda ayudarte.","Por ejemplo: ¿has encontrado en internet un piso, un coche o un objeto a cientos de kilómetros? IsThere4You puede conectarte con alguien cercano que pueda ver el lugar o el objeto antes de que hagas el viaje.","Por ejemplo: ¿quieres saber si una tienda está abierta, si hay mucha gente o si un producto sigue disponible en otra ciudad? IsThere4You puede conectarte con alguien que esté allí."]},
  ru:{button:"Поделиться IsThere4You",copied:"Ссылка скопирована ✓",text:"Я нашёл интересную идею: IsThere4You — помощь на месте, когда вы сами не можете там находиться.",examples:["Например: вы уже уехали из города и поняли, что забыли паспорт, ключи или важную вещь в отеле? IsThere4You может связать вас с человеком, который находится там и может помочь.","Например: вы нашли в интернете квартиру, автомобиль или вещь за сотни километров от вас? IsThere4You может связать вас с человеком поблизости, который сможет увидеть место или вещь до вашей поездки.","Например: хотите узнать, открыт ли магазин, много ли там людей или есть ли товар в наличии в другом городе? IsThere4You может связать вас с человеком, который уже находится там."]},
  "zh-CN":{button:"分享 IsThere4You",copied:"链接已复制 ✓",text:"我发现了一个很有意思的想法：IsThere4You——当你无法亲自到场时，为你连接当地的帮助。",examples:["例如：你已经离开一座城市，却发现把护照、钥匙或重要物品忘在酒店？IsThere4You 可以帮你连接一位就在当地的人，看看是否能提供帮助。","例如：你在网上看到一套公寓、一辆车或一件远在数百公里外的物品？IsThere4You 可以帮你连接附近的人，在你亲自前往之前先看看现场或物品。","例如：你想知道另一个城市的商店是否营业、是否拥挤，或某件商品是否还有库存？IsThere4You 可以帮你连接就在当地的人。"]}
};
function lang(){
  const selected=document.getElementById("lang")?.value;
  if(selected)return selected;
  try{return localStorage.getItem("isthere4you-language")||"en"}catch{return "en"}
}
function copy(){return COPY[lang()]||COPY.en}
function render(){
  const c=copy();
  document.querySelectorAll("[data-share-isthere4you]").forEach(btn=>{
    if(!btn.dataset.busy)btn.querySelector(".share-label").textContent=c.button;
    btn.setAttribute("aria-label",c.button);
  });
}
function buildMessage(c){
  const example=c.examples[Math.floor(Math.random()*c.examples.length)];
  return `${c.text}\n\n${example}\n\n${URL}`;
}
async function fallbackCopy(message){
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(message);return}
  const ta=document.createElement("textarea");ta.value=message;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
}
async function share(btn){
  const c=copy();
  const message=buildMessage(c);
  try{
    if(navigator.share){
      await navigator.share({title:"IsThere4You",text:message});
      return;
    }
    await fallbackCopy(message);
    const label=btn.querySelector(".share-label");
    btn.dataset.busy="1";label.textContent=c.copied;
    setTimeout(()=>{delete btn.dataset.busy;render()},1800);
  }catch(e){
    if(e?.name==="AbortError")return;
    try{
      await fallbackCopy(message);
      const label=btn.querySelector(".share-label");
      btn.dataset.busy="1";label.textContent=c.copied;
      setTimeout(()=>{delete btn.dataset.busy;render()},1800);
    }catch{}
  }
}
function init(){
  document.querySelectorAll("[data-share-isthere4you]").forEach(btn=>btn.addEventListener("click",()=>share(btn)));
  document.getElementById("lang")?.addEventListener("change",()=>setTimeout(render,0));
  render();setTimeout(render,250);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();