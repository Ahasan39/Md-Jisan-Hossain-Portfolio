/* =========================================================
   Md Jisan Hossain — Portfolio (Sprint 1)
   Minimal UI wiring only. Sprint 2 will add:
   - full typing animation controller
   - portfolio filtering + lightbox
   - contact form submission to a provider
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Theme toggle (persisted) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initial = stored || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initial);
  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", String(initial === "dark"));
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      themeBtn.setAttribute("aria-pressed", String(next === "dark"));
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuToggle");
  var nav = document.getElementById("primaryNav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A") {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 6);
    if (toTop) toTop.classList.toggle("is-visible", y > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active nav link via scroll spy ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = Array.prototype.map.call(navLinks, function (a) {
    var id = a.getAttribute("href") || "";
    return id.charAt(0) === "#" ? document.querySelector(id) : null;
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = "#" + en.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ---------- Lightweight typing (visual only, Sprint 2 will formalize) ---------- */
  var typedEl = document.getElementById("typedText");
  if (typedEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var roles = [];
    try { roles = JSON.parse(typedEl.getAttribute("data-roles") || "[]"); } catch (e) {}
    if (cfg.roles && cfg.roles.length) roles = cfg.roles;
    if (roles.length > 1) {
      var i = 0, j = 0, deleting = false;
      typedEl.textContent = "";
      (function tick() {
        var full = roles[i];
        j += deleting ? -1 : 1;
        typedEl.textContent = full.slice(0, j);
        var delay = deleting ? 40 : 90;
        if (!deleting && j === full.length) { delay = 1400; deleting = true; }
        else if (deleting && j === 0) { deleting = false; i = (i + 1) % roles.length; delay = 300; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- CV link honest state ---------- */
  if (cfg.cvUrl) {
    document.querySelectorAll("[data-cv-link]").forEach(function (a) {
      a.setAttribute("href", cfg.cvUrl);
      a.setAttribute("download", "");
      a.classList.remove("is-disabled");
      a.removeAttribute("aria-disabled");
      a.removeAttribute("title");
      var badge = a.querySelector(".badge-soft");
      if (badge) badge.remove();
    });
  }

  /* ---------- Apply social URLs when configured ---------- */
  var socialMap = { FB: "facebook", IG: "instagram", IN: "linkedin", Be: "behance" };
  document.querySelectorAll(".social-link").forEach(function (a) {
    var key = socialMap[(a.textContent || "").trim()];
    var url = key && cfg.social && cfg.social[key];
    if (url) {
      a.setAttribute("href", url);
      a.setAttribute("rel", "noopener");
      a.setAttribute("target", "_blank");
    }
  });

  /* ---------- Portfolio filter (basic Sprint 1 wiring; Sprint 2 will refine) ---------- */
  var filters = document.querySelectorAll(".filter");
  var works = document.querySelectorAll(".work");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var want = btn.getAttribute("data-filter") || "all";
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      works.forEach(function (w) {
        var cat = w.getAttribute("data-category") || "";
        w.style.display = (want === "all" || cat === want) ? "" : "none";
      });
    });
  });

  /* ---------- Contact form (visual validation only — Sprint 2 handles sending) ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["cf-name", "cf-email", "cf-message"].forEach(function (id) {
        var input = document.getElementById(id);
        var msg = form.querySelector('[data-for="' + id + '"]');
        if (!input) return;
        if (!input.value.trim()) {
          if (msg) msg.textContent = "This field is required.";
          ok = false;
        } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          if (msg) msg.textContent = "Please enter a valid email.";
          ok = false;
        } else if (msg) {
          msg.textContent = "";
        }
      });
      if (!ok) {
        if (status) status.textContent = "Please correct the highlighted fields.";
        return;
      }
      if (status) status.textContent = "Message sending is not yet connected. Please email directly for now.";
    });
  }
})();
