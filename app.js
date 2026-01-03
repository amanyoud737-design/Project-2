const state = {
  lang: "ar",
  dir: "rtl",
  templates: [
    { id: "t1", name_ar: "قالب 1", name_en: "Template 1", sub_ar: "ستايل بسيط", sub_en: "Simple style", img: "./template1.png" },
    { id: "t2", name_ar: "قالب 2", name_en: "Template 2", sub_ar: "ستايل قوي", sub_en: "Bold style", img: "./template2.png" }
  ],
  selectedTemplateId: "t1",
  imageDataUrl: null
};

const i18n = {
  ar: {
    home_title: "حوّل أفكارك لعروض احترافية خلال ثواني",
    home_sub: "اختاري قالب، ارفعي صورة، اكتبي النص، وصدّري.",
    start_now: "ابدأ الآن",
    see_prices: "شوف الأسعار",
    templates_title: "القوالب",
    templates_sub: "اختاري قالب ثم انتقلي للمحرر.",
    editor_title: "المحرر",
    pick_template: "اختيار قالب",
    title_label: "العنوان",
    body_label: "النص",
    color_label: "لون",
    image_label: "أضف صورة (اختياري)",
    preview: "تحديث المعاينة",
    clear: "مسح",
    preview_title: "المعاينة",
    pricing_title: "الأسعار",
    plan_basic: "خطة أساسية",
    plan_basic_desc: "للاستخدام الشخصي.",
    pay_now: "ادفع الآن"
  },
  en: {
    home_title: "Turn Ideas into A+ Presentations in Seconds",
    home_sub: "Pick a template, upload an image, type text, and export.",
    start_now: "Get Started",
    see_prices: "See Pricing",
    templates_title: "Templates",
    templates_sub: "Pick a template then go to the editor.",
    editor_title: "Editor",
    pick_template: "Pick a template",
    title_label: "Title",
    body_label: "Body",
    color_label: "Color",
    image_label: "Add image (optional)",
    preview: "Update preview",
    clear: "Clear",
    preview_title: "Preview",
    pricing_title: "Pricing",
    plan_basic: "Basic",
    plan_basic_desc: "For personal use.",
    pay_now: "Pay now"
  }
};

function $(id){ return document.getElementById(id); }

function setLang(lang){
  state.lang = lang;
  state.dir = (lang === "ar") ? "rtl" : "ltr";

  document.documentElement.lang = lang;
  document.documentElement.dir = state.dir;

  // toggle button label
  $("btnLang").textContent = (lang === "ar") ? "EN" : "AR";

  // translate
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    const v = i18n[lang][k];
    if (typeof v === "string") el.textContent = v;
  });

  renderTemplates();
  syncTemplateSelect();
  updatePreview();
}

function showPage(name){
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const page = document.querySelector(`#page-${name}`);
  if(page) page.classList.remove("hidden");
}

function renderTemplates(){
  const grid = $("templatesGrid");
  grid.innerHTML = "";

  state.templates.forEach(t => {
    const card = document.createElement("div");
    card.className = "template";
    card.innerHTML = `
      <img src="${t.img}" alt="">
      <div class="tinfo">
        <div class="tname">${state.lang === "ar" ? t.name_ar : t.name_en}</div>
        <div class="tsub">${state.lang === "ar" ? t.sub_ar : t.sub_en}</div>
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedTemplateId = t.id;
      syncTemplateSelect();
      showPage("editor");
      updatePreview();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    grid.appendChild(card);
  });
}

function syncTemplateSelect(){
  const sel = $("selTemplate");
  sel.innerHTML = "";
  state.templates.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = state.lang === "ar" ? t.name_ar : t.name_en;
    sel.appendChild(opt);
  });
  sel.value = state.selectedTemplateId;
}

function updatePreview(){
  const title = $("inpTitle").value.trim() || (state.lang === "ar" ? "عنوان" : "Title");
  const body  = $("inpBody").value.trim()  || (state.lang === "ar" ? "النص..." : "Body...");
  const color = $("inpColor").value || "#1e90ff";

  $("prevTitle").textContent = title;
  $("prevBody").textContent  = body;

  const slide = $("slidePreview");
  slide.style.background = `linear-gradient(180deg, ${hexToRgba(color, 0.18)}, rgba(16,26,34,.92))`;

  const img = $("prevImg");
  if(state.imageDataUrl){
    img.src = state.imageDataUrl;
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
    img.removeAttribute("src");
  }

  // PayPal hint (just status)
  const cfg = window.__SG_CONFIG__ || {};
  const hint = $("hintPayPal");
  if(cfg.PAYPAL_CLIENT_ID){
    hint.textContent = `PayPal Client ID loaded ✅\nCurrency: ${cfg.CURRENCY || "USD"}`;
  } else {
    hint.textContent = `PayPal Client ID not set (ENV PAYPAL_CLIENT_ID)`;
  }
}

function hexToRgba(hex, a){
  const h = hex.replace("#","");
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

async function init(){
  // nav buttons
  document.querySelectorAll(".nav .link[data-page]").forEach(btn=>{
    btn.addEventListener("click", ()=> showPage(btn.dataset.page));
  });

  $("goTemplates").addEventListener("click", ()=> showPage("templates"));
  $("goPricing").addEventListener("click", ()=> showPage("pricing"));

  $("btnLang").addEventListener("click", ()=>{
    setLang(state.lang === "ar" ? "en" : "ar");
  });

  $("selTemplate").addEventListener("change", (e)=>{
    state.selectedTemplateId = e.target.value;
    updatePreview();
  });

  $("btnPreview").addEventListener("click", updatePreview);

  $("btnClear").addEventListener("click", ()=>{
    $("inpTitle").value = "";
    $("inpBody").value = "";
    state.imageDataUrl = null;
    updatePreview();
  });

  // ✅ file upload -> dataURL
  $("inpImgFile").addEventListener("change", async (e)=>{
    const file = e.target.files?.[0];
    if(!file){
      state.imageDataUrl = null;
      updatePreview();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.imageDataUrl = String(reader.result || "");
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  // “Pay now” demo button
  $("btnPay").addEventListener("click", ()=>{
    const cfg = window.__SG_CONFIG__ || {};
    const payHint = $("payHint");
    if(!cfg.PAYPAL_CLIENT_ID){
      payHint.textContent = "لازم تحط PAYPAL_CLIENT_ID في Render Environment Variables";
      return;
    }
    payHint.textContent = "جاهز ✅ (هذا زر تجريبي، نربط الدفع الحقيقي بعد ما تتأكدين الأدمن شغال).";
  });

  renderTemplates();
  syncTemplateSelect();
  setLang("ar");
  showPage("home");
}

window.addEventListener("DOMContentLoaded", init);
