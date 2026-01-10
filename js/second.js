// ============================================================================
//                              Second JS
// ============================================================================
// =============================================================================
//                               Logo
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
//                    Fixed Bottom-Navigation
// =============================================================================

(() => {
  const bottomNav = document.getElementById("bottomNav");
  if (!bottomNav) return;

  const links = Array.from(bottomNav.querySelectorAll("a"));

  // Match HTML IDs
  const mapHrefToSectionId = {
    home: "home",
    about: "about",
    skills: "skills",
    projects: "projects",
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

  // Expose for Contact overlay/router
  window.setBottomNavActive = setActiveLink;

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
  // C) Determine the real scroll container
  // Because CSS sets: body { overflow-y:auto; height:100vh; }
  // -----------------------------
  function pickScrollEl() {
    const body = document.body;
    const html = document.documentElement;

    const bodyScrollable =
      getComputedStyle(body).overflowY !== "visible" &&
      body.scrollHeight > body.clientHeight + 2;

    if (bodyScrollable) return body;

    // fallback to normal document scroll
    return document.scrollingElement || html;
  }

  const scrollEl = pickScrollEl();

  function getScrollTop() {
    return (scrollEl && typeof scrollEl.scrollTop === "number")
      ? scrollEl.scrollTop
      : (document.scrollingElement || document.documentElement).scrollTop || 0;
  }

  // -----------------------------
  // D) Active section detection (viewport scanline)
  // Works fine even when body is the scroll container
  // -----------------------------
  function updateActiveByScanline() {
    if (typeof window.isContactOpen === "function" && window.isContactOpen()) {
      setActiveLink("contact");
      return;
    }

    const scanY = window.innerHeight * 0.35;
    let current = sections[0];

    for (const s of sections) {
      const top = s.el.getBoundingClientRect().top;
      if (top <= scanY) current = s;
    }

    setActiveLink(current.navKey);
    current.el.classList.add("in-view");
  }

  // -----------------------------
  // E) Scroll settle watcher
  // -----------------------------
  let rafId = 0;
  let lastTop = null;
  let stillFrames = 0;

  function kickSettleWatcher() {
    cancelAnimationFrame(rafId);
    lastTop = null;
    stillFrames = 0;

    const loop = () => {
      const topNow = getScrollTop();

      if (lastTop === null) {
        lastTop = topNow;
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (Math.abs(topNow - lastTop) < 0.5) stillFrames += 1;
      else stillFrames = 0;

      lastTop = topNow;

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

  // Listen to the element that actually scrolls (body in CSS)
  scrollEl.addEventListener("scroll", onUserScrollLikeEvent, { passive: true });

  // Optional fallback
  window.addEventListener("scroll", onUserScrollLikeEvent, { passive: true });

  window.addEventListener("resize", updateActiveByScanline);

  // Start hidden
  bottomNav.classList.add("is-hidden");

  // Hover keep visible
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

  // Click behavior
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      showNav();
      clearTimeout(hideTimer);

      // If contact overlay router exists, let it handle #contact cleanly
      if (typeof window.contactOverlayNavigate === "function") {
        window.contactOverlayNavigate(href);
        setActiveLink(href.replace("#", ""));
        if (!isHoveringNav) scheduleHide();
        return;
      }

      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setActiveLink(href.replace("#", ""));
      if (!isHoveringNav) scheduleHide();
    });
  });

  // Initial state
  updateActiveByScanline();
})();

// =============================================================================
//                     H1's background
// =============================================================================

const h1 = document.querySelector(".video-h1");
const video = document.getElementById("h1vid");
const canvas = document.getElementById("h1canvas");
const ctx = canvas.getContext("2d");

if (!h1 || !video || !canvas) {
  // Safety: don't crash
} else {
  const ctx = canvas.getContext("2d", { alpha: true });

  // 0–1 range (like object-position percentages)
  let posX = 0.5;
  let posY = 0.9;

  // Keep a vertical padding so glyphs never clip at the top
  let textOffsetY = 0;

  let rafId = null;
  let running = false;

  function resizeCanvas() {
    const text = h1.dataset.text || "";
    const style = getComputedStyle(h1);

    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = ctx.measureText(text);

    const padX = 8;
    const padY = 8;

    const ascent =
      metrics.actualBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.9;
    const descent =
      metrics.actualBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.3;

    // Avoid 0-size canvas edge cases
    const w = Math.max(1, Math.ceil(metrics.width + padX));
    const h = Math.max(1, Math.ceil(ascent + descent + padY));

    canvas.width = w;
    canvas.height = h;

    textOffsetY = Math.ceil(ascent + 2);
  }

  function drawOnce() {
    // If video not ready enough, still draw text (so user sees something)
    const text = h1.dataset.text || "";
    const style = getComputedStyle(h1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text mask
    ctx.save();
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, textOffsetY);

    // Clip content into text
    ctx.globalCompositeOperation = "source-in";

    // If video has frame data, draw it. Otherwise fallback to a gradient fill.
    if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const cw = canvas.width;
      const ch = canvas.height;

      const scale = Math.max(cw / vw, ch / vh);
      const sw = vw * scale;
      const sh = vh * scale;

      const dx = (cw - sw) * posX;
      const dy = (ch - sh) * posY;

      ctx.drawImage(video, dx, dy, sw, sh);
    } else {
      // fallback so you never see "nothing"
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "white");
      g.addColorStop(1, "rgba(255,255,255,0.3)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  function loop() {
    drawOnce();
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running) return;
    running = true;
    loop();
  }

  function stopLoop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  async function waitForFonts() {
    // Your H1 uses web fonts; this makes measurement stable.
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
  }

  function waitForVideoFrame() {
    // Resolve as soon as we have enough data to draw a frame.
    return new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth) return resolve();

      const done = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("canplay", done);
        video.removeEventListener("playing", done);
      };

      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("playing", done, { once: true });

      // Nudge load in case browser is lazy
      video.load();
    });
  }

  // Call this BEFORE reveal (during loader)
  async function prepareH1() {
    // Make sure video is allowed to load & decode early
    video.preload = "auto";

    // Wait for fonts so canvas size is correct
    await waitForFonts();
    resizeCanvas();

    // Try to start video decoding (muted autoplay should usually work)
    video.play().catch(() => {});

    // Wait until at least one frame is available
    await waitForVideoFrame();

    // Force one draw NOW so it appears instantly after reveal
    drawOnce();

    // Start continuous loop
    startLoop();
  }

  // Auto prepare ASAP (but still safe)
  // Use DOMContentLoaded instead of window load so it starts earlier
  document.addEventListener("DOMContentLoaded", () => {
    prepareH1();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawOnce();
  });

  // Allow i18n system to force recalculation on language switch
  window.refreshH1Title = function () {
    waitForFonts().then(() => {
      resizeCanvas();
      drawOnce();
    });
  };

  // OPTIONAL: if you want to pause when tab hidden (performance)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  window.prepareH1 = prepareH1;
}

// =============================================================================
//              About section - Decrease video resolution
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

// Fade in when ready
v.addEventListener("canplay", () => v.classList.add("is-ready"), { once: true });

// =============================================================================
//          About section - Pause profile animation when out of view
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
//              Skills section - 3 solar rings scale-up animation
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

// ===== RESET CLOUDS (animation can replay) =====
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
//            Skills section - Logo icons pop-up animation
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector("#skills");
  if (!skills) return;

  const icons = skills.querySelectorAll(".inner-icons img, .outer-icons img");

  // Auto stagger
  const step = 120;         // delay between icons (ms)
  const outerOffset = 300;  // extra delay for outer ring start (ms)

  // Assign delays without data-delay
  icons.forEach((img, i) => {
    const isOuter = img.closest(".outer-icons");
    const base = isOuter ? outerOffset : 0;

    img.style.setProperty("--delay", `${base + i * step}ms`);
  });

  const resetAnimation = (el) => {
    // Remove class
    el.classList.remove("enter");

    // Hard reset animation so it can replay instantly next time
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = "";
  };

  const playAnimation = () => {
    icons.forEach((img) => {
      // Reset + add so it always replays
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
          // Leaving: reset so next enter plays again immediately
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
//                      Projects section - videos
// =============================================================================

document.querySelectorAll(".video-wrapper video").forEach((video) => {
  // Make sure it's always silent (required by browsers for autoplay-ish behavior)
  video.muted = true;

  video.addEventListener("mouseenter", async () => {
    try {
      // Rewind to start every time hover (optional — remove if want to resume)
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
