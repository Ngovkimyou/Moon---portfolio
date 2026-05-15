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
  let h1AutoplayTimer = null;
  let h1PlayPromise = null;

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

  function waitForVideoFrame(timeoutMs = 3000) {
    // Resolve as soon as we have enough data to draw a frame.
    return new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth) return resolve();

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const fail = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("canplay", done);
        video.removeEventListener("playing", done);
        video.removeEventListener("error", fail);
      };

      const timer = setTimeout(done, timeoutMs);
      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("playing", done, { once: true });
      video.addEventListener("error", fail, { once: true });

      // Nudge load in case browser is lazy
      video.load();
    });
  }

  function shouldLoadHeavyHeroVideo() {
    return true;
  }

  function configureH1Video() {
    if (!video.getAttribute("src")) {
      video.src = video.dataset.src || "videos/h1-optimized.mp4";
    }

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    if (video.readyState === 0) video.load();
  }

  function requestH1Playback() {
    if (!shouldLoadHeavyHeroVideo()) return Promise.resolve();
    configureH1Video();

    if (!video.paused && !video.ended) return Promise.resolve();
    if (h1PlayPromise) return h1PlayPromise;

    h1PlayPromise = video.play()
      .catch(() => {})
      .finally(() => {
        h1PlayPromise = null;
      });

    return h1PlayPromise;
  }

  async function drawH1Fallback() {
    await waitForFonts();
    resizeCanvas();
    drawOnce();
    startLoop();
  }

  async function prepareH1() {
    // Wait for fonts so canvas size is correct
    await waitForFonts();
    resizeCanvas();

    if (!shouldLoadHeavyHeroVideo()) {
      drawOnce();
      startLoop();
      return;
    }

    configureH1Video();
    requestH1Playback();

    // Wait until at least one frame is available
    await waitForVideoFrame();

    // Force one draw NOW so it appears instantly after reveal
    drawOnce();

    // Start continuous loop
    startLoop();
  }

  function resumeH1Video() {
    if (!shouldLoadHeavyHeroVideo()) {
      startLoop();
      return Promise.resolve();
    }

    const playPromise = requestH1Playback();

    resizeCanvas();
    drawOnce();
    startLoop();

    return Promise.resolve(playPromise)
      .then(waitForVideoFrame)
      .then(() => {
        drawOnce();
        startLoop();
      });
  }

  function startH1Autoplay() {
    if (!shouldLoadHeavyHeroVideo()) return;

    requestH1Playback();
    startLoop();

    if (h1AutoplayTimer) return;

    h1AutoplayTimer = window.setInterval(() => {
      if (document.hidden) return;
      if (video.paused || video.ended || video.readyState < 2) {
        requestH1Playback();
      }
      startLoop();
    }, 1200);
  }

  // Auto prepare ASAP (but still safe)
  // Draw fallback text early; the heavy video is attached after critical loading.
  document.addEventListener("DOMContentLoaded", () => {
    drawH1Fallback()
      .then(startH1Autoplay)
      .catch(() => {});
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
    else resumeH1Video();
  });

  window.prepareH1 = prepareH1;
  window.resumeH1Video = resumeH1Video;
  window.startH1Autoplay = startH1Autoplay;
}

// =============================================================================
//              About section - Decrease video resolution
// =============================================================================

const v = document.getElementById("bhVideo");
if (!v) throw new Error("bhVideo not found");

const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const saveData = navigator.connection?.saveData;

    if (reduceMotion || saveData) {
      io.disconnect();
      return;
    }

    // load only once (use getAttribute, not v.src)
    if (!v.getAttribute("src")) {
      v.setAttribute("src", v.dataset.src || "./videos/blackhole.mp4");
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
const skillVisualAssets = document.querySelectorAll("#skills .solar-container img");
const innerStarOrbit = document.querySelector("#skills .inner-star-orbit");
const outerStarOrbit = document.querySelector("#skills .outer-star-orbit");
const SKILLS_SCREEN_COVERAGE = 0.6;
const SKILLS_OBSERVER_STEPS = Array.from({ length: 101 }, (_, i) => i / 100);

// ===== STATE =====
let skillsAnimationRun = 0;
let skillsAssetsActive = false;
let skillAssetsFadeTimer = null;

function skillsCoversScreen(entry) {
  const viewportHeight = entry.rootBounds?.height || window.innerHeight || document.documentElement.clientHeight;
  return entry.isIntersecting && entry.intersectionRect.height >= viewportHeight * SKILLS_SCREEN_COVERAGE;
}

// ===== RINGS: scale-up with delay in SECONDS =====
function playRingEnter() {
  clearTimeout(skillAssetsFadeTimer);
  if (innerStarOrbit) {
    innerStarOrbit.classList.remove("enter");
    void innerStarOrbit.offsetWidth;
    innerStarOrbit.classList.add("enter");
  }
  if (outerStarOrbit) {
    outerStarOrbit.classList.remove("enter");
    void outerStarOrbit.offsetWidth;
    outerStarOrbit.classList.add("enter");
  }

  rings.forEach(ring => {
    const delaySec = Number(ring.dataset.delay) || 0;

    ring.classList.remove("enter");
    ring.classList.remove("fade-out");
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

// ===== RESET RINGS (hide until Skills reaches threshold again) =====
function resetRings() {
  if (innerStarOrbit) {
    innerStarOrbit.classList.remove("enter");
  }
  if (outerStarOrbit) {
    outerStarOrbit.classList.remove("enter");
  }

  rings.forEach(ring => {
    ring.classList.remove("enter", "fade-out");
    ring.style.animationDelay = "0s";
  });
}

// ===== CLOUDS: opacity fade (no scale) =====
function playCloudEnter() {
  clouds.forEach(img => {
    img.classList.remove("cloud-enter");
    img.classList.remove("fade-out");
    void img.offsetWidth; // force reflow
    img.classList.add("cloud-enter");
  });
}

// ===== RESET CLOUDS (animation can replay) =====
function resetClouds() {
  clouds.forEach(img => {
    img.classList.remove("cloud-enter", "fade-out");
  });
}

function resetSkillAssets() {
  resetRings();
  resetClouds();
  skillVisualAssets.forEach(asset => {
    asset.classList.remove("fade-out");
    asset.style.removeProperty("--fade-opacity");
  });
}

function fadeOutSkillAssets() {
  clearTimeout(skillAssetsFadeTimer);
  skillVisualAssets.forEach(asset => {
    asset.style.setProperty("--fade-opacity", getComputedStyle(asset).opacity);
    asset.classList.add("fade-out");
  });

  skillAssetsFadeTimer = setTimeout(resetSkillAssets, 450);
}

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver(
  ([entry]) => {
    const canPlay = skillsCoversScreen(entry);

    if (!entry.isIntersecting) {
      skillsAssetsActive = false;
      skillsAnimationRun += 1;
      fadeOutSkillAssets();
      return;
    }

    if (!canPlay || skillsAssetsActive) return;

    skillsAssetsActive = true;
    skillsAnimationRun += 1;
    const runId = skillsAnimationRun;

    const ready = typeof window.preloadSectionAssets === "function"
      ? window.preloadSectionAssets(skillsSection)
      : Promise.resolve();

    Promise.race([
      ready,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).then(() => {
      if (runId !== skillsAnimationRun) return;
      playRingEnter();
      playCloudEnter();
    });
  },
  { threshold: SKILLS_OBSERVER_STEPS }
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
  let iconAnimationRun = 0;
  let iconsActive = false;
  let iconsFadeTimer = null;

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
    el.classList.remove("enter", "fade-out");
    el.style.removeProperty("--fade-opacity");

    // Hard reset animation so it can replay instantly next time
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = "";
  };

  const playAnimation = () => {
    clearTimeout(iconsFadeTimer);
    icons.forEach((img) => {
      // Reset + add so it always replays
      resetAnimation(img);
      img.classList.add("enter");
    });
  };

  const fadeOutIcons = () => {
    clearTimeout(iconsFadeTimer);
    icons.forEach((img) => {
      img.style.setProperty("--fade-opacity", getComputedStyle(img).opacity);
      img.classList.add("fade-out");
    });
    iconsFadeTimer = setTimeout(() => {
      icons.forEach(resetAnimation);
    }, 450);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const canPlay = skillsCoversScreen(entry);

        if (!entry.isIntersecting) {
          iconsActive = false;
          iconAnimationRun += 1;
          fadeOutIcons();
          return;
        }

        if (!canPlay || iconsActive) return;

        iconsActive = true;
        iconAnimationRun += 1;
        const runId = iconAnimationRun;

        const ready = typeof window.preloadSectionAssets === "function"
          ? window.preloadSectionAssets(skills)
          : Promise.resolve();

        Promise.race([
          ready,
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]).then(() => {
          if (runId !== iconAnimationRun) return;
          playAnimation();
        });
      });
    },
    {
      threshold: SKILLS_OBSERVER_STEPS,
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
  const wrapper = video.closest(".video-wrapper");
  const hoverTarget = wrapper || video;
  let framePrimed = wrapper?.classList.contains("is-video-ready") || video.readyState >= 2;

  function markVideoReady() {
    wrapper?.classList.add("is-video-ready");
  }

  function canLoadPreview() {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const saveData = navigator.connection?.saveData;
    return !reduceMotion && !saveData;
  }

  function waitForVideoReady(eventName, timeoutMs = 1600) {
    return new Promise((resolve) => {
      if (eventName === "loadeddata" && video.readyState >= 2) {
        resolve();
        return;
      }

      const done = () => {
        clearTimeout(timer);
        video.removeEventListener(eventName, done);
        video.removeEventListener("error", done);
        resolve();
      };

      const timer = setTimeout(done, timeoutMs);
      video.addEventListener(eventName, done, { once: true });
      video.addEventListener("error", done, { once: true });
    });
  }

  async function ensureVideoLoaded({ primeFrame = false } = {}) {
    if (!canLoadPreview()) return;
    const src = video.dataset.src;
    if (!src && !video.getAttribute("src")) return;

    const hadSrc = Boolean(video.getAttribute("src"));
    if (!hadSrc) video.setAttribute("src", src);

    const desiredPreload = primeFrame ? "auto" : "metadata";
    if (video.preload !== desiredPreload) video.preload = desiredPreload;

    if (!hadSrc || video.readyState === 0 || (primeFrame && video.readyState < 2)) {
      video.load();
    }

    if (!primeFrame || framePrimed) return;
    framePrimed = true;

    await waitForVideoReady("loadeddata");
    markVideoReady();

    try {
      await video.play();
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, 80);
    } catch (_) {}
  }

  video.addEventListener("loadeddata", markVideoReady);
  video.addEventListener("canplay", markVideoReady);

  hoverTarget.addEventListener("mouseenter", async () => {
    try {
      // Rewind to start every time hover (optional — remove if want to resume)
      await ensureVideoLoaded({ primeFrame: true });
      video.currentTime = 0;

      await video.play();
    } catch (err) {
      // Some browsers block play until user interacts — hover usually counts, but just in case
      console.log("Play blocked:", err);
    }
  });

  hoverTarget.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0; // reset back
  });

  hoverTarget.addEventListener("touchstart", () => {
    ensureVideoLoaded({ primeFrame: true });
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        ensureVideoLoaded({ primeFrame: true });
        io.disconnect();
      },
      { rootMargin: "1400px 0px", threshold: 0.01 }
    );

    io.observe(hoverTarget);
  } else {
    ensureVideoLoaded({ primeFrame: true });
  }
});
