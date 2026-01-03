const state = {
  lang: "ar",
  dir: "rtl",
  templates: [],
  selectedTemplateId: null,
  config: { PAYPAL_CLIENT_ID: "", CURRENCY: "USD" },
};
if (window.__OPEN_ADMIN__ === true) {
  showPage("admin");
}

const i18n = {
  ar: {
    home_title: "صمّم عروضك خلال دقائق",
    home_sub: "اختر قالب، اكتب المحتوى، وادفع — والباقي علينا.",
    start_now: "ابدأ الآن",
    see_prices: "شوف الأسعار",
    home_steps_title: "كيف يشتغل؟",
    step1: "اختار قالب",
    step2: "أدخل العنوان والنص وارفع صورة",
    step3: "عاين ثم ادفع",
    gallery_title: "القوالب",
    gallery_sub: "اختار قالب وبعدين افتح المحرر.",
    go_editor: "روح للمحرر",
    editor_title: "المحرر",
    pick_template: "اختر قالب",
    title_label: "العنوان",
    body_label: "النص",
    color_label: "لون العنوان",
    font_label: "الخط",
    image_label: "رابط صورة (اختياري)",
    preview: "معاينة",
    go_pay: "الذهاب للدفع",
    note_demo: "ملاحظة: هذه نسخة MVP. لاحقًا نضيف auto-fit + تقسيم تلقائي للسلايدات.",
    pricing_title: "الأسعار",
    pricing_sub: "اختر قالب من القوالب، السعر يطلع في صفحة الدفع.",
    browse_templates: "استعرض القوالب",
    checkout_title: "الدفع",
    selected_template: "القالب المختار",
    price: "السعر",
    back_editor: "رجوع للمحرر",
    paypal_hint: "إذا ما ظهر زر PayPal: تأكد أنك فتحت الرابط مباشرة (مو داخل معاينة) وأن PAYPAL_CLIENT_ID موجود في Render.",
    admin_title: "لوحة الأدمن",
    admin_hint: "الدخول محمي. أدخل كلمة مرور الأدمن.",
    login: "دخول",
    logout: "خروج",
    manage_templates: "إدارة القوالب",
    tpl_name: "اسم القالب",
    tpl_price: "السعر",
    tpl_slides: "أقصى عدد سلايدات",
    tpl_thumb: "رابط صورة مصغرة (اختياري)",
    add_template: "إضافة قالب",
    current_templates: "القوالب الحالية",
  },
  en: {
    home_title: "Create slides in minutes",
    home_sub: "Pick a template, write your content, pay — we handle the rest.",
    start_now: "Start now",
    see_prices: "See pricing",
    home_steps_title: "How it works",
    step1: "Choose a template",
    step2: "Enter title/body and add an image",
    step3: "Preview then pay",
    gallery_title: "Templates",
    gallery_sub: "Pick a template, then open the editor.",
    go_editor: "Go to editor",
    editor_title: "Editor",
    pick_template: "Select template",
    title_label: "Title",
    body_label: "Body",
    color_label: "Title color",
    font_label: "Font",
    image_label: "Image URL (optional)",
    preview: "Preview",
    go_pay: "Go to checkout",
    note_demo: "Note: MVP version. Later we add auto-fit + auto-splitting slides.",
    pricing_title: "Pricing",
    pricing_sub: "Pick a template; price shows on checkout.",
    browse_templates: "Browse templates",
    checkout_title: "Checkout",
    selected_template: "Selected template",
    price: "Price",
    back_editor: "Back to editor",
    paypal_hint: "If PayPal button doesn't show: open the direct link and ensure PAYPAL_CLIENT_ID is set on Render.",
    admin_title: "Admin Panel",
    admin_hint: "Protected login. Enter admin password.",
    login: "Login",
    logout: "Logout",
    manage_templates: "Manage templates",
    tpl_name: "Template name",
    tpl_price: "Price",
    tpl_slides: "Max slides",
    tpl_thumb: "Thumbnail URL (optional)",
    add_template: "Add template",
    current_templates: "Current templates",
  },
};

function $(id) { return document.getElementById(id); }

function setLang(lang) {
  state.lang = lang;
  state.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = state.dir;
  $("btnLang").textContent = lang === "ar" ? "EN" : "AR";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const dict = i18n[state.lang];
    if (dict && dict[key]) el.textContent = dict[key];
  });
}

function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const el = document.getElementById(`page-${name}`);
  if (el) el.classList.remove("hidden");
}

async function fetchJSON(url, options) {
  const r = await fetch(url, options);
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await r.json() : await r.text();
  if (!r.ok) {
    const msg = typeof data === "string" ? data : (data.error || "Request failed");
    throw new Error(msg);
  }
  return data;
}

function renderTemplates() {
  const grid = $("templatesGrid");
  grid.innerHTML = "";
  state.templates.forEach(t => {
    const card = document.createElement("div");
    card.className = "tpl";
    const img = document.createElement("img");
    img.src = t.thumbnail || "assets/template1.png";
    img.alt = t.name;

    const pad = document.createElement("div");
    pad.className = "pad";
    pad.innerHTML = `
      <div class="name">${t.name}</div>
      <div class="meta">
        <span>$${t.price}</span>
        <span>${t.maxSlides} slides</span>
      </div>
      <div class="row mt8">
        <button class="primary" data-select="${t.id}">${state.lang === "ar" ? "اختيار" : "Select"}</button>
      </div>
    `;
    card.appendChild(img);
    card.appendChild(pad);
    grid.appendChild(card);

    pad.querySelector("button").addEventListener("click", () => {
      state.selectedTemplateId = t.id;
      $("selectTemplate").value = t.id;
      updateCheckoutInfo();
      showPage("editor");
    });
  });
}

function populateTemplateSelect() {
  const sel = $("selectTemplate");
  sel.innerHTML = "";
  state.templates.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.name} ($${t.price})`;
    sel.appendChild(opt);
  });
  if (!state.selectedTemplateId && state.templates[0]) state.selectedTemplateId = state.templates[0].id;
  sel.value = state.selectedTemplateId;
  sel.addEventListener("change", () => {
    state.selectedTemplateId = sel.value;
    updateCheckoutInfo();
  });
}

function updatePreview() {
  const title = $("inpTitle").value || (state.lang === "ar" ? "عنوان" : "Title");
  const body = $("inpBody").value || (state.lang === "ar" ? "النص يظهر هنا..." : "Your text shows here...");
  const color = $("inpColor").value || "#13b6ec";
  const font = $("selectFont").value;

  $("prevTitle").textContent = title;
  $("prevBody").textContent = body;
  $("prevTitle").style.color = color;
  $("prevTitle").style.fontFamily = font;
  $("prevBody").style.fontFamily = font;

  const imgUrl = $("inpImg").value.trim();
  const img = $("prevImg");
  if (imgUrl) {
    img.src = imgUrl;
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
  }
}

function getSelectedTemplate() {
  return state.templates.find(t => t.id === state.selectedTemplateId) || state.templates[0];
}

function updateCheckoutInfo() {
  const t = getSelectedTemplate();
  if (!t) return;
  $("checkoutTemplateName").textContent = t.name;
  $("checkoutPrice").textContent = `$${t.price}`;
}

async function ensurePayPalLoaded() {
  const cid = state.config.PAYPAL_CLIENT_ID;
  if (!cid) {
    $("paypalStatus").textContent = state.lang === "ar"
      ? "PAYPAL_CLIENT_ID غير موجود. أضيفيه في Render Environment Variables."
      : "PAYPAL_CLIENT_ID missing. Set it in Render Environment Variables.";
    return false;
  }
  // Load PayPal JS SDK once
  if (window.paypal) return true;

  const script = document.createElement("script");
  script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cid)}&currency=${encodeURIComponent(state.config.CURRENCY || "USD")}`;
  script.async = true;
  script.onload = () => renderPayPalButtons();
  script.onerror = () => {
    $("paypalStatus").textContent = state.lang === "ar"
      ? "فشل تحميل PayPal. تأكدي من الإنترنت ومن فتح الصفحة مباشرة."
      : "Failed to load PayPal SDK. Check internet and open direct page.";
  };
  document.head.appendChild(script);
  return true;
}

function renderPayPalButtons() {
  const t = getSelectedTemplate();
  if (!t || !window.paypal) return;

  const container = document.getElementById("paypal-button-container");
  container.innerHTML = ""; // reset

  window.paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          description: `Template: ${t.name}`,
          amount: { value: String(t.price) }
        }]
      });
    },
    onApprove: async (data, actions) => {
      await actions.order.capture();
      $("paypalStatus").textContent = state.lang === "ar"
        ? "تم الدفع التجريبي ✅"
        : "Payment complete ✅";
    },
    onError: (err) => {
      console.error(err);
      $("paypalStatus").textContent = state.lang === "ar"
        ? "خطأ في PayPal. جرّبي مرة ثانية."
        : "PayPal error. Please try again.";
    }
  }).render("#paypal-button-container");
}

async function refreshAdminUI() {
  const me = await fetchJSON("/api/me");
  const isAdmin = !!me.isAdmin;

  $("btnAdminLogout").classList.toggle("hidden", !isAdmin);
  $("btnAdminLogin").classList.toggle("hidden", isAdmin);
  $("adminPassword").classList.toggle("hidden", isAdmin);

  $("adminPanel").classList.toggle("hidden", !isAdmin);
  $("adminAuthCard").classList.toggle("hidden", isAdmin ? false : false);

  if (isAdmin) {
    await renderAdminTemplates();
  }
}

async function renderAdminTemplates() {
  const list = $("adminTemplatesList");
  list.innerHTML = "";
  state.templates.forEach(t => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div>
        <div><b>${t.name}</b></div>
        <div class="tiny muted">$${t.price} • ${t.maxSlides} slides</div>
      </div>
      <button class="secondary" data-del="${t.id}">${state.lang === "ar" ? "حذف" : "Delete"}</button>
    `;
    row.querySelector("button").addEventListener("click", async () => {
      try {
        await fetchJSON(`/api/templates/${t.id}`, { method: "DELETE" });
        await loadTemplates();
        $("tplMsg").textContent = state.lang === "ar" ? "تم الحذف ✅" : "Deleted ✅";
      } catch (e) {
        $("tplMsg").textContent = e.message;
      }
    });
    list.appendChild(row);
  });
}

async function loadTemplates() {
  const data = await fetchJSON("/api/templates");
  state.templates = data.templates || [];
  renderTemplates();
  populateTemplateSelect();
  updateCheckoutInfo();
}

function wireNav() {
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const page = btn.getAttribute("data-page");
      showPage(page);
      if (page === "checkout") {
        updateCheckoutInfo();
        await ensurePayPalLoaded();
      }
      if (page === "admin") {
        await refreshAdminUI();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  $("btnLang").addEventListener("click", () => {
    setLang(state.lang === "ar" ? "en" : "ar");
    renderTemplates();
    updatePreview();
    updateCheckoutInfo();
  });

  $("btnPreview").addEventListener("click", () => updatePreview());

  $("btnAdminLogin").addEventListener("click", async () => {
    $("adminMsg").textContent = "";
    try {
      await fetchJSON("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ password: $("adminPassword").value }),
      });
      $("adminMsg").textContent = state.lang === "ar" ? "تم الدخول ✅" : "Logged in ✅";
      await refreshAdminUI();
      await loadTemplates();
    } catch (e) {
      $("adminMsg").textContent = state.lang === "ar" ? "كلمة المرور خطأ" : "Wrong password";
    }
  });

  $("btnAdminLogout").addEventListener("click", async () => {
    await fetchJSON("/api/admin/logout", { method: "POST" });
    $("adminMsg").textContent = state.lang === "ar" ? "تم الخروج" : "Logged out";
    await refreshAdminUI();
  });

  $("btnAddTpl").addEventListener("click", async () => {
    try {
      const body = new URLSearchParams({
        name: $("tplName").value,
        price: $("tplPrice").value,
        maxSlides: $("tplSlides").value,
        thumbnail: $("tplThumb").value,
      });
      await fetchJSON("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      $("tplMsg").textContent = state.lang === "ar" ? "تمت الإضافة ✅" : "Added ✅";
      $("tplName").value = "";
      await loadTemplates();
    } catch (e) {
      $("tplMsg").textContent = e.message;
    }
  });
}

async function init() {
  setLang("ar");
  wireNav();

  // Load config
  try {
    state.config = await fetchJSON("/config.json");
  } catch (e) {
    console.warn("Config missing", e);
  }

  await loadTemplates();
  updatePreview();
}

init();
