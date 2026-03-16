/* ============================================
   script.js (FULL UPDATED FILE)
============================================ */

let INCOME_MODE = "monthly"; // "monthly" | "yearly"

const YEAR_OPTIONS = [
  { value: "2026-2027", label: "2026 - 2027" },
  { value: "2025-2026", label: "2025 - 2026" },
  { value: "2024-2025", label: "2024 - 2025" },
  { value: "2023-2024", label: "2023 - 2024" },
];

/* ============================================
   Befiler-style salaried tax logic by year
============================================ */
const SALARY_TAX_CONFIG = {
  "2026-2027": {
    slabs: [
      { upto: 600000, threshold: 0, base: 0, rate: 0 },
      { upto: 1200000, threshold: 600000, base: 0, rate: 0.01 },
      { upto: 2200000, threshold: 1200000, base: 6000, rate: 0.11 },
      { upto: 3200000, threshold: 2200000, base: 116000, rate: 0.23 },
      { upto: 4100000, threshold: 3200000, base: 346000, rate: 0.30 },
      { upto: Infinity, threshold: 4100000, base: 616000, rate: 0.35 },
    ],
    surcharge: { threshold: 10000000, rate: 0.09 },
  },

  "2025-2026": {
    slabs: [
      { upto: 600000, threshold: 0, base: 0, rate: 0 },
      { upto: 1200000, threshold: 600000, base: 0, rate: 0.05 },
      { upto: 2200000, threshold: 1200000, base: 30000, rate: 0.15 },
      { upto: 3200000, threshold: 2200000, base: 180000, rate: 0.25 },
      { upto: 4100000, threshold: 3200000, base: 430000, rate: 0.30 },
      { upto: Infinity, threshold: 4100000, base: 700000, rate: 0.35 },
    ],
    surcharge: null,
  },

  "2024-2025": {
    slabs: [
      { upto: 600000, threshold: 0, base: 0, rate: 0 },
      { upto: 1200000, threshold: 600000, base: 0, rate: 0.025 },
      { upto: 2400000, threshold: 1200000, base: 15000, rate: 0.125 },
      { upto: 3600000, threshold: 2400000, base: 165000, rate: 0.225 },
      { upto: 6000000, threshold: 3600000, base: 435000, rate: 0.275 },
      { upto: Infinity, threshold: 6000000, base: 1095000, rate: 0.35 },
    ],
    surcharge: null,
  },

  "2023-2024": {
    slabs: [
      { upto: 600000, threshold: 0, base: 0, rate: 0 },
      { upto: 1200000, threshold: 600000, base: 0, rate: 0.025 },
      { upto: 2400000, threshold: 1200000, base: 15000, rate: 0.125 },
      { upto: 3600000, threshold: 2400000, base: 165000, rate: 0.20 },
      { upto: 6000000, threshold: 3600000, base: 405000, rate: 0.25 },
      { upto: 12000000, threshold: 6000000, base: 1005000, rate: 0.325 },
      { upto: Infinity, threshold: 12000000, base: 2955000, rate: 0.35 },
    ],
    surcharge: null,
  },
};

function formatPKR(value) {
  return "PKR " + Math.round(value || 0).toLocaleString("en-PK");
}

/* -----------------------------
   1) SERVICES FILTER (global)
----------------------------- */
function filterServices(category, element) {
  const target = String(category || "").trim().toLowerCase();
  const cards = document.querySelectorAll(".service-card");
  const tabs = document.querySelectorAll(".filter-tab");

  tabs.forEach((t) => t.classList.remove("active"));
  if (element) element.classList.add("active");

  cards.forEach((card) => {
    const c = String(card.getAttribute("data-category") || "").trim().toLowerCase();
    card.style.display = target === "all" || c === target ? "" : "none";
  });
}

/* -----------------------------
   2) TAX CALCULATOR
----------------------------- */
function getSelectedTaxYear() {
  const taxYearEl = document.getElementById("taxYear");
  return taxYearEl?.value || "2026-2027";
}

function calcAnnualTax(annualIncome, yearKey) {
  const config = SALARY_TAX_CONFIG[yearKey] || SALARY_TAX_CONFIG["2026-2027"];
  let tax = 0;

  for (const slab of config.slabs) {
    if (annualIncome <= slab.upto) {
      tax = slab.base + (annualIncome - slab.threshold) * slab.rate;
      break;
    }
  }

  if (config.surcharge && annualIncome > config.surcharge.threshold) {
    tax += tax * config.surcharge.rate;
  }

  return Math.max(0, tax);
}

function calculateTax() {
  const incomeEl = document.getElementById("income");
  const yearEl = document.getElementById("taxYear");

  const mt = document.getElementById("monthly-tax");
  const sat = document.getElementById("salary-after-tax");
  const at = document.getElementById("annual-tax");
  const as = document.getElementById("annual-salary");

  if (!incomeEl || !yearEl) return;

  let raw = parseFloat(incomeEl.value || "0");

  if (!Number.isFinite(raw) || raw <= 0) {
    if (mt) mt.innerText = "PKR 0";
    if (sat) sat.innerText = "PKR 0";
    if (at) at.innerText = "PKR 0";
    if (as) as.innerText = "PKR 0";
    return;
  }

  let monthlyIncome = 0;
  let annualIncome = 0;

  if (INCOME_MODE === "monthly") {
    monthlyIncome = raw;
    annualIncome = raw * 12;
  } else {
    annualIncome = raw;
    monthlyIncome = raw / 12;
  }

  const taxYear = getSelectedTaxYear();
  const annualTax = calcAnnualTax(annualIncome, taxYear);
  const monthlyTax = annualTax / 12;
  const salaryAfterTaxMonthly = monthlyIncome - monthlyTax;

  if (mt) mt.innerText = formatPKR(monthlyTax);
  if (sat) sat.innerText = formatPKR(salaryAfterTaxMonthly);
  if (at) at.innerText = formatPKR(annualTax);
  if (as) as.innerText = formatPKR(annualIncome);
}

/* -----------------------------
   3) INIT (one time)
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initHamburger();
  initFAQ();
  initReveal();
  initChatDemo();
  initTaxToggle();
  initReviews();
  initDownloadReport();
});

/* -----------------------------
   4) HAMBURGER MENU
----------------------------- */
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => navLinks.classList.toggle("active"));

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("active"));
  });

  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("active")) return;
    if (hamburger.contains(e.target) || navLinks.contains(e.target)) return;
    navLinks.classList.remove("active");
  });
}

/* -----------------------------
   5) FAQ
----------------------------- */
function initFAQ() {
  const answers = document.querySelectorAll(".faq-answer");
  if (!answers.length) return;

  answers.forEach((a) => {
    if (!a.classList.contains("open")) {
      a.style.display = "none";
      a.style.maxHeight = "0px";
      a.style.overflow = "hidden";
    }
  });

  document.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-question");
    if (!q) return;

    const ans = q.nextElementSibling;
    if (!ans || !ans.classList.contains("faq-answer")) return;

    const wrap = q.closest(".faq-wrap") || document;
    const icon = q.querySelector(".faq-icon");
    const isOpen = ans.classList.contains("open");

    wrap.querySelectorAll(".faq-answer.open").forEach((openAns) => {
      if (openAns === ans) return;
      closeFaq(openAns);
      const openIcon = openAns.previousElementSibling?.querySelector?.(".faq-icon");
      if (openIcon) openIcon.classList.remove("rotate");
    });

    if (isOpen) {
      closeFaq(ans);
      if (icon) icon.classList.remove("rotate");
    } else {
      openFaq(ans);
      if (icon) icon.classList.add("rotate");
    }
  });

  function openFaq(a) {
    a.style.display = "block";
    a.classList.add("open");
    a.style.overflow = "hidden";
    a.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      a.style.maxHeight = a.scrollHeight + "px";
    });
    setTimeout(() => {
      if (a.classList.contains("open")) a.style.maxHeight = "none";
    }, 260);
  }

  function closeFaq(a) {
    a.style.overflow = "hidden";
    a.style.maxHeight = a.scrollHeight + "px";
    requestAnimationFrame(() => {
      a.style.maxHeight = "0px";
    });
    a.classList.remove("open");
    setTimeout(() => {
      if (!a.classList.contains("open")) a.style.display = "none";
    }, 260);
  }
}

/* -----------------------------
   6) REVEAL ON SCROLL
----------------------------- */
function initReveal() {
  const items = document.querySelectorAll(
    ".popular-card, .testimonial-card, .faq-item, .team-card"
  );
  if (!items.length) return;

  items.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("show"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => io.observe(el));
}

/* -----------------------------
   7) CHAT DEMO + UNREAD BADGE
----------------------------- */
function initChatDemo() {
  const widget = document.getElementById("chatWidget");
  const fab = document.getElementById("chatFab");
  const box = document.getElementById("chatBox");
  const closeBtn = document.getElementById("chatClose");
  const body = document.getElementById("chatBody");
  const msgEl = document.getElementById("chatMsg");
  const sendBtn = document.getElementById("chatSend");
  const chips = document.getElementById("chatChips");
  const badge = document.getElementById("chatBadge");

  if (!widget || !fab || !box || !closeBtn || !body || !msgEl || !sendBtn || !badge) return;

  const STORE_KEY = "ta_chat_messages_v1";
  const UNREAD_KEY = "ta_chat_unread_v1";

  const timeNow = () => {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const save = (list) => localStorage.setItem(STORE_KEY, JSON.stringify(list));

  const getUnread = () => {
    const n = parseInt(localStorage.getItem(UNREAD_KEY) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  };

  const setUnread = (n) => {
    localStorage.setItem(UNREAD_KEY, String(n));
    if (n > 0) {
      badge.style.display = "flex";
      badge.textContent = String(n);
    } else {
      badge.style.display = "none";
    }
  };

  const render = () => {
    const list = load();
    body.innerHTML = "";
    list.forEach((m) => {
      const wrap = document.createElement("div");
      wrap.className = `msg ${m.side}`;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = m.text;

      const time = document.createElement("div");
      time.className = "time";
      time.textContent = m.time;

      const c = document.createElement("div");
      c.appendChild(bubble);
      c.appendChild(time);

      wrap.appendChild(c);
      body.appendChild(wrap);
    });

    body.scrollTop = body.scrollHeight;
  };

  const add = (side, text) => {
    const list = load();
    list.push({ side, text, time: timeNow() });
    save(list);
    render();
  };

  const openChat = () => {
    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");
    setUnread(0);

    if (load().length === 0) {
      add("left", "Hi! Please tell us which service you need: Income Tax, GST, Company Registration, or Bookkeeping.");
    }
  };

  const closeChat = () => {
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
  };

  const autoReply = () => {
    setTimeout(() => {
      add("left", "Dear customer, please let us know which service you want to avail from the options above.");
      if (!box.classList.contains("open")) setUnread(getUnread() + 1);
    }, 800);
  };

  const send = () => {
    const text = String(msgEl.value || "").trim();
    if (!text) return;
    add("right", text);
    msgEl.value = "";
    autoReply();
  };

  render();
  setUnread(getUnread());

  fab.addEventListener("click", () => (box.classList.contains("open") ? closeChat() : openChat()));
  closeBtn.addEventListener("click", closeChat);
  sendBtn.addEventListener("click", send);

  msgEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  if (chips) {
    chips.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      add("right", `I need help with: ${btn.getAttribute("data-chip")}`);
      autoReply();
    });
  }

  document.addEventListener("click", (e) => {
    if (!box.classList.contains("open")) return;
    if (!widget.contains(e.target)) closeChat();
  });
}

/* -----------------------------
   8) TAX TOGGLE + YEAR FILL
----------------------------- */
function initTaxToggle() {
  const incomeEl = document.getElementById("income");
  const toggle = document.getElementById("modeToggle");
  const taxYearEl = document.getElementById("taxYear");
  const hintEl = document.querySelector(".hint");

  if (taxYearEl && !taxYearEl.dataset.filled) {
    taxYearEl.innerHTML = "";
    YEAR_OPTIONS.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.value;
      opt.textContent = item.label;
      taxYearEl.appendChild(opt);
    });
    taxYearEl.value = "2026-2027";
    taxYearEl.dataset.filled = "1";
  }

  if (hintEl) {
    hintEl.textContent = "Enter gross salary. Tax will be calculated according to the selected tax year.";
  }

  const activeBtn = document.querySelector(".mode-btn.active");
  if (activeBtn?.dataset?.mode) INCOME_MODE = activeBtn.dataset.mode;

  if (toggle) {
    toggle.addEventListener("click", (e) => {
      const btn = e.target.closest(".mode-btn");
      if (!btn) return;

      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      INCOME_MODE = btn.dataset.mode || "monthly";
      calculateTax();
    });
  }

  if (incomeEl) {
    incomeEl.removeAttribute("max");
    incomeEl.addEventListener("input", calculateTax);
  }
  if (taxYearEl) taxYearEl.addEventListener("change", calculateTax);

  calculateTax();
}

/* -----------------------------
   9) DYNAMIC REVIEWS (home)
----------------------------- */
function initReviews() {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;

  const modal = document.getElementById("reviewModal");
  const openBtn = document.getElementById("openReviewModal");
  const form = document.getElementById("reviewForm");
  const nameEl = document.getElementById("reviewName");
  const textEl = document.getElementById("reviewText");
  const ratingEl = document.getElementById("reviewRating");
  const starRow = document.getElementById("starRow");

  const KEY = "ta_reviews_v1";

  const defaults = [
    { name: "Ahmed Khan", rating: 5, text: "Fast, clear requirements, and professional support.", ts: Date.now() - 86400000 * 4 },
    { name: "Fatima Ali", rating: 5, text: "They guided me step-by-step. Great experience.", ts: Date.now() - 86400000 * 3 },
    { name: "Hassan Raza", rating: 5, text: "Transparent timelines and smooth process.", ts: Date.now() - 86400000 * 2 },
  ];

  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!saved.length) {
        localStorage.setItem(KEY, JSON.stringify(defaults));
        return defaults.slice();
      }
      return saved;
    } catch {
      localStorage.setItem(KEY, JSON.stringify(defaults));
      return defaults.slice();
    }
  };

  const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));

  const stars = (n) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

  const escapeHtml = (str) =>
    String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  const render = () => {
    const list = load().sort((a, b) => (b.ts || 0) - (a.ts || 0));
    grid.innerHTML = "";
    list.slice(0, 6).forEach((r) => {
      const card = document.createElement("div");
      card.className = "testimonial-card";
      card.innerHTML = `
        <div class="stars">${stars(r.rating || 5)}</div>
        <p class="testimonial-text">"${escapeHtml(r.text)}"</p>
        <p class="testimonial-author">— ${escapeHtml(r.name)}</p>
      `;
      grid.appendChild(card);
    });
  };

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => nameEl?.focus(), 50);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  if (openBtn && modal) {
    openBtn.addEventListener("click", openModal);
    modal.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  if (starRow && ratingEl) {
    starRow.querySelectorAll(".star").forEach((s) => {
      const v = parseInt(s.dataset.value || "0", 10);
      s.classList.toggle("active", v <= 5);
    });

    starRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".star");
      if (!btn) return;
      const val = parseInt(btn.dataset.value || "5", 10);
      ratingEl.value = String(val);
      starRow.querySelectorAll(".star").forEach((s) => {
        const v = parseInt(s.dataset.value || "0", 10);
        s.classList.toggle("active", v <= val);
      });
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = String(nameEl?.value || "").trim();
      const text = String(textEl?.value || "").trim();
      const rating = Math.max(1, Math.min(5, parseInt(ratingEl?.value || "5", 10) || 5));

      if (name.length < 2) return alert("Please enter your name");
      if (text.length < 10) return alert("Please write at least 10 characters");

      const list = load();
      list.unshift({ name, text, rating, ts: Date.now() });
      save(list);

      if (nameEl) nameEl.value = "";
      if (textEl) textEl.value = "";
      if (ratingEl) ratingEl.value = "5";

      render();
      closeModal();
    });
  }

  render();
}

/* -----------------------------
   10) DOWNLOAD REPORT
----------------------------- */
function initDownloadReport() {
  const btn = document.getElementById("downloadReport");
  if (!btn) return;
  btn.addEventListener("click", downloadTaxReport);
}

function downloadTaxReport() {
  const incomeEl = document.getElementById("income");
  if (!incomeEl) return alert("Income input not found!");

  const raw = parseFloat(incomeEl.value || "0");
  if (!raw || raw <= 0) return alert("Please enter valid income first");

  const yearEl = document.getElementById("taxYear");
  const taxYear = yearEl ? yearEl.value : "2026-2027";

  const monthlyTaxText = document.getElementById("monthly-tax")?.innerText || "PKR 0";
  const annualTaxText = document.getElementById("annual-tax")?.innerText || "PKR 0";
  const annualSalaryText = document.getElementById("annual-salary")?.innerText || "PKR 0";
  const afterTaxText = document.getElementById("salary-after-tax")?.innerText || "PKR 0";

  const createdAt = new Date().toLocaleString();
  const mode = String(INCOME_MODE || "monthly").toUpperCase();

  const reportHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Tax Report - The Accountant</title>
<style>
  body{font-family:Arial,sans-serif;padding:24px;background:#f6f8fc;}
  .wrap{max-width:820px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;}
  .top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;}
  .brand{font-weight:900;font-size:18px;color:#111827;}
  .meta{color:#6b7280;font-size:12px;font-weight:700;}
  h1{font-size:20px;margin:14px 0;color:#111827;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}
  .card{border:1px solid #e5e7eb;border-radius:14px;padding:14px;}
  .label{color:#6b7280;font-weight:800;font-size:12px;}
  .value{color:#111827;font-weight:900;font-size:16px;margin-top:6px;}
  .note{margin-top:14px;color:#6b7280;font-size:12px;line-height:1.6;}
  .footer{margin-top:18px;padding-top:12px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:700;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <div class="brand">The Accountant</div>
        <div class="meta">Tax Calculation Report</div>
      </div>
      <div class="meta">Generated: ${createdAt}</div>
    </div>

    <h1>Summary</h1>

    <div class="grid">
      <div class="card"><div class="label">Tax Year</div><div class="value">${taxYear}</div></div>
      <div class="card"><div class="label">Income Mode</div><div class="value">${mode}</div></div>
      <div class="card"><div class="label">Annual Salary</div><div class="value">${annualSalaryText}</div></div>
      <div class="card"><div class="label">Annual Tax</div><div class="value">${annualTaxText}</div></div>
      <div class="card"><div class="label">Monthly Tax</div><div class="value">${monthlyTaxText}</div></div>
      <div class="card"><div class="label">Salary After Tax (Monthly)</div><div class="value">${afterTaxText}</div></div>
    </div>

    <p class="note">
      Disclaimer: This is an estimated salary tax calculation based on the selected tax year.
      Final tax may vary depending on exemptions, rebates, allowances, surcharge, and official rules.
    </p>

    <div class="footer">© 2026 The Accountant. All rights reserved.</div>
  </div>
</body>
</html>`;

  const blob = new Blob([reportHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Tax_Report_${String(taxYear).replace(/\s/g, "_")}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 800);
}
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

  for (let i = 0; i < reveals.length; i++) {

    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 120;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    }

  }

});

const reviewsSlider = document.getElementById("reviewsSlider");

if (reviewsSlider) {
  reviewsSlider.innerHTML += reviewsSlider.innerHTML;
}

function createReviewCard(review) {
  return `
    <div class="testimonial-card">
      <div class="stars">${"★".repeat(review.rating || 5)}</div>
      <p class="testimonial-text">${review.text}</p>
      <div class="client">
        <strong>${review.name}</strong>
        <span>Verified Client</span>
      </div>
    </div>
  `;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show-in");
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".popular-card, .about-box, .team-card, .faq-item, .testimonial-card").forEach((el) => {
  el.classList.add("hidden-in");
  observer.observe(el);
});

document.addEventListener("DOMContentLoaded", function () {
const revealItems = document.querySelectorAll(
  ".popular-card, .about-box, .team-card, .testimonial-card, .faq-item, .hero-stats div"
);

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-up");

    if (index % 3 === 0) {
      item.classList.add("reveal-delay-1");
    } else if (index % 3 === 1) {
      item.classList.add("reveal-delay-2");
    } else {
      item.classList.add("reveal-delay-3");
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
});

function createReviewCard(review) {
  return `
    <div class="testimonial-card">
      <div class="stars">${"★".repeat(review.rating || 5)}</div>
      <p class="testimonial-text">"${review.text}"</p>
      <div class="client">
        <strong>— ${review.name}</strong>
        <span>${review.location || "Pakistan"}</span>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  const reviewCards = document.querySelectorAll(".testimonial-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("review-show");
      }
    });
  }, { threshold: 0.15 });

  reviewCards.forEach((card, index) => {
    card.classList.add("review-hidden");
    card.style.transitionDelay = `${index * 0.12}s`;
    observer.observe(card);
  });
});

/* =========================================
   TESTIMONIAL SLIDER
========================================= */

const defaultReviews = [
  {
    name: "Nabii",
    role: "Satisfied Client",
    rating: 5,
    text: "Good website and very professional support throughout the process.",
  },
  {
    name: "Hassan Raza",
    role: "Business Client",
    rating: 5,
    text: "Transparent timelines and a smooth process. Everything was explained clearly.",
  },
  {
    name: "Fatima Ali",
    role: "Tax Filing Client",
    rating: 5,
    text: "They guided me step-by-step. Great experience and very easy communication.",
  },
  {
    name: "Ahmed Khan",
    role: "Returning Client",
    rating: 5,
    text: "Fast, clear requirements, and professional support from start to finish.",
  }
];

function getSavedReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem("siteReviews")) || [];
    return [...saved, ...defaultReviews];
  } catch (error) {
    return defaultReviews;
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderStars(rating = 5) {
  return Array.from({ length: 5 }, (_, i) =>
    `<i class="fa-solid fa-star${i < rating ? '' : '-half-stroke'}"></i>`
  ).join("");
}

function renderTestimonialSlider() {
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");

  if (!track || !dotsWrap) return;

  const reviews = getSavedReviews();

  track.innerHTML = reviews.map(review => `
    <div class="testimonial-slide">
      <div class="testimonial-card">
        <div class="testimonial-quote-icon">“</div>

        <div class="testimonial-stars">
          ${renderStars(review.rating || 5)}
        </div>

        <p class="testimonial-text">"${review.text}"</p>

        <div class="testimonial-user">
          <div class="testimonial-avatar">${getInitials(review.name)}</div>
          <h3 class="testimonial-name">${review.name}</h3>
          <p class="testimonial-role">${review.role || "Client"}</p>
        </div>
      </div>
    </div>
  `).join("");

  dotsWrap.innerHTML = reviews.map((_, index) => `
    <button class="testimonial-dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Go to review ${index + 1}"></button>
  `).join("");

  let currentIndex = 0;
  let autoSlide;
  let startX = 0;
  let endX = 0;

  const dots = dotsWrap.querySelectorAll(".testimonial-dot");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");
  const slider = document.querySelector(".testimonial-slider");

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + reviews.length) % reviews.length;
    updateSlider();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(nextSlide, 4000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlide);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.index));
      startAutoSlide();
    });
  });

  if (slider) {
    slider.addEventListener("mouseenter", stopAutoSlide);
    slider.addEventListener("mouseleave", startAutoSlide);

    slider.addEventListener("touchstart", (e) => {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        startAutoSlide();
      }
    }, { passive: true });
  }

  updateSlider();
  startAutoSlide();
}

document.addEventListener("DOMContentLoaded", renderTestimonialSlider);

/* =========================================
   REVIEW MODAL + SAVE REVIEW
========================================= */

const reviewModal = document.getElementById("reviewModal");
const openReviewModalBtn = document.getElementById("openReviewModal");
const reviewForm = document.getElementById("reviewForm");
const reviewCloseBtns = document.querySelectorAll("[data-close]");
const starButtons = document.querySelectorAll(".star");
const reviewRatingInput = document.getElementById("reviewRating");

if (openReviewModalBtn && reviewModal) {
  openReviewModalBtn.addEventListener("click", () => {
    reviewModal.classList.add("active");
    reviewModal.setAttribute("aria-hidden", "false");
  });
}

reviewCloseBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    reviewModal.classList.remove("active");
    reviewModal.setAttribute("aria-hidden", "true");
  });
});

starButtons.forEach(star => {
  star.addEventListener("click", () => {
    const value = Number(star.dataset.value);
    reviewRatingInput.value = value;

    starButtons.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.value) <= value);
    });
  });
});

if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    const rating = Number(document.getElementById("reviewRating").value) || 5;

    if (!name || !text) return;

    const newReview = {
      name,
      text,
      rating,
      role: "Verified Client"
    };

    const existing = JSON.parse(localStorage.getItem("siteReviews")) || [];
    existing.unshift(newReview);
    localStorage.setItem("siteReviews", JSON.stringify(existing));

    reviewForm.reset();
    reviewRatingInput.value = 5;

    starButtons.forEach((btn, index) => {
      btn.classList.toggle("active", index < 5);
    });

    if (reviewModal) {
      reviewModal.classList.remove("active");
      reviewModal.setAttribute("aria-hidden", "true");
    }

    renderTestimonialSlider();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     NAVBAR TOGGLE
  ========================= */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("show");
      hamburger.classList.toggle("active");
    });
  }

  /* =========================
     FAQ TOGGLE
  ========================= */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", function () {
        item.classList.toggle("active");
      });
    }
  });

  /* =========================
     TESTIMONIAL DATA
  ========================= */
  const defaultReviews = [
    {
      name: "Nabii",
      role: "Satisfied Client",
      rating: 5,
      text: "Good website and very professional support throughout the process."
    },
    {
      name: "Hassan Raza",
      role: "Business Client",
      rating: 5,
      text: "Transparent timelines and a smooth process. Everything was explained clearly."
    },
    {
      name: "Fatima Ali",
      role: "Tax Filing Client",
      rating: 5,
      text: "They guided me step-by-step. Great experience and very easy communication."
    },
    {
      name: "Ahmed Khan",
      role: "Returning Client",
      rating: 5,
      text: "Fast, clear requirements, and professional support from start to finish."
    }
  ];

  function getSavedReviews() {
    try {
      const saved = JSON.parse(localStorage.getItem("siteReviews")) || [];
      return [...saved, ...defaultReviews];
    } catch (e) {
      return defaultReviews;
    }
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderStars(rating = 5) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fa-solid fa-star"></i>`;
    }
    return stars;
  }

  /* =========================
     TESTIMONIAL SLIDER
  ========================= */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");
  const slider = document.querySelector(".testimonial-slider");

  let currentIndex = 0;
  let autoSlide;
  let startX = 0;
  let endX = 0;

  function renderTestimonialSlider() {
    if (!track || !dotsWrap) return;

    const reviews = getSavedReviews();

    track.innerHTML = reviews.map((review) => `
      <div class="testimonial-slide">
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">“</div>
          <div class="testimonial-stars">
            ${renderStars(review.rating || 5)}
          </div>
          <p class="testimonial-text">"${review.text}"</p>
          <div class="testimonial-user">
            <div class="testimonial-avatar">${getInitials(review.name)}</div>
            <h3 class="testimonial-name">${review.name}</h3>
            <p class="testimonial-role">${review.role || "Client"}</p>
          </div>
        </div>
      </div>
    `).join("");

    dotsWrap.innerHTML = reviews.map((_, index) => `
      <button class="testimonial-dot ${index === 0 ? "active" : ""}" data-index="${index}"></button>
    `).join("");

    const dots = dotsWrap.querySelectorAll(".testimonial-dot");

    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + reviews.length) % reviews.length;
      updateSlider();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlide = setInterval(nextSlide, 4000);
    }

    function stopAutoSlide() {
      clearInterval(autoSlide);
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        nextSlide();
        startAutoSlide();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = function () {
        prevSlide();
        startAutoSlide();
      };
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        goToSlide(Number(this.dataset.index));
        startAutoSlide();
      });
    });

    if (slider) {
      slider.addEventListener("mouseenter", stopAutoSlide);
      slider.addEventListener("mouseleave", startAutoSlide);

      slider.addEventListener("touchstart", function (e) {
        startX = e.changedTouches[0].clientX;
      }, { passive: true });

      slider.addEventListener("touchend", function (e) {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) nextSlide();
          else prevSlide();
          startAutoSlide();
        }
      }, { passive: true });
    }

    updateSlider();
    startAutoSlide();
  }

  renderTestimonialSlider();

  /* =========================
     REVIEW MODAL
  ========================= */
  const openBtn = document.getElementById("openReviewModal");
  const modal = document.getElementById("reviewModal");
  const closeBtns = document.querySelectorAll("[data-close]");
  const reviewForm = document.getElementById("reviewForm");
  const starButtons = document.querySelectorAll(".star");
  const ratingInput = document.getElementById("reviewRating");

  if (openBtn && modal) {
    openBtn.addEventListener("click", function () {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    });
  }

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
      }
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  });

  starButtons.forEach((star) => {
    star.addEventListener("click", function () {
      const value = Number(this.dataset.value);
      if (ratingInput) ratingInput.value = value;

      starButtons.forEach((btn) => {
        btn.classList.toggle("active", Number(btn.dataset.value) <= value);
      });
    });
  });

  starButtons.forEach((btn) => {
    if (Number(btn.dataset.value) <= 5) {
      btn.classList.add("active");
    }
  });

  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("reviewName").value.trim();
      const text = document.getElementById("reviewText").value.trim();
      const rating = Number(document.getElementById("reviewRating").value) || 5;

      if (!name || !text) return;

      const newReview = {
        name: name,
        text: text,
        rating: rating,
        role: "Verified Client"
      };

      const existingReviews = JSON.parse(localStorage.getItem("siteReviews")) || [];
      existingReviews.unshift(newReview);
      localStorage.setItem("siteReviews", JSON.stringify(existingReviews));

      reviewForm.reset();
      if (ratingInput) ratingInput.value = 5;

      starButtons.forEach((btn) => {
        btn.classList.add("active");
      });

      if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
      }

      currentIndex = 0;
      renderTestimonialSlider();
    });
  }
});



