// ============================================================================
//                              Main JS
// ============================================================================

window.addEventListener("load", () => {
  // Background video (hero)
  const bg = document.querySelector("video.background");
  if (bg && !bg.src) {
    bg.src = "videos/main-background-loop.mp4";
    bg.play().catch(() => {});
  }

  // Button video (inside #ctaContact)
  const btnVid = document.querySelector("#ctaContact video");
  if (btnVid && !btnVid.src) {
    btnVid.src = "videos/button.mp4";
    btnVid.play().catch(() => {});
  }

  // Contact background video (load only when near viewport)
  const contact = document.querySelector("#contact");
  const contactVid = document.querySelector("video.contact-background");
  if (contact && contactVid) {
    const ioContact = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!contactVid.getAttribute("src")) {
            contactVid.setAttribute("src", "videos/contact-background.mp4");
          }
          contactVid.play().catch(() => {});
        } else {
          contactVid.pause();
        }
      },
      { rootMargin: "300px 0px", threshold: 0.01 }
    );

    ioContact.observe(contact);
  }

  const about = document.querySelector("#about");
  const bh = document.getElementById("bhVideo");

  if (about && bh) {
    const ioBH = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!bh.src) bh.src = "videos/blackhole.mp4";
          bh.play().catch(() => {});
        } else {
          bh.pause();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 }
    );

    ioBH.observe(about);
  }
});

// ============================================================================
//                       Background music & Loaders
// ============================================================================

(() => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const ringWrap = loader.querySelector(".ring-wrap");
  const pctEl = document.getElementById("pct");
  if (!ringWrap || !pctEl) return;

  const bgMusic = document.getElementById("bgMusic");
  const musicIcon = document.getElementById("musicIcon");

  // 🎵 main tracks
  const mainTracks = [
    "./music/main-background-music-01.mp3",
    "./music/main-background-music-02.mp3",
  ];

  // 🎵 last track
  const lastTrack = "./music/contact-background-music-02.mp3";

  let queue = [];
  let isPlaying = false;

  function loadTrack(src) {
    if (!bgMusic) return;
    bgMusic.src = src;
    bgMusic.load();
  }

  // Build one full cycle:
  // Random (01 or 02) -> the other one -> contact track
  function buildCycleQueue() {
    const first = Math.random() < 0.5 ? 0 : 1; // 50/50
    const second = 1 - first;

    queue = [
      mainTracks[first],
      mainTracks[second],
      lastTrack,
    ];
  }

  // Play next track when current ends
  if (bgMusic) {
    bgMusic.addEventListener("ended", async () => {
      if (queue.length === 0) buildCycleQueue();

      const nextSrc = queue.shift();
      loadTrack(nextSrc);

      try {
        await bgMusic.play();
        isPlaying = true;
        if (musicIcon) musicIcon.src = "./icons/Musical.svg";
      } catch (e) {
        console.warn("Playback failed:", e);
      }
    });
  }

  // Start music on user gesture (enter)
  async function startBackgroundMusicFromUserGesture() {
    if (!bgMusic) return;

    try {
      bgMusic.volume = 0.7;

      // Start a fresh cycle
      buildCycleQueue();

      // Play first track from the queue
      const firstSrc = queue.shift();
      loadTrack(firstSrc);

      await bgMusic.play();
      isPlaying = true;
      if (musicIcon) musicIcon.src = "./icons/Musical.svg";
    } catch (e) {
      console.warn("Playback failed:", e);
      // If blocked, keep icon in "No Music" state
      isPlaying = false;
      if (musicIcon) musicIcon.src = "./icons/No Music.svg";
    }
  }

  // Toggle play / pause
  if (musicIcon && bgMusic) {
    musicIcon.addEventListener("click", async (e) => {
      // Prevent this click from also triggering "enter" if loader is still up
      e.stopPropagation();

      if (isPlaying) {
        bgMusic.pause();
        musicIcon.src = "./icons/No Music.svg";
        isPlaying = false;
      } else {
        try {
          await bgMusic.play();
          musicIcon.src = "./icons/Musical.svg";
          isPlaying = true;
        } catch (err) {
          console.warn("Playback failed:", err);
        }
      }
    });
  }

  // ----------------------------
  // 1) DEFINE CRITICAL ASSETS
  // ----------------------------
  const ASSETS = [
    // Loader assets
    { type: "image", url: "images/home-section/dim-loading-screen.webp" },
    { type: "image", url: "images/home-section/loading-screen.webp" },
    { type: "image", url: "images/home-section/start-loading-text.webp" },

    // Home / hero assets
    // { type: "image", url: "icons/moon-logo.png" },
    // { type: "image", url: "icons/moon-logo-color-state.png" },
    // { type: "image", url: "images/home-section/profile.png" },
    // { type: "image", url: "images/home-section/nav-decorator.png" },
    // { type: "image", url: "images/home-section/stars1.png" },
    // { type: "image", url: "images/home-section/stars2.png" },
    // { type: "image", url: "images/home-section/moon-glow.png" },
    // { type: "image", url: "images/home-section/fog.png" },
    { type: "image", url: "images/home-section/black-cloud.webp" },
    // { type: "image", url: "../images/id-card-profile.png" },
    // { type: "image", url: "../images/inner-ring.png" },
    // { type: "image", url: "../images/outer-ring.png" },
    // { type: "image", url: "../images/solar-ring.png" },
    // { type: "image", url: "../images/upper-cloud-1.png" },
    // { type: "image", url: "../images/upper-cloud-2.png" },
    // { type: "image", url: "../images/upper-cloud-3.png" },
    // { type: "image", url: "../images/upper-cloud-4.png" },

    // { type: "video", url: "../videos/blackhole.mp4" },
    // { type: "video", url: "../videos/fancy-login-page-first-project.mp4" },
    // { type: "video", url: "../videos/Laundry-weather-forcast-project.mp4" },
    // { type: "video", url: "../videos/Julvry-project.mp4" },
  ];

  // ----------------------------
  // 2) FONT DEFINITIONS
  // ----------------------------
  const FONTS = [
    "400 1em Orbitron",
    "700 1em Orbitron",
    "400 1em Inter",
    "600 1em Inter"
  ];

  // ----------------------------
  // 3) HELPERS: smooth progress UI
  // ----------------------------
  let displayed = 0;
  let target = 0;
  let rafId = null;

  function setProgress(p) {
    target = Math.max(0, Math.min(100, p));
    if (!rafId) animateProgress();
  }

  function animateProgress() {
    displayed += (target - displayed) * 0.12;
    if (Math.abs(target - displayed) < 0.2) displayed = target;

    ringWrap.style.setProperty("--p", displayed.toFixed(2));
    pctEl.textContent = `${Math.round(displayed)}%`;

    if (displayed !== target) rafId = requestAnimationFrame(animateProgress);
    else rafId = null;
  }

  // ----------------------------
  // 4) LOADERS
  // ----------------------------
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        if (img.decode) {
          try {
            await img.decode();         
          } catch {}
        }
        resolve();
      };
      img.onerror = () => reject(new Error("Image failed: " + url));
      img.src = url;
    });
  }

  // function loadVideo(url) {
  //   return new Promise((resolve, reject) => {
  //     const v = document.createElement("video");
  //     v.preload = "auto";
  //     v.muted = true;
  //     v.playsInline = true;
  //     v.oncanplaythrough = () => resolve();
  //     v.onerror = () => reject(new Error("Video failed: " + url));
  //     v.src = url;
  //     v.load();
  //   });
  // }

  function loadFonts() {
    if (!document.fonts) return Promise.resolve();
    FONTS.forEach((font) => {
      try {
        document.fonts.load(font);
      } catch {}
    });
    return document.fonts.ready;
  }

  // ----------------------------
  // 5) MAIN LOADING FLOW
  // ----------------------------
  async function startLoading() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    loadFonts()
    const tasks = [];
    for (const a of ASSETS) {
      if (a.type === "image") tasks.push(loadImage(a.url));
      // if (a.type === "video") tasks.push(loadVideo(a.url));
    }

    const total = tasks.length || 1;
    let done = 0;

    setProgress(0);

    const wrapped = tasks.map(p =>
      p.then(() => {
        done++;
        setProgress((done / total) * 100);
      }).catch(err => {
        console.warn(err);
        done++;
        setProgress((done / total) * 100);
      })
    );

    const TIMEOUT_MS = 15000;
    const timeout = new Promise(r => setTimeout(r, TIMEOUT_MS));

    await Promise.race([Promise.allSettled(wrapped), timeout]);

    setProgress(100);
    await new Promise(r => setTimeout(r, 350));

    loader.classList.add("ready");

    // Click anywhere to enter
    const enter = async () => {
      // Start music FIRST
      await startBackgroundMusicFromUserGesture();

      // Preload blackhole video
      // const bh = document.getElementById("bhVideo");
      // if (bh) {
      //   try {
      //     bh.muted = true;
      //     bh.playsInline = true;

      //     await bh.play();   // force decode + GPU upload
      //     bh.pause();
      //     bh.currentTime = 0;
      //   } catch (e) {
      //   // Safari / power-save may block — safe to ignore
      //   }
      // }

      // Phase 1: start reveal (ring fades + bg fades + clouds start moving)
      loader.classList.add("reveal");

      // Phase 2: let clouds keep moving while page is already visible
      setTimeout(() => {
        loader.classList.add("cloud-out"); // clouds fade out later
      }, 600);

      // Phase 3: remove loader after clouds are gone
      setTimeout(() => {
        loader.style.display = "none";
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }, 2400);
    };

    window.addEventListener("pointerdown", enter, { once: true });
  }

  startLoading();
})();

// =============================================================================
//                        Icons flip animation
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
//                          Languages Display
// ============================================================================

const langIcon = document.getElementById("langIcon");
const langContainer = document.querySelector(".lang-container");
const langItems = document.querySelectorAll(".languages .lang");

// --- Config ---
const SUPPORTED = ["en", "ja"]; // add "km" later
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
  // Keeps CSS animation but makes the pseudo-element text translate
  // CSS should use: .section-title::after { content: attr(data-shadow); }
  document.querySelectorAll(".section-title").forEach((titleEl) => {
    const textEl = titleEl.querySelector("[data-i18n]");
    if (textEl) {
      titleEl.setAttribute("data-shadow", textEl.textContent.trim());
    }
  });
}

function applyDict(lang) {
  // Text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = dict[key];
    if (val != null) el.textContent = val;
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = dict[key];
    if (val != null) el.setAttribute("placeholder", val);
  });

  // Titles (optional)
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

  // Highlight immediately
  setActiveLangUI(initial);

  // Sync section title shadows immediately from fallback HTML
  syncSectionTitleShadows();

  // Then try to load translations
  await setLang(initial);
})();

// =============================================================================
//                            PDF Display
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

    // Ensure image is loaded
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
