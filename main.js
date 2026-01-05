// =============================================================================
// Background music
// ============================================================================

// (() => {
//   const loader = document.getElementById("loader");
//   const ringWrap = loader.querySelector(".ring-wrap");
//   const pctEl = document.getElementById("pct");

//   const bgMusic = document.getElementById("bgMusic");
//   const musicIcon = document.getElementById("musicIcon");

//   // 🎵 main tracks
//   const mainTracks = [
//     "./music/background-music-01.mp3",
//     "./music/background-music-02.mp3",
//   ];

//   // 🎵 last track
//   const lastTrack = "./music/contact-background-music-02.mp3";

//   let queue = [];
//   let isPlaying = false;

//   function loadTrack(src) {
//     if (!bgMusic) return;
//     bgMusic.src = src;
//     bgMusic.load();
//   }

//   // Build one full cycle:
//   // random (01 or 02) -> the other one -> contact track
//   function buildCycleQueue() {
//     const first = Math.random() < 0.5 ? 0 : 1; // 50/50
//     const second = 1 - first;

//     queue = [
//       mainTracks[first],
//       mainTracks[second],
//       lastTrack,
//     ];
//   }

//   // play next track when current ends
//   if (bgMusic) {
//     bgMusic.addEventListener("ended", async () => {
//       if (queue.length === 0) buildCycleQueue();

//       const nextSrc = queue.shift();
//       loadTrack(nextSrc);

//       try {
//         await bgMusic.play();
//         isPlaying = true;
//         if (musicIcon) musicIcon.src = "./icons/Musical.svg";
//       } catch (e) {
//         console.warn("Playback failed:", e);
//       }
//     });
//   }

//   // Start music on user gesture (enter)
//   async function startBackgroundMusicFromUserGesture() {
//     if (!bgMusic) return;

//     try {
//       bgMusic.volume = 0.7;

//       // start a fresh cycle
//       buildCycleQueue();

//       // play first track from the queue
//       const firstSrc = queue.shift();
//       loadTrack(firstSrc);

//       await bgMusic.play();
//       isPlaying = true;
//       if (musicIcon) musicIcon.src = "./icons/Musical.svg";
//     } catch (e) {
//       console.warn("Playback failed:", e);
//       // If blocked, keep icon in "No Music" state
//       isPlaying = false;
//       if (musicIcon) musicIcon.src = "./icons/No Music.svg";
//     }
//   }

//   // toggle play / pause
//   if (musicIcon && bgMusic) {
//     musicIcon.addEventListener("click", async (e) => {
//       // prevent this click from also triggering "enter" if loader is still up
//       e.stopPropagation();

//       if (isPlaying) {
//         bgMusic.pause();
//         musicIcon.src = "./icons/No Music.svg";
//         isPlaying = false;
//       } else {
//         try {
//           await bgMusic.play();
//           musicIcon.src = "./icons/Musical.svg";
//           isPlaying = true;
//         } catch (err) {
//           console.warn("Playback failed:", err);
//         }
//       }
//     });
//   }

//   // ----------------------------
//   // 1) DEFINE YOUR CRITICAL ASSETS
//   // ----------------------------
//   const ASSETS = [
//     // Loader assets
//     { type: "image", url: "./images/dim-loading-screen.png" },
//     { type: "image", url: "./images/loading-screen.png" },
//     { type: "image", url: "./images/start-loading-text.png" },

//     // Home / hero assets
//     { type: "image", url: "./icons/moon-logo.png" },
//     { type: "image", url: "./icons/moon-logo-color-state.png" },
//     { type: "image", url: "./images/profile.png" },
//     { type: "image", url: "./images/id-card-profile.png" },
//     { type: "image", url: "./images/inner-ring.png" },
//     { type: "image", url: "./images/outer-ring.png" },
//     { type: "image", url: "./images/solar-ring.png" },
//     { type: "image", url: "./images/upper-cloud-1.png" },
//     { type: "image", url: "./images/upper-cloud-2.png" },
//     { type: "image", url: "./images/upper-cloud-3.png" },
//     { type: "image", url: "./images/upper-cloud-4.png" },

//     { type: "video", url: "./videos/home-loop.mp4" },
//     { type: "video", url: "./videos/h1.mp4" },
//     { type: "video", url: "./videos/button.mp4" },
//     { type: "video", url: "./videos/blackhole.mp4" },
//     { type: "video", url: "./videos/fancy-login-page-first-project.mp4" },
//     { type: "video", url: "./videos/Laundry-weather-forcast-project.mp4" },
//     { type: "video", url: "./videos/Julvry-project.mp4" },
//   ];

//   // ----------------------------
//   // 2) FONT DEFINITIONS
//   // ----------------------------
//   const FONTS = [
//     "400 1em Orbitron",
//     "700 1em Orbitron",
//     "400 1em Inter",
//     "600 1em Inter"
//   ];

//   // ----------------------------
//   // 3) HELPERS: smooth progress UI
//   // ----------------------------
//   let displayed = 0;
//   let target = 0;
//   let rafId = null;

//   function setProgress(p) {
//     target = Math.max(0, Math.min(100, p));
//     if (!rafId) animateProgress();
//   }

//   function animateProgress() {
//     displayed += (target - displayed) * 0.12;
//     if (Math.abs(target - displayed) < 0.2) displayed = target;

//     ringWrap.style.setProperty("--p", displayed.toFixed(2));
//     pctEl.textContent = `${Math.round(displayed)}%`;

//     if (displayed !== target) rafId = requestAnimationFrame(animateProgress);
//     else rafId = null;
//   }

//   // ----------------------------
//   // 4) LOADERS
//   // ----------------------------
//   function loadImage(url) {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = async () => {
//         if (img.decode) {
//           try { await img.decode(); } catch {}
//         }
//         resolve();
//       };
//       img.onerror = () => reject(new Error("Image failed: " + url));
//       img.src = url;
//     });
//   }

//   function loadVideo(url) {
//     return new Promise((resolve, reject) => {
//       const v = document.createElement("video");
//       v.preload = "auto";
//       v.muted = true;
//       v.playsInline = true;
//       v.oncanplaythrough = () => resolve();
//       v.onerror = () => reject(new Error("Video failed: " + url));
//       v.src = url;
//       v.load();
//     });
//   }

//   function loadFonts() {
//     if (!document.fonts) return Promise.resolve();
//     FONTS.forEach(font => { try { document.fonts.load(font); } catch {} });
//     return document.fonts.ready;
//   }

//   // ----------------------------
//   // 5) MAIN LOADING FLOW
//   // ----------------------------
//   async function startLoading() {
//     document.documentElement.style.overflow = "hidden";
//     document.body.style.overflow = "hidden";

//     const tasks = [loadFonts()];
//     for (const a of ASSETS) {
//       if (a.type === "image") tasks.push(loadImage(a.url));
//       if (a.type === "video") tasks.push(loadVideo(a.url));
//     }

//     const total = tasks.length;
//     let done = 0;

//     setProgress(0);

//     const wrapped = tasks.map(p =>
//       p.then(() => {
//         done++;
//         setProgress((done / total) * 100);
//       }).catch(err => {
//         console.warn(err);
//         done++;
//         setProgress((done / total) * 100);
//       })
//     );

//     const TIMEOUT_MS = 15000;
//     const timeout = new Promise(r => setTimeout(r, TIMEOUT_MS));

//     await Promise.race([Promise.allSettled(wrapped), timeout]);

//     setProgress(100);
//     await new Promise(r => setTimeout(r, 350));

//     loader.classList.add("ready");

//     // Click anywhere to enter (THIS is the user gesture we use to start music)
//     const enter = async () => {
//       // Start music FIRST (still within the user gesture)
//       await startBackgroundMusicFromUserGesture();

//       // Preload blackhole video (so it's ready when we scroll to About)
//       const bh = document.getElementById("bhVideo");
//       if (bh) {
//         try {
//           bh.muted = true;
//           bh.playsInline = true;

//           await bh.play();   // force decode + GPU upload
//           bh.pause();
//           bh.currentTime = 0;
//         } catch (e) {
//           // Safari / power-save may block — safe to ignore
//         }
//       }

//       // Phase 1: start reveal (ring fades + bg fades + clouds start moving)
//       loader.classList.add("reveal");

//       // Phase 2: let clouds keep moving while page is already visible
//       setTimeout(() => {
//         loader.classList.add("cloud-out"); // clouds fade out later
//       }, 600);

//       // Phase 3: remove loader after clouds are gone
//       setTimeout(() => {
//         loader.style.display = "none";
//         document.documentElement.style.overflow = "";
//         document.body.style.overflow = "";
//       }, 2400);
//     };

//     window.addEventListener("pointerdown", enter, { once: true });
//   }

//   startLoading();
// })();

// =============================================================================
// Icons flip animation
// ============================================================================

const icons = document.querySelectorAll(".icons");

icons.forEach((icon) => {
  icon.addEventListener("mouseenter", () => {
    if (icon.dataset.locked === "1") return;

    icon.dataset.locked = "1";
    icon.classList.add("is-flipped");
  });

  icon.addEventListener("animationend", (e) => {
    if (e.animationName !== "flip") return;

    icon.classList.remove("is-flipped"); // allow replay
    icon.dataset.locked = "0";
  });
});

// =============================================================================
// Languages Display
// ============================================================================

const langIcon = document.getElementById("langIcon");
const langContainer = document.querySelector(".lang-container");
const langItems = document.querySelectorAll(".languages .lang");

// --- Config ---
const SUPPORTED = ["en", "ja"]; // add "km" later if you want
const DEFAULT_LANG = "en";

// --- i18n state ---
let dict = {};

// ---------- Helpers ----------
function safeLang(lang) {
  return SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
}

function getSavedLang() {
  return safeLang(localStorage.getItem("lang") || "");
}

function getBrowserLang() {
  const b = (navigator.language || "").slice(0, 2).toLowerCase();
  return safeLang(b);
}

function setActiveLangUI(lang) {
  langItems.forEach((el) => {
    el.classList.toggle("active", el.dataset.lang === lang);
  });
}

// ---------- Load + Apply Translations ----------
async function fetchDict(lang) {
  // Works even if index.html is nested in folders
  const url = new URL(`locales/${lang}.json`, document.baseURI);

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Missing locale file: ${lang} (${res.status})`);
  return res.json();
}

function syncSectionTitleShadows() {
  // Keeps your CSS animation but makes the pseudo-element text translate
  // CSS should use: .section-title::after { content: attr(data-shadow); }
  document.querySelectorAll(".section-title").forEach((titleEl) => {
    const textEl = titleEl.querySelector("[data-i18n]");
    if (textEl) {
      titleEl.setAttribute("data-shadow", textEl.textContent.trim());
    }
  });
}

function applyDict(lang) {
  // text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = dict[key];
    if (val != null) el.textContent = val;
  });

  // placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = dict[key];
    if (val != null) el.setAttribute("placeholder", val);
  });

  // titles (optional)
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const val = dict[key];
    if (val != null) el.setAttribute("title", val);
  });

  // SPECIAL: attribute translations (for things like data-text)
  document.querySelectorAll("[data-i18n-attr][data-i18n-key]").forEach((el) => {
    const attr = el.getAttribute("data-i18n-attr");
    const key = el.getAttribute("data-i18n-key");
    const val = dict[key];
    if (attr && key && val != null) el.setAttribute(attr, val);
  });

   if (typeof window.refreshH1Title === "function") {
    window.refreshH1Title();
  }

  // Sync animated section title shadow text after translations applied
  syncSectionTitleShadows();

  document.documentElement.lang = lang;
}

async function setLang(lang) {
  const l = safeLang(lang);

  try {
    dict = await fetchDict(l);
    applyDict(l);
  } catch (err) {
    console.warn(`Locale "${l}" not loaded yet (using HTML fallback):`, err);
    document.documentElement.lang = l;

    // Even with fallback, still sync section title shadows from current HTML
    syncSectionTitleShadows();
  }

  localStorage.setItem("lang", l);
  setActiveLangUI(l);
  return l;
}

// ---------- Modal open/close ----------
langIcon?.addEventListener("click", (e) => {
  e.stopPropagation();
  langContainer.hidden = false;
});

// click anywhere closes, but clicking inside .languages won't close
document.addEventListener("click", (e) => {
  if (!langContainer.hidden && !e.target.closest(".languages")) {
    langContainer.hidden = true;
  }
});

// ESC closes
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !langContainer.hidden) {
    langContainer.hidden = true;
  }
});

// ---------- Language selection clicks ----------
langItems.forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.stopPropagation();
    const lang = el.dataset.lang; // expects data-lang="en" / "ja"
    await setLang(lang);
    langContainer.hidden = true;
  });
});

// ---------- Init on load ----------
(async function initLanguage() {
  const initial = getSavedLang() || getBrowserLang() || DEFAULT_LANG;

  // highlight immediately
  setActiveLangUI(initial);

  // sync section title shadows immediately from fallback HTML
  syncSectionTitleShadows();

  // then try to load translations
  await setLang(initial);
})();

// =============================================================================
// PDF Display
// ============================================================================

// -------- Download PDF Modal Logic --------
const downloadIcon = document.getElementById("downloadIcon");
const pdfModal = document.getElementById("downloadPDF");
const previewImg = document.getElementById("previewImg");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

// Safety checks (so it won't crash if elements aren't on some page)
if (downloadIcon && pdfModal && previewImg && downloadPdfBtn) {
  function openPDFModal() {
    pdfModal.hidden = false;
    document.body.classList.add("pdf-open");
  }

  function closePDFModal() {
    pdfModal.hidden = true;
    document.body.classList.remove("pdf-open");

    // If fullscreen is active, exit it
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  downloadIcon.addEventListener("click", openPDFModal);

  // Close when clicking backdrop or close button
  pdfModal.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closePDFModal();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pdfModal.hidden) closePDFModal();
  });

  // Click image -> fullscreen toggle
  previewImg.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await previewImg.requestFullscreen();
        previewImg.style.cursor = "zoom-out";
      } else {
        await document.exitFullscreen();
        previewImg.style.cursor = "zoom-in";
      }
    } catch (_) {}
  });

  // Click anywhere (outside image) to exit fullscreen (but keep modal open)
  document.addEventListener("click", (e) => {
    if (!document.fullscreenElement) return;
    if (e.target === previewImg) return;
    document.exitFullscreen().catch(() => {});
  });

  // Download as PDF using jsPDF
  downloadPdfBtn.addEventListener("click", async () => {
    // jsPDF is loaded via CDN as window.jspdf
    if (!window.jspdf?.jsPDF) {
      alert("jsPDF not loaded. Make sure the CDN script is included.");
      return;
    }

    const { jsPDF } = window.jspdf;

    // ensure image is loaded
    await new Promise((resolve, reject) => {
      if (previewImg.complete && previewImg.naturalWidth) return resolve();
      previewImg.onload = resolve;
      previewImg.onerror = reject;
    });

    const imgW = previewImg.naturalWidth;
    const imgH = previewImg.naturalHeight;

    const pdf = new jsPDF({
      orientation: imgW > imgH ? "landscape" : "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const scale = Math.min(pageW / imgW, pageH / imgH);
    const w = imgW * scale;
    const h = imgH * scale;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;

    // Canvas -> dataURL (works reliably)
    const canvas = document.createElement("canvas");
    canvas.width = imgW;
    canvas.height = imgH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(previewImg, 0, 0);

    const isPng = (previewImg.src || "").toLowerCase().includes(".png");
    const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 1.0);

    pdf.addImage(dataUrl, isPng ? "PNG" : "JPEG", x, y, w, h);
    pdf.save("resume.pdf");
  });
}

// =============================================================================
// Logo
// ============================================================================

const logoWhiteState = document.querySelector(".logo-white-state");
const logoColorState = document.querySelector(".logo-color-state");
const navbar = document.getElementById("navbar");

logoWhiteState.addEventListener("click", () => {
  logoWhiteState.classList.remove("deactive");
  logoWhiteState.classList.add("active");
  navbar.classList.add("active");
  navbar.classList.remove("deactive");
});

logoColorState.addEventListener("click", () => {
  logoWhiteState.classList.remove("active");
  logoWhiteState.classList.add("deactive");
  navbar.classList.add("deactive");
  navbar.classList.remove("active");
});

logoColorState.addEventListener("mouseenter", () => {
  logoColorState.classList.add("active");
});
logoColorState.addEventListener("mouseleave", () => {
  logoColorState.classList.remove("active");
});

// =============================================================================
// Bottom Navigation - FIXED VERSION
// =============================================================================

(() => {
  const bottomNav = document.getElementById("bottomNav");
  if (!bottomNav) return;

  const links = Array.from(bottomNav.querySelectorAll("a"));

  // -----------------------------
  // 0) Find the REAL scrolling element
  // -----------------------------
  function getScrollElement() {
    // common candidates in snap layouts
    const candidates = [
      document.querySelector("#snap-root"),
      document.querySelector(".snap-container"),
      document.querySelector(".snap-root"),
      document.querySelector("main"),
      document.scrollingElement, // usually <html> or <body>
      document.documentElement,
      document.body,
    ].filter(Boolean);

    // Pick the first one that is actually scrollable.
    // (scrollHeight > clientHeight AND overflow allows scroll)
    for (const el of candidates) {
      if (!(el instanceof Element)) continue;
      const cs = getComputedStyle(el);
      const overflowY = cs.overflowY;
      const scrollable =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        el.scrollHeight > el.clientHeight + 2;

      if (scrollable) return el;
    }

    // Fallback: the browser scrolling element
    return document.scrollingElement || document.documentElement;
  }

  const scrollEl = getScrollElement(); // the actual scroll container
  const useRoot = scrollEl !== document.documentElement && scrollEl !== document.body && scrollEl !== document.scrollingElement
    ? scrollEl
    : null; // IntersectionObserver root: null = viewport

  // -----------------------------
  // Track ONLY sections you want to highlight
  // -----------------------------
  const mapHrefToSectionId = {
    home: "home",
    about: "about",
    skills: "skills",
    projects: "projects",
    // contact is overlay (not scroll-tracked)
    locked: "locked",
  };

  // -----------------------------
  // A) Hide nav when user stops scrolling
  // -----------------------------
  let hideTimer = null;
  const HIDE_DELAY = 2500;
  let isHoveringNav = false;

  function showNav() {
    bottomNav.classList.remove("is-hidden");
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isHoveringNav) bottomNav.classList.add("is-hidden");
    }, HIDE_DELAY);
  }

  function setActiveLink(navKey) {
    links.forEach((a) => {
      const key = a.getAttribute("href")?.replace("#", "");
      a.classList.toggle("active", key === navKey);
    });
  }

  // expose for Contact overlay
  window.setBottomNavActive = setActiveLink;

  function activateSection(sectionEl) {
    sectionEl.classList.add("in-view");
  }

  // -----------------------------
  // B) Build section targets
  // -----------------------------
  const sections = Object.entries(mapHrefToSectionId)
    .map(([navKey, sectionId]) => {
      const el = document.getElementById(sectionId);
      if (!el) return null;

      const tag = el.tagName;
      if (tag !== "SECTION" && tag !== "HEADER") return null;

      return { navKey, el };
    })
    .filter(Boolean);

  if (!sections.length) return;

  // -----------------------------
  // C) Fallback scanline method (always works)
  // -----------------------------
  function updateActiveByScanline() {
    // freeze highlight if contact overlay open
    if (typeof window.isContactOpen === "function" && window.isContactOpen()) {
      setActiveLink("contact");
      return;
    }

    // scanline relative to viewport
    const scanY = window.innerHeight * 0.35;
    let current = sections[0];

    for (const s of sections) {
      const top = s.el.getBoundingClientRect().top;
      if (top <= scanY) current = s;
    }

    setActiveLink(current.navKey);
    activateSection(current.el);
  }

  // -----------------------------
  // D) Scroll settle watcher (fixes snap "finishes after last input")
  // -----------------------------
  let rafId = 0;
  let lastTop = null;
  let stillFrames = 0;

  function kickSettleWatcher() {
    cancelAnimationFrame(rafId);
    lastTop = null;
    stillFrames = 0;

    const loop = () => {
      const topNow =
        useRoot && scrollEl instanceof Element
          ? scrollEl.scrollTop
          : (document.scrollingElement || document.documentElement).scrollTop;

      if (lastTop === null) {
        lastTop = topNow;
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (Math.abs(topNow - lastTop) < 0.5) {
        stillFrames += 1;
      } else {
        stillFrames = 0;
      }

      lastTop = topNow;

      // after ~6 frames of no movement, snap has settled
      if (stillFrames >= 6) {
        updateActiveByScanline();
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  function onUserScrollLikeEvent() {
    showNav();
    if (!isHoveringNav) scheduleHide();
    updateActiveByScanline();
    kickSettleWatcher();
  }

  // Listen on the real scroll element
  scrollEl.addEventListener("scroll", onUserScrollLikeEvent, { passive: true });
  window.addEventListener("resize", updateActiveByScanline);

  // Start hidden
  bottomNav.classList.add("is-hidden");

  // -----------------------------
  // E) Hover keep visible
  // -----------------------------
  bottomNav.addEventListener("mouseenter", () => {
    isHoveringNav = true;
    showNav();
    clearTimeout(hideTimer);
  });

  bottomNav.addEventListener("mouseleave", () => {
    isHoveringNav = false;
    scheduleHide();
  });

  bottomNav.addEventListener("focusin", () => {
    isHoveringNav = true;
    showNav();
    clearTimeout(hideTimer);
  });

  bottomNav.addEventListener("focusout", () => {
    isHoveringNav = false;
    scheduleHide();
  });

  // -----------------------------
  // F) Click behavior (immediate highlight + respects contact overlay router)
  // -----------------------------
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      showNav();
      clearTimeout(hideTimer);

      // Delegate to overlay router if present (handles fading contact)
      if (typeof window.contactOverlayNavigate === "function") {
        window.contactOverlayNavigate(href);
        setActiveLink(href.replace("#", "")); // immediate
        if (!isHoveringNav) scheduleHide();
        return;
      }

      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveLink(href.replace("#", ""));
      if (!isHoveringNav) scheduleHide();
    });
  });

  // -----------------------------
  // G) IntersectionObserver (fast + snap-friendly when root is correct)
  // -----------------------------
  const io = new IntersectionObserver(
    (entries) => {
      if (typeof window.isContactOpen === "function" && window.isContactOpen()) {
        setActiveLink("contact");
        return;
      }

      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible[0]) return;

      const el = visible[0].target;
      const match = sections.find((s) => s.el === el);
      if (!match) return;

      setActiveLink(match.navKey);
      activateSection(match.el);
    },
    {
      root: useRoot, // ✅ correct root (null = viewport)
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-10% 0px -55% 0px",
    }
  );

  sections.forEach((s) => io.observe(s.el));

  // initial state
  updateActiveByScanline();
})();

// =============================================================================
// H1's background
// =============================================================================

const h1 = document.querySelector(".video-h1");
const video = document.getElementById("h1vid");
const canvas = document.getElementById("h1canvas");
const ctx = canvas.getContext("2d");

// 0–1 range (like object-position percentages)
let posX = 0.5;
let posY = 0.9;

// keep a vertical padding so glyphs never clip at the top
let textOffsetY = 0;

function resizeCanvas() {
  const text = h1.dataset.text || "";
  const style = getComputedStyle(h1);

  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = ctx.measureText(text);

  const padX = 8; // a bit wider so edges don't clip
  const padY = 8; // vertical breathing room (top + bottom)

  // Use real font bounding boxes when available (best + fixes top clipping)
  const ascent = metrics.actualBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.9;
  const descent = metrics.actualBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.3;

  canvas.width = Math.ceil(metrics.width + padX);
  canvas.height = Math.ceil(ascent + descent + padY);

  // draw baseline position so text sits fully inside canvas
  // we draw with alphabetic baseline at y = ascent (+ a tiny extra)
  textOffsetY = Math.ceil(ascent + 2);
}

function draw() {
  if (video.readyState >= 2) {
    const text = h1.dataset.text || "";
    const style = getComputedStyle(h1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw text mask
    ctx.save();
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.textBaseline = "alphabetic"; // ✅ avoids top clipping vs "top"
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, textOffsetY);

    // clip video into text
    ctx.globalCompositeOperation = "source-in";

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cw = canvas.width;
    const ch = canvas.height;

    // object-fit: cover
    const scale = Math.max(cw / vw, ch / vh);
    const sw = vw * scale;
    const sh = vh * scale;

    // object-position: posX posY
    const dx = (cw - sw) * posX;
    const dy = (ch - sh) * posY;

    ctx.drawImage(video, dx, dy, sw, sh);

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  requestAnimationFrame(draw);
}

video.addEventListener("loadeddata", () => {
  resizeCanvas();
  video.play().catch(() => {});
  draw();
});

window.addEventListener("resize", resizeCanvas);

// ✅ Allow i18n system to force recalculation on language switch
window.refreshH1Title = function () {
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => resizeCanvas());
  } else {
    resizeCanvas();
  }
};

// =============================================================================
// About section - decrease video resolution
// =============================================================================

const v = document.getElementById("bhVideo");
if (!v) throw new Error("bhVideo not found");

const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    // load only once (use getAttribute, not v.src)
    if (!v.getAttribute("src")) {
      v.setAttribute("src", "./videos/blackhole.mp4");
      v.load();
    }

    // try to play
    v.play().catch(() => {});
  } else {
    v.pause();
  }
}, { rootMargin: "800px 0px", threshold: 0.01 });

io.observe(v);

// fade in when ready
v.addEventListener("canplay", () => v.classList.add("is-ready"), { once: true });

// =============================================================================
// About section - Pause profile animation when out of view
// =============================================================================

(() => {
  const aboutSection = document.querySelector(".about");
  if (!aboutSection) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        aboutSection.classList.add("in-view");
      } else {
        aboutSection.classList.remove("in-view");
      }
    },
    {
      threshold: 0.25, // 25% visible = start animations
    }
  );

  observer.observe(aboutSection);
})();

// =============================================================================
// Skills section - 3 solar rings scale-up animation
// =============================================================================

// ===== ELEMENTS =====
const skillsSection = document.querySelector("#skills");
const rings = document.querySelectorAll("#skills .scale-up");
const clouds = document.querySelectorAll("#skills .cloud img");

// ===== STATE =====
let hasPlayed = false;
let cooldownReady = true;
let cooldownTimer = null;

// ===== RINGS: scale-up with delay in SECONDS =====
function playRingEnter() {
  rings.forEach(ring => {
    const delaySec = Number(ring.dataset.delay) || 0;

    ring.classList.remove("enter");
    ring.style.animationDelay = `${delaySec}s`;
    void ring.offsetWidth; // force reflow
    ring.classList.add("enter");

    ring.addEventListener(
      "animationend",
      () => {
        ring.style.animationDelay = "0s";
      },
      { once: true }
    );
  });
}

// ===== CLOUDS: opacity fade (no scale) =====
function playCloudEnter() {
  clouds.forEach(img => {
    img.classList.remove("cloud-enter");
    void img.offsetWidth; // force reflow
    img.classList.add("cloud-enter");
  });
}

// ===== RESET CLOUDS (so animation can replay) =====
function resetClouds() {
  clouds.forEach(img => {
    img.classList.remove("cloud-enter");
  });
}

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      if (!hasPlayed || cooldownReady) {
        playRingEnter();
        playCloudEnter();

        hasPlayed = true;
        cooldownReady = false;
      }
    } else {
      clearTimeout(cooldownTimer);
      cooldownTimer = setTimeout(() => {
        cooldownReady = true;
        resetClouds(); // allow fade-in again
      }, 5000);
    }
  },
  { threshold: 0.35 }
);

// ===== START OBSERVING =====
if (skillsSection) observer.observe(skillsSection);

// =============================================================================
// Skills section - Logo icons pop-up animation
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector("#skills");
  if (!skills) return;

  const icons = skills.querySelectorAll(".inner-icons img, .outer-icons img");

  // auto stagger: you can tweak these
  const step = 120;      // delay between icons (ms)
  const outerOffset = 300; // extra delay for outer ring start (ms)

  // assign delays without data-delay
  icons.forEach((img, i) => {
    // if you want outer ring later:
    const isOuter = img.closest(".outer-icons");
    const base = isOuter ? outerOffset : 0;

    img.style.setProperty("--delay", `${base + i * step}ms`);
  });

  const resetAnimation = (el) => {
    // remove class
    el.classList.remove("enter");

    // hard reset animation so it can replay instantly next time
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = "";
  };

  const playAnimation = () => {
    icons.forEach((img) => {
      // reset + add so it always replays
      resetAnimation(img);
      img.classList.add("enter");
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playAnimation();
        } else {
          // leaving: reset so next enter plays again immediately
          icons.forEach(resetAnimation);
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -10% 0px", // makes it trigger a bit earlier
    }
  );

  io.observe(skills);
});

// =============================================================================
// Projects section - videos
// =============================================================================

document.querySelectorAll(".video-wrapper video").forEach((video) => {
  // Make sure it's always silent (required by browsers for autoplay-ish behavior)
  video.muted = true;

  video.addEventListener("mouseenter", async () => {
    try {
      // rewind to start every time you hover (optional — remove if you want resume)
      video.currentTime = 0;

      await video.play();
    } catch (err) {
      // Some browsers block play until user interacts — hover usually counts, but just in case
      console.log("Play blocked:", err);
    }
  });

  video.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0; // reset back
  });
});

// =============================================================================
// Contact Section --- Transition
// =============================================================================


(() => {
  const contactSection = document.querySelector("#contact");
  const projectsSection = document.querySelector("#projects");
  const navbar = document.querySelector("#navbar");
  const bottomNav = document.querySelector("#bottomNav");

  if (!contactSection || !projectsSection) return;

  // MUST match your .contact transition duration (yours is 1s in CSS)
  const CONTACT_FADE_MS = 1000;

  let busy = false;
  let returnHash = "#home";

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  function isContactOpen() {
    return contactSection.classList.contains("is-open");
  }
  window.isContactOpen = isContactOpen;

  function setBottomActiveSafe(key) {
    try {
      const fn = window.setBottomNavActive;
      if (typeof fn === "function") fn(key);
    } catch (_) {}
  }

  // Are we at (or past) the bottom edge of Projects in the viewport?
  // i.e. the bottom of #projects is at/above the bottom of the screen.
  function projectsAtViewportBottom(thresholdPx = 6) {
    const r = projectsSection.getBoundingClientRect();
    // when bottom is <= viewport bottom (+threshold), you're at the end
    return r.bottom <= window.innerHeight + thresholdPx;
  }

  // Optional: ensure Projects is actually the "current" section-ish,
  // so we don’t trigger while user is far above Projects.
  function projectsIsOnScreen(minVisiblePx = 80) {
    const r = projectsSection.getBoundingClientRect();
    const visible =
      Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top);
    return visible >= minVisiblePx;
  }

  // ------------------------------------------------------------
  // Open / Close
  // ------------------------------------------------------------
  function openContact(nextReturn = "#home") {
    if (busy || isContactOpen()) return;

    returnHash = nextReturn;

    busy = true;
    contactSection.classList.add("is-open");
    history.pushState(null, "", "#contact");
    setBottomActiveSafe("contact");

    setTimeout(() => (busy = false), CONTACT_FADE_MS);
  }

  function closeContact() {
    if (busy || !isContactOpen()) return;

    busy = true;
    contactSection.classList.remove("is-open");

    setTimeout(() => {
      history.pushState(null, "", returnHash);
      setBottomActiveSafe(returnHash.replace("#", ""));
      document
        .querySelector(returnHash)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
      busy = false;
    }, CONTACT_FADE_MS);
  }

  // ------------------------------------------------------------
  // Global navigation handler: fade out contact then navigate
  // ------------------------------------------------------------
  window.contactOverlayNavigate = (href) => {
    if (!href || !href.startsWith("#")) return;

    // Contact link opens overlay (not DOM scroll)
    if (href === "#contact") {
      openContact("#home");
      return;
    }

    // If overlay not open -> normal navigation
    if (!isContactOpen()) {
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
      setBottomActiveSafe(href.replace("#", ""));
      return;
    }

    // Overlay open -> fade out then navigate
    if (busy) return;

    busy = true;
    contactSection.classList.remove("is-open");

    setTimeout(() => {
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
      setBottomActiveSafe(href.replace("#", ""));
      busy = false;
    }, CONTACT_FADE_MS);
  };

  function wireNav(container) {
    if (!container) return;
    container.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.contactOverlayNavigate(a.getAttribute("href"));
      });
    });
  }

  wireNav(navbar);
  wireNav(bottomNav);

  // CTA button (if outside navs)
  const cta = document.querySelector("#ctaContact");
  if (cta) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      openContact("#home");
    });
  }

  // ------------------------------------------------------------
  // PROJECTS -> CONTACT
  // Only when user is at the bottom edge of Projects and keeps scrolling DOWN
  // Desktop: wheel down
  // Mobile: swipe up (scroll down)
  // ------------------------------------------------------------

  // how much extra scroll (pixels-ish) needed before opening
  const OPEN_PRESSURE = 220; // tweak: 120–350
  let pressure = 0;

  function resetPressure() {
    pressure = 0;
  }

  // Desktop wheel
  window.addEventListener(
    "wheel",
    (e) => {
      if (busy || isContactOpen()) return;

      // only scrolling DOWN adds pressure
      if (e.deltaY <= 0) {
        resetPressure();
        return;
      }

      if (!projectsIsOnScreen()) {
        resetPressure();
        return;
      }

      // only when at bottom edge do we start accumulating
      if (!projectsAtViewportBottom()) {
        resetPressure();
        return;
      }

      // we are at the bottom edge and user keeps pushing down
      e.preventDefault();
      pressure += e.deltaY;

      if (pressure >= OPEN_PRESSURE) {
        resetPressure();
        openContact("#projects");
      }
    },
    { passive: false }
  );

  // Mobile swipe (touch)
  let projTouchStartY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      projTouchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (busy || isContactOpen()) return;

      const y = e.touches[0].clientY;
      const delta = projTouchStartY - y; // swipe UP => positive (scroll down)

      // ignore tiny moves
      if (delta <= 8) return;

      if (!projectsIsOnScreen()) {
        resetPressure();
        return;
      }

      if (!projectsAtViewportBottom()) {
        resetPressure();
        return;
      }

      // at bottom edge: accumulate "pressure"
      e.preventDefault();
      pressure += delta;

      if (pressure >= OPEN_PRESSURE) {
        resetPressure();
        openContact("#projects");
      }

      // update start point so long swipe accumulates smoothly
      projTouchStartY = y;
    },
    { passive: false }
  );
  // ------------------------------------------------------------
  // CONTACT -> RETURN
  // Close when user scrolls UP
  // Desktop: wheel up
  // Mobile: swipe down (scroll up)
  // ------------------------------------------------------------

  // Desktop close
  window.addEventListener(
    "wheel",
    (e) => {
      if (!isContactOpen() || busy) return;
      if (e.deltaY >= 0) return; // only UP

      e.preventDefault();
      closeContact();
    },
    { passive: false }
  );

  // Mobile close
  let contactTouchStartY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (!isContactOpen()) return;
      contactTouchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isContactOpen() || busy) return;

      const y = e.touches[0].clientY;
      const delta = contactTouchStartY - y; // swipe DOWN => negative (scroll up)
      if (delta >= -18) return;

      e.preventDefault();
      closeContact();
    },
    { passive: false }
  );

  // ESC close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isContactOpen() && !busy) {
      closeContact();
    }
  });
})();