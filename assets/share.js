(()=>{
"use strict";
const URL="https://isthere4you.com";
const COPY={
  ro:{button:"Distribuie IsThere4You",copied:"Link copiat ✓",text:"Am găsit o idee interesantă: IsThere4You — ajutor local atunci când tu nu poți fi acolo."},
  en:{button:"Share IsThere4You",copied:"Link copied ✓",text:"I found an interesting idea: IsThere4You — local help when you cannot be there yourself."},
  de:{button:"IsThere4You teilen",copied:"Link kopiert ✓",text:"Ich habe eine interessante Idee entdeckt: IsThere4You — lokale Hilfe, wenn du selbst nicht vor Ort sein kannst."},
  fr:{button:"Partager IsThere4You",copied:"Lien copié ✓",text:"J’ai découvert une idée intéressante : IsThere4You — une aide locale lorsque vous ne pouvez pas être sur place."},
  es:{button:"Compartir IsThere4You",copied:"Enlace copiado ✓",text:"He encontrado una idea interesante: IsThere4You — ayuda local cuando tú no puedes estar allí."},
  ru:{button:"Поделиться IsThere4You",copied:"Ссылка скопирована ✓",text:"Я нашёл интересную идею: IsThere4You — помощь на месте, когда вы сами не можете там находиться."},
  "zh-CN":{button:"分享 IsThere4You",copied:"链接已复制 ✓",text:"我发现了一个很有意思的想法：IsThere4You——当你无法亲自到场时，为你连接当地的帮助。"}
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
async function fallbackCopy(c){
  const full=`${c.text}\n\n${URL}`;
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(full);return}
  const ta=document.createElement("textarea");ta.value=full;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();
}
async function share(btn){
  const c=copy();
  try{
    if(navigator.share){
      await navigator.share({title:"IsThere4You",text:c.text,url:URL});
      return;
    }
    await fallbackCopy(c);
    const label=btn.querySelector(".share-label");
    btn.dataset.busy="1";label.textContent=c.copied;
    setTimeout(()=>{delete btn.dataset.busy;render()},1800);
  }catch(e){
    if(e?.name==="AbortError")return;
    try{
      await fallbackCopy(c);
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