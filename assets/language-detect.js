(()=>{
  "use strict";

  const ACTIVE_KEY = "isthere4you-language";
  const MANUAL_KEY = "isthere4you-language-manual-v1";
  const SUPPORTED = new Set(["ro","en","de","fr","es","ru","zh-CN"]);

  function normalizeLocale(value){
    const v = String(value || "").toLowerCase();
    if(v === "zh" || v === "zh-cn" || v === "zh-sg" || v.startsWith("zh-hans")) return "zh-CN";
    if(v.startsWith("ro")) return "ro";
    if(v.startsWith("en")) return "en";
    if(v.startsWith("de")) return "de";
    if(v.startsWith("fr")) return "fr";
    if(v.startsWith("es")) return "es";
    if(v.startsWith("ru")) return "ru";
    return "";
  }

  function timezoneHint(){
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch(e) {}

    const exact = {
      "Europe/Bucharest":"ro",
      "Europe/Berlin":"de",
      "Europe/Vienna":"de",
      "Europe/Paris":"fr",
      "Europe/Madrid":"es",
      "Europe/Moscow":"ru",
      "Asia/Shanghai":"zh-CN"
    };
    if(exact[tz]) return exact[tz];

    if(/^Europe\/(Kaliningrad|Samara|Volgograd|Saratov|Ulyanovsk)$/.test(tz)) return "ru";
    if(/^Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr)$/.test(tz)) return "ru";
    if(tz === "Atlantic/Canary") return "es";
    return "";
  }

  function detect(){
    try {
      const manual = localStorage.getItem(MANUAL_KEY) || "";
      if(SUPPORTED.has(manual)) return manual;
    } catch(e) {}

    const primary = normalizeLocale(navigator.language || "");
    const browserLanguages = Array.isArray(navigator.languages) ? navigator.languages : [];
    const secondary = browserLanguages
      .map(normalizeLocale)
      .find(code => code && code !== "en");
    const tz = timezoneHint();

    // If the browser is explicitly set to a supported non-English language,
    // respect that choice even when the user is travelling abroad.
    if(primary && primary !== "en") return primary;

    // English is often a browser/application default rather than a real
    // language preference. A non-English secondary language is therefore
    // a stronger signal than generic English.
    if(primary === "en" && secondary) return secondary;

    // If English is the only browser signal, use an unambiguous local
    // timezone hint for the supported languages.
    if(primary === "en" && tz) return tz;

    if(primary) return primary;

    for(const item of browserLanguages){
      const code = normalizeLocale(item);
      if(code) return code;
    }

    if(tz) return tz;
    return "en";
  }

  try {
    localStorage.setItem(ACTIVE_KEY, detect());
  } catch(e) {}

  window.addEventListener("DOMContentLoaded", ()=>{
    const select = document.getElementById("lang");
    if(!select) return;
    select.addEventListener("change", ()=>{
      const value = select.value;
      if(!SUPPORTED.has(value)) return;
      try {
        localStorage.setItem(MANUAL_KEY, value);
        localStorage.setItem(ACTIVE_KEY, value);
      } catch(e) {}
    });
  });
})();
