/* =========================================================
   Md Jisan Hossain — Portfolio (Sprint 2)
   Interactions: theme, mobile nav (+ Escape),
   scroll spy, typing, reveal, counters, portfolio filter,
   accessible lightbox, contact form validation, honest states.
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  function syncThemeBtn() {
    if (!themeBtn) return;
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  syncThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeBtn();
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuToggle");
  var nav = document.getElementById("primaryNav");
  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A") closeMenu();
    });
  }

  /* ---------- Escape handler (menu + lightbox) ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (lightbox && lightbox.getAttribute("aria-hidden") === "false") {
      closeLightbox();
      return;
    }
    if (nav && nav.classList.contains("is-open")) closeMenu();
  });

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
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Scroll spy ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sectionsForNav = Array.prototype.map.call(navLinks, function (a) {
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
    sectionsForNav.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Typing animation ---------- */
  var typedEl = document.getElementById("typedText");
  if (typedEl && !reduceMotion) {
    var roles = [];
    try { roles = JSON.parse(typedEl.getAttribute("data-roles") || "[]"); } catch (e) {}
    if (cfg.roles && cfg.roles.length) roles = cfg.roles;
    if (roles.length > 1) {
      // Reserve width so layout does not jump.
      var longest = roles.reduce(function (a, b) { return b.length > a.length ? b : a; }, "");
      typedEl.style.display = "inline-block";
      typedEl.style.minWidth = Math.min(longest.length, 22) + "ch";
      var i = 0, j = 0, deleting = false, timer = null;
      typedEl.textContent = "";
      function tick() {
        var full = roles[i];
        j += deleting ? -1 : 1;
        typedEl.textContent = full.slice(0, j);
        var delay = deleting ? 40 : 90;
        if (!deleting && j === full.length) { delay = 1400; deleting = true; }
        else if (deleting && j === 0) { deleting = false; i = (i + 1) % roles.length; delay = 320; }
        timer = setTimeout(tick, delay);
      }
      tick();
      // Pause when tab hidden to save CPU.
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { if (timer) { clearTimeout(timer); timer = null; } }
        else if (!timer) { tick(); }
      });
    }
  }

  /* ---------- Counters ---------- */
  var countEls = document.querySelectorAll("[data-count-to]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    var suffix = el.getAttribute("data-count-suffix") || "";
    if (reduceMotion || target <= 0) { el.textContent = target + suffix; return; }
    var start = performance.now();
    var dur = 900;
    function step(ts) {
      var p = Math.min(1, (ts - start) / dur);
      var val = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && countEls.length) {
    var cio = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    countEls.forEach(function (el) { cio.observe(el); });
  } else {
    countEls.forEach(runCounter);
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

  /* ---------- Social links (render only configured ones) ----------
     SVG paths are from Simple Icons (CC0). Each uses viewBox 0 0 24 24
     and relies on fill:currentColor from CSS for theme-aware color.
  */
  var SOCIAL_META = {
    facebook: {
      label: "Facebook",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
    },
    instagram: {
      label: "Instagram",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>'
    },
    linkedin: {
      label: "LinkedIn",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
    },
    behance: {
      label: "Behance",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.799 5.698c.589 0 1.12.051 1.606.156.483.102.9.273 1.241.507.343.235.611.546.804.938.188.387.282.871.282 1.443 0 .619-.141 1.137-.421 1.551-.284.413-.7.751-1.255 1.014.756.218 1.317.6 1.69 1.146.374.546.557 1.209.557 1.983 0 .631-.122 1.172-.365 1.636a3.095 3.095 0 0 1-.985 1.112c-.411.293-.892.509-1.432.651A6.59 6.59 0 0 1 7.866 18H0V5.698h7.799zm-.339 4.983c.485 0 .882-.113 1.195-.344.312-.23.464-.606.464-1.126 0-.291-.051-.527-.158-.715a1.142 1.142 0 0 0-.434-.436 1.826 1.826 0 0 0-.634-.213 4.387 4.387 0 0 0-.737-.059h-3.4v2.892h3.704zm.203 5.236c.265 0 .521-.025.762-.077a1.84 1.84 0 0 0 .649-.263 1.33 1.33 0 0 0 .442-.5c.107-.21.165-.481.165-.812 0-.654-.183-1.126-.552-1.419-.368-.286-.864-.429-1.481-.429H3.76v3.5h3.903zm10.73-.164c.479.465 1.169.697 2.063.697.642 0 1.195-.159 1.654-.482.464-.323.746-.665.854-1.025h2.631c-.421 1.306-1.064 2.242-1.938 2.802-.874.558-1.932.839-3.167.839a6.57 6.57 0 0 1-2.325-.398 4.999 4.999 0 0 1-1.767-1.14 5.147 5.147 0 0 1-1.117-1.792 6.46 6.46 0 0 1-.395-2.307c0-.812.136-1.566.407-2.267a5.335 5.335 0 0 1 1.147-1.798 5.366 5.366 0 0 1 1.767-1.188c.682-.286 1.436-.429 2.267-.429.923 0 1.729.18 2.418.541a5.023 5.023 0 0 1 1.73 1.436c.459.6.787 1.284.991 2.058.199.77.263 1.577.198 2.42h-7.228c0 .827.282 1.615.81 2.034zm3.655-5.323c-.381-.42-1.027-.643-1.714-.643-.449 0-.825.077-1.123.228-.302.154-.542.339-.726.556a2.13 2.13 0 0 0-.395.745 3.07 3.07 0 0 0-.121.649h4.481c-.063-.698-.303-1.112-.402-1.535zM15.503 6.9h5.731v1.391h-5.731z"/></svg>'
    },
    dribbble: {
      label: "Dribbble",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.085.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>'
    },
    github: {
      label: "GitHub",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
    },
    youtube: {
      label: "YouTube",
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
    }
  };

  // keys: optional whitelist (array). If omitted, render all configured platforms.
  function renderSocialInto(row, keys) {
    if (!row || !cfg.social) return;
    row.innerHTML = "";
    var list = keys || Object.keys(SOCIAL_META);
    list.forEach(function (key) {
      var meta = SOCIAL_META[key];
      var url = cfg.social[key];
      if (!meta || !url) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "social-link";
      a.setAttribute("href", url);
      a.setAttribute("aria-label", meta.label);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.innerHTML = meta.svg;
      li.appendChild(a);
      row.appendChild(li);
    });
  }
  // Contact section: show ONLY configured platforms (honest-no-fake-links).
  renderSocialInto(document.getElementById("socialRow"));

  // Footer profile: always render Facebook, LinkedIn, YouTube.
  // TEMPORARY — URLs fall back to "#" until real profile links are added to
  // js/config.js. The click handler below prevents "#" from jumping the page.
  // This placeholder behavior is scoped to #socialRowFooter only; the Contact
  // section above continues to render only properly configured URLs.
  (function renderFooterSocialPlaceholders() {
    var row = document.getElementById("socialRowFooter");
    if (!row) return;
    row.innerHTML = "";
    ["facebook", "linkedin", "youtube"].forEach(function (key) {
      var meta = SOCIAL_META[key];
      if (!meta) return;
      var url = (cfg.social && cfg.social[key]) || "#";
      var isPlaceholder = url === "#";
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "social-link";
      a.setAttribute("href", url);
      a.setAttribute("aria-label", meta.label + (isPlaceholder ? " (coming soon)" : ""));
      if (!isPlaceholder) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      } else {
        a.addEventListener("click", function (e) { e.preventDefault(); });
      }
      a.innerHTML = meta.svg;
      li.appendChild(a);
      row.appendChild(li);
    });
  })();

  /* ---------- Portfolio filter ---------- */
  var filters = document.querySelectorAll(".filter");
  var works = document.querySelectorAll(".work");
  var emptyMsg = document.getElementById("portfolioEmpty");
  function applyFilter(want) {
    var shown = 0;
    works.forEach(function (w) {
      var cat = w.getAttribute("data-category") || "";
      var show = (want === "all" || cat === want);
      w.style.display = show ? "" : "none";
      if (show) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown > 0;
  }
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var want = btn.getAttribute("data-filter") || "all";
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      applyFilter(want);
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbMedia = document.getElementById("lightboxMedia");
  var lbTitle = document.getElementById("lightboxTitle");
  var lbCat = document.getElementById("lightboxCat");
  var lbClose = document.getElementById("lightboxClose");
  var lastTrigger = null;

  function trapFocus(e) {
    if (!lightbox || lightbox.getAttribute("aria-hidden") !== "false") return;
    if (e.key !== "Tab") return;
    var f = lightbox.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openLightbox(trigger) {
    if (!lightbox) return;
    lastTrigger = trigger;
    var title = trigger.getAttribute("data-title") || "Portfolio item";
    var cat = trigger.getAttribute("data-cat") || "";
    if (lbTitle) lbTitle.textContent = title;
    if (lbCat) lbCat.textContent = cat;
    if (lbMedia) {
      lbMedia.innerHTML = "";
      var span = document.createElement("span");
      span.textContent = title;
      lbMedia.appendChild(span);
    }
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.setAttribute("aria-hidden", "false");
    });
    document.body.classList.add("lb-open");
    document.addEventListener("keydown", trapFocus);
    setTimeout(function () { if (lbClose) lbClose.focus(); }, 10);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.hidden = true;
    document.body.classList.remove("lb-open");
    document.removeEventListener("keydown", trapFocus);
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  }

  document.querySelectorAll(".work-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () { openLightbox(btn); });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.hasAttribute && t.hasAttribute("data-lb-close")) closeLightbox();
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function setError(id, msg) {
    var input = document.getElementById(id);
    var small = form.querySelector('[data-for="' + id + '"]');
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (small) small.textContent = msg || "";
  }

  if (form) {
    ["cf-name", "cf-email", "cf-message"].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener("input", function () { setError(id, ""); if (status) status.textContent = ""; });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var message = document.getElementById("cf-message");

      if (!name.value.trim()) { setError("cf-name", "Please enter your name."); ok = false; } else setError("cf-name", "");
      if (!email.value.trim()) { setError("cf-email", "Please enter your email."); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setError("cf-email", "Please enter a valid email."); ok = false; }
      else setError("cf-email", "");
      if (!message.value.trim()) { setError("cf-message", "Please write a short message."); ok = false; } else setError("cf-message", "");

      if (!ok) {
        if (status) status.textContent = "Please correct the highlighted fields.";
        return;
      }

      var providerCfg = (cfg.form && cfg.form.provider && cfg.form.endpoint) ? cfg.form : null;
      if (!providerCfg) {
        if (status) {
          var mail = (cfg.owner && cfg.owner.email) ? cfg.owner.email : "mdjisanhossain.info327@gmail.com";
          status.innerHTML = 'Online submission is not enabled yet. Please email <a href="mailto:' + mail + '">' + mail + '</a> directly.';
        }
        return;
      }

      // Provider wiring (Formspree-style endpoint) — only used when configured.
      if (status) status.textContent = "Sending…";
      var fd = new FormData(form);
      fetch(providerCfg.endpoint, { method: "POST", body: fd, headers: { "Accept": "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("Request failed with status " + r.status);
          form.reset();
          if (status) status.textContent = "Thanks! Your message has been sent.";
        })
        .catch(function () {
          if (status) status.textContent = "Something went wrong. Please email directly instead.";
        });
    });
  }
})();
