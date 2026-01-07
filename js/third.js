// ============================================================================
//                              Third JS
// ============================================================================
// =============================================================================
//                    Contact Section --- Transition
// =============================================================================

(() => {
  const contactSection = document.querySelector("#contact");
  const projectsSection = document.querySelector("#projects");
  const navbar = document.querySelector("#navbar");

  if (!contactSection || !projectsSection) return;

  const CONTACT_FADE_MS = 1000;

  let busy = false;
  let returnHash = "#home";

  // ------------------------------------------------------------
  // Main music pause/resume
  // ------------------------------------------------------------
  let shouldResumeMainMusic = false;

  function getMainMusicController() {
    if (window.BG_MUSIC && window.BG_MUSIC.el) return window.BG_MUSIC;

    const el = document.getElementById("bgMusic");
    if (!el) return null;

    return {
      el,
      get playing() {
        return !el.paused && !el.ended;
      },
      get intendedOn() {
        return true;
      },
      async play() {
        try {
          await el.play();
        } catch (_) {}
      },
      pause() {
        el.pause();
      },
    };
  }

  function pauseMainMusicForContact() {
    const ctl = getMainMusicController();
    if (!ctl?.el) return;

    shouldResumeMainMusic = ctl.playing && ctl.intendedOn;
    ctl.pause();
  }

  function resumeMainMusicAfterContact() {
    const ctl = getMainMusicController();
    if (!ctl?.el) return;

    if (shouldResumeMainMusic && ctl.intendedOn) {
      ctl.play?.().catch?.(() => {});
    }
    shouldResumeMainMusic = false;
  }

  // ============================================================
  // Contact Music Playlist (1 -> 2 -> loop)
  // ============================================================
  const PLAYLIST = [
    "./music/contact-background-music-01.mp3",
    "./music/contact-background-music-02.mp3",
  ];

  const MUSIC = { volume: 0.7, fadeInMs: 900, fadeOutMs: 600 };

  let audioUnlocked = false;
  let isPlayingContactMusic = false;
  let currentIndex = 0;
  let currentAudio = null;

  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const a = new Audio(PLAYLIST[0]);
    a.volume = 0;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
      })
      .catch(() => {});

    window.removeEventListener("pointerdown", unlockAudioOnce);
    window.removeEventListener("keydown", unlockAudioOnce);
  }

  window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
  window.addEventListener("keydown", unlockAudioOnce, { once: true });

  function fadeVolume(audio, from, to, durationMs) {
    const start = performance.now();
    const delta = to - from;

    audio.volume = from;

    function step(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      audio.volume = from + delta * eased;
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function cleanupCurrentAudio() {
    if (!currentAudio) return;
    currentAudio.onended = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  function playNextTrack() {
    if (!isPlayingContactMusic) return;
    if (!audioUnlocked) return;

    cleanupCurrentAudio();

    const src = PLAYLIST[currentIndex];
    const a = new Audio(src);
    a.preload = "auto";
    a.volume = 0;

    a.onended = () => {
      if (!isPlayingContactMusic) return;
      currentIndex = (currentIndex + 1) % PLAYLIST.length;
      playNextTrack();
    };

    a.play().catch(() => {});
    fadeVolume(a, 0, MUSIC.volume, MUSIC.fadeInMs);

    currentAudio = a;
  }

  function playContactMusic() {
    if (!audioUnlocked) return;
    if (isPlayingContactMusic) return;

    isPlayingContactMusic = true;
    currentIndex = 0;
    playNextTrack();
  }

  function stopContactMusic() {
    isPlayingContactMusic = false;

    if (!currentAudio) return;

    const a = currentAudio;
    const v = a.volume;

    fadeVolume(a, v, 0, MUSIC.fadeOutMs);

    setTimeout(() => {
      if (currentAudio === a) cleanupCurrentAudio();
    }, MUSIC.fadeOutMs + 30);
  }

  // ------------------------------------------------------------
  // Helpers / API
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

  function projectsAtViewportBottom(thresholdPx = 6) {
    const r = projectsSection.getBoundingClientRect();
    return r.bottom <= window.innerHeight + thresholdPx;
  }

  function projectsIsOnScreen(minVisiblePx = 80) {
    const r = projectsSection.getBoundingClientRect();
    const visible = Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top);
    return visible >= minVisiblePx;
  }

  // ------------------------------------------------------------
  // Close primitives
  // ------------------------------------------------------------
  function beginCloseContact() {
    contactSection.classList.remove("is-open");
    stopContactMusic();
    resumeMainMusicAfterContact();
  }

  function closeContactToReturn() {
    if (busy || !isContactOpen()) return;

    busy = true;
    beginCloseContact();

    setTimeout(() => {
      history.pushState(null, "", returnHash);
      setBottomActiveSafe(returnHash.replace("#", ""));
      document.querySelector(returnHash)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
      busy = false;
    }, CONTACT_FADE_MS);
  }

  function closeContactAndNavigate(href) {
    if (busy || !isContactOpen()) return;

    busy = true;
    beginCloseContact();

    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      history.pushState(null, "", href);
      setBottomActiveSafe(href.replace("#", ""));
      busy = false;
    }, CONTACT_FADE_MS);
  }

  // ------------------------------------------------------------
  // Open
  // ------------------------------------------------------------
  function openContact(nextReturn = "#home") {
    if (busy || isContactOpen()) return;

    returnHash = nextReturn;
    busy = true;

    pauseMainMusicForContact();

    contactSection.classList.add("is-open");
    playContactMusic();

    history.pushState(null, "", "#contact");
    setBottomActiveSafe("contact");

    setTimeout(() => (busy = false), CONTACT_FADE_MS);
  }

  // ------------------------------------------------------------
  // Global router (nav + bottom nav uses this)
  // ------------------------------------------------------------
  window.contactOverlayNavigate = (href) => {
    if (!href || !href.startsWith("#")) return;

    if (href === "#contact") {
      openContact("#home");
      return;
    }

    if (!isContactOpen()) {
      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      history.pushState(null, "", href);
      setBottomActiveSafe(href.replace("#", ""));
      return;
    }

    if (busy) return;
    closeContactAndNavigate(href);
  };

  // OPTIONAL: wire top nav only (bottom nav is handled by BottomNav block)
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

  // CTA button
  const cta = document.querySelector("#ctaContact");
  if (cta) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      openContact("#home");
    });
  }

  // ------------------------------------------------------------
  // PROJECTS -> CONTACT (push down at bottom of Projects)
  // ------------------------------------------------------------
  const OPEN_PRESSURE = 220;
  let pressure = 0;

  function resetPressure() {
    pressure = 0;
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (busy || isContactOpen()) return;
      if (e.deltaY <= 0) {
        resetPressure();
        return;
      }

      if (!projectsIsOnScreen() || !projectsAtViewportBottom()) {
        resetPressure();
        return;
      }

      e.preventDefault();
      pressure += e.deltaY;

      if (pressure >= OPEN_PRESSURE) {
        resetPressure();
        openContact("#projects");
      }
    },
    { passive: false }
  );

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
      const delta = projTouchStartY - y;
      if (delta <= 8) return;

      if (!projectsIsOnScreen() || !projectsAtViewportBottom()) {
        resetPressure();
        return;
      }

      e.preventDefault();
      pressure += delta;

      if (pressure >= OPEN_PRESSURE) {
        resetPressure();
        openContact("#projects");
      }

      projTouchStartY = y;
    },
    { passive: false }
  );

  // ------------------------------------------------------------
  // CONTACT -> CLOSE (scroll up / swipe down / ESC)
  // UPDATED: add thresholds so tiny scrolls don’t close instantly
  // ------------------------------------------------------------

  // Desktop wheel close threshold
  const CLOSE_WHEEL_THRESHOLD = 350; // tweak: 250–600
  let closeWheelPressure = 0;

  window.addEventListener(
    "wheel",
    (e) => {
      if (!isContactOpen() || busy) return;

      // only count scroll UP
      if (e.deltaY >= 0) {
        closeWheelPressure = 0; // reset if user scrolls down
        return;
      }

      e.preventDefault();

      closeWheelPressure += Math.abs(e.deltaY);

      if (closeWheelPressure >= CLOSE_WHEEL_THRESHOLD) {
        closeWheelPressure = 0;
        closeContactToReturn();
      }
    },
    { passive: false }
  );

  // Mobile swipe-down close threshold
  const CLOSE_SWIPE_THRESHOLD = 120; // tweak: 80–160
  let contactTouchStartY = 0;
  let contactSwipeDistance = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (!isContactOpen()) return;
      contactTouchStartY = e.touches[0].clientY;
      contactSwipeDistance = 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isContactOpen() || busy) return;

      const y = e.touches[0].clientY;

      // swipe DOWN => positive distance
      const dist = y - contactTouchStartY;

      if (dist <= 0) {
        // user swiped up; ignore for close
        contactSwipeDistance = 0;
        return;
      }

      e.preventDefault();

      contactSwipeDistance = Math.max(contactSwipeDistance, dist);

      if (contactSwipeDistance >= CLOSE_SWIPE_THRESHOLD) {
        contactSwipeDistance = 0;
        closeContactToReturn();
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isContactOpen() && !busy) {
      closeContactToReturn();
    }
  });
})();

// =============================================================================
//                   Contact Section --- Mouse Follow
// =============================================================================

(() => {
  const contact = document.querySelector("#contact");
  const video = contact?.querySelector(".contact-background");
  if (!contact || !video) return;

  // ----- Controls (tweak these) -----
  const config = {
    scale: 1.1,          // how zoomed in the video is
    maxMove: 30,         // px travel from center (bigger = more pan)
    follow: 0.1,         // 0..1 (higher = follows faster / snappier)
    returnFollow: 0.08   // speed returning to center when mouse leaves
  };

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  let targetX = 0, targetY = 0;   // where we want to go
  let currentX = 0, currentY = 0; // where we are now
  let rafId = null;
  let isHovering = false;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  function animate() {
    const t = isHovering ? config.follow : config.returnFollow;

    currentX = lerp(currentX, targetX, t);
    currentY = lerp(currentY, targetY, t);

    video.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${config.scale})`;

    // Stop the loop when basically at rest (saves CPU)
    const still =
      Math.abs(currentX - targetX) < 0.05 &&
      Math.abs(currentY - targetY) < 0.05;

    if (!isHovering && still) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(animate);
  }

  function startLoop() {
    if (rafId == null) rafId = requestAnimationFrame(animate);
  }

  contact.addEventListener("mousemove", (e) => {
    // Only run when panel is open (optional but smart)
    if (!contact.classList.contains("is-open")) return;

    isHovering = true;

    const rect = contact.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;   // -1..1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;  // -1..1

    // Invert so moving mouse left pans video left (feels natural)
    targetX = clamp(nx, -1, 1) * config.maxMove;
    targetY = clamp(ny, -1, 1) * config.maxMove;

    startLoop();
  });

  contact.addEventListener("mouseleave", () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
    startLoop();
  });
})();
