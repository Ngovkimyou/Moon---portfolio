// ============================================================================
//                              Main JS
// ============================================================================
// ============================================================================
//                Preload All Videos, Fonts, Skills Imgages
// ============================================================================

window.addEventListener("load", () => {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const saveData = navigator.connection?.saveData;
  const isSmallScreen = window.matchMedia?.("(max-width: 768px)")?.matches;

  document.querySelectorAll("video").forEach((video) => {
    video.controls = false;
    video.removeAttribute("controls");
    video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  // Background video (hero)
  const bg = document.querySelector("video.background");
  if (bg) {
    if (!bg.getAttribute("src")) bg.src = "videos/main-background-loop.mp4";
    bg.preload = "auto";
    bg.muted = true;
    bg.defaultMuted = true;
    bg.autoplay = true;
    bg.loop = true;
    bg.playsInline = true;
    bg.play().catch(() => {});
  }

  // Button video
  const btnVid = document.querySelector("#ctaContact video");
  if (btnVid && !reduceMotion && !saveData && !isSmallScreen) {
    if (!btnVid.getAttribute("src")) btnVid.src = "videos/button.mp4";
    btnVid.play().catch(() => {});
  }

  // Contact background video 
  const contact = document.querySelector("#contact");
  const contactVid = document.querySelector("video.contact-background");
  if (contact && contactVid) {
    const ioContact = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!contactVid.getAttribute("src") && !reduceMotion && !saveData && !isSmallScreen) {
            contactVid.setAttribute("src", "videos/contact-background.mp4");
          }
          if (contactVid.getAttribute("src")) contactVid.play().catch(() => {});
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
          if (!bh.getAttribute("src") && !reduceMotion && !saveData) {
            bh.src = bh.dataset.src || "videos/blackhole.mp4";
          }
          if (bh.getAttribute("src")) bh.play().catch(() => {});
        } else {
          bh.pause();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 }
    );

    ioBH.observe(about);
  }
});

// --------------- Skills Images --------------------
(() => {
  const skills = document.querySelector("#skills");
  if (!skills) return;

  const urls = [
    "images/skills/inner-ring.webp",
    "images/skills/outer-ring.webp",
    "images/skills/solar-ring.webp",
    "images/home-section/stars1.webp",
    "images/home-section/stars2.webp",
    "images/skills/upper-cloud-1.webp",
    "images/skills/upper-cloud-2.webp",
    "images/skills/upper-cloud-3.webp",
    "images/skills/upper-cloud-4.webp",
  ];

  let done = false;

  function preloadAll() {
    if (done) return;
    done = true;

    urls.forEach((url) => {
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.src = url;

      // Decode so it’s ready to paint instantly
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }
  // Fallback if IntersectionObserver not supported
  if (!("IntersectionObserver" in window)) {
    preloadAll();
    return;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || done) return;
      preloadAll();
      io.disconnect();
    },
    { rootMargin: "1200px 0px", threshold: 0.01 } 
  );

  io.observe(skills);
})();

// --------------- Section asset warmup --------------------
(() => {
  const saveData = navigator.connection?.saveData;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const isSmallScreen = window.matchMedia?.("(max-width: 768px)")?.matches;
  const warmed = new WeakMap();

  function waitForLoad(el, eventName, timeoutMs = 1800) {
    return new Promise((resolve) => {
      if (el.complete && el.naturalWidth) {
        resolve();
        return;
      }

      const done = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        clearTimeout(timer);
        el.removeEventListener(eventName, done);
        el.removeEventListener("error", done);
      };

      const timer = setTimeout(done, timeoutMs);
      el.addEventListener(eventName, done, { once: true });
      el.addEventListener("error", done, { once: true });
    });
  }

  function warmImage(img) {
    img.loading = "eager";
    img.decoding = "async";

    const done = waitForLoad(img, "load");
    if (img.decode) return done.then(() => img.decode().catch(() => {}));
    return done;
  }

  function warmVideo(video) {
    if (saveData || reduceMotion) return Promise.resolve();

    const inProjects = Boolean(video.closest("#projects"));
    const readyState = inProjects ? 2 : 1;
    const src = video.dataset.src;
    if (src && !video.getAttribute("src")) {
      video.src = src;
    }

    video.preload = inProjects && !isSmallScreen ? "auto" : "metadata";
    video.load();
    if (video.readyState >= readyState) {
      video.closest(".video-wrapper")?.classList.add("is-video-ready");
      return Promise.resolve();
    }

    return waitForLoad(video, inProjects ? "loadeddata" : "loadedmetadata", isSmallScreen ? 800 : 1400)
      .then(() => {
        if (inProjects && video.readyState >= 2) {
          video.closest(".video-wrapper")?.classList.add("is-video-ready");
        }
      });
  }

  window.preloadSectionAssets = function preloadSectionAssets(section) {
    if (!section) return Promise.resolve();
    if (warmed.has(section)) return warmed.get(section);

    section.classList.add("assets-warming");

    const tasks = [
      ...Array.from(section.querySelectorAll("img")).map(warmImage),
      ...Array.from(section.querySelectorAll("video")).map(warmVideo),
    ];

    const promise = Promise.allSettled(tasks).then(() => {
      section.classList.add("assets-ready");
      section.classList.remove("assets-warming");
    });

    warmed.set(section, promise);
    return promise;
  };

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("#skills, #projects").forEach(window.preloadSectionAssets);
    return;
  }

  const rootMargin = isSmallScreen ? "900px 0px" : "1800px 0px";
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        window.preloadSectionAssets(entry.target);
        io.unobserve(entry.target);
      });
    },
    { rootMargin, threshold: 0.01 }
  );

  document.querySelectorAll("#skills, #projects").forEach((section) => io.observe(section));
})();

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
  let canEnter = false;
  let entered = false;
  const shouldBlockForSectionPreviews =
    !navigator.connection?.saveData &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches &&
    !window.matchMedia?.("(max-width: 768px)")?.matches;
  const sectionsToBlockFor = ["skills"];
  const sectionsToWarmAfterReady = ["projects"];

  // 🎵 main tracks
  const mainTracks = [
    "./music/main-background-music-01.mp3",
    "./music/main-background-music-02.mp3",
  ];

  const contactTracks = [
    "./music/contact-background-music-01.mp3",
    "./music/contact-background-music-02.mp3",
  ];
  window.CONTACT_MUSIC_PRELOADS = contactTracks;

  // 🎵 last track
  const lastTrack = () => contactTracks[1];
  let initialMainTrackIndex = Math.random() < 0.5 ? 0 : 1;
  let useInitialMainTrack = true;
  let backgroundWarmupStarted = false;

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
    const first = useInitialMainTrack
      ? initialMainTrackIndex
      : (Math.random() < 0.5 ? 0 : 1);
    const second = 1 - first;
    useInitialMainTrack = false;

    queue = [
      mainTracks[first],
      mainTracks[second],
      lastTrack(),
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
  const LOADER_ASSETS = [
    "images/home-section/dim-loading-screen.png",
    "images/home-section/loading-screen.png",
    "images/home-section/start-loading-text.png",
    "images/home-section/moon-globe.png",
  ];

  const ASSETS = [

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
    { face: "400 1em 'New Rocker'", sample: "Contact Me" },
    { face: "400 1em 'Syncopate'", sample: "PROJECTS" },
    { face: "700 1em 'Syncopate'", sample: "KIMYOO" },
    { face: "400 1em 'Yuji Syuku'", sample: "日本語" },
    { face: "400 1em 'Futehodo'", sample: "プロジェクト" },
    { face: "400 1em 'written'", sample: "よろしくお願いします" }
  ];

  // ----------------------------
  // 3) HELPERS: smooth progress UI
  // ----------------------------
  let displayed = 0;
  let target = 0;
  let rafId = null;
  let criticalAssetsReady = false;
  let heroAutoplayTimer = null;
  const HERO_BACKGROUND_SRC = "videos/main-background-loop.mp4";

  function markReady() {
    if (!criticalAssetsReady) return;
    if (canEnter) return;
    canEnter = true;
    loader.classList.add("ready");
    ringWrap.setAttribute("aria-label", "Start");
  }

  function setProgress(p) {
    const capped = !criticalAssetsReady && p >= 100 ? 99 : p;
    target = Math.max(0, Math.min(100, capped));
    if (!rafId) animateProgress();
  }

  function animateProgress() {
    displayed += (target - displayed) * 0.12;
    if (Math.abs(target - displayed) < 0.2) displayed = target;

    ringWrap.style.setProperty("--p", displayed.toFixed(2));
    pctEl.textContent = `${Math.round(displayed)}%`;

    if (target >= 100 && displayed >= 99.5 && criticalAssetsReady) {
      markReady();
    }

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

  function shouldLoadHeroVideo() {
    return true;
  }

  function configureVideoForFirstPaint(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
  }

  function waitForVideoFrame(video, timeoutMs = 6000) {
    return new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth) {
        resolve();
        return;
      }

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
        if (videoFrameId && video.cancelVideoFrameCallback) {
          video.cancelVideoFrameCallback(videoFrameId);
        }
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("canplay", done);
        video.removeEventListener("playing", done);
        video.removeEventListener("timeupdate", done);
        video.removeEventListener("error", fail);
      };

      let videoFrameId = null;
      const timer = setTimeout(done, timeoutMs);
      if (video.requestVideoFrameCallback) {
        videoFrameId = video.requestVideoFrameCallback(done);
      }
      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("playing", done, { once: true });
      video.addEventListener("timeupdate", done, { once: true });
      video.addEventListener("error", fail, { once: true });
    });
  }

  async function prepareHeroBackgroundVideo() {
    const bg = document.querySelector("video.background");
    if (!bg || !shouldLoadHeroVideo()) return;

    configureVideoForFirstPaint(bg);
    if (!bg.getAttribute("src")) {
      bg.src = HERO_BACKGROUND_SRC;
    }
    bg.load();
    await bg.play().catch(() => {});

    await waitForVideoFrame(bg);
  }

  async function playHeroBackgroundVideo() {
    const bg = document.querySelector("video.background");
    if (!bg || !shouldLoadHeroVideo()) return;

    configureVideoForFirstPaint(bg);
    if (!bg.getAttribute("src")) {
      bg.src = HERO_BACKGROUND_SRC;
    }

    if (bg.readyState === 0) bg.load();
    if (bg.paused || bg.ended) {
      await bg.play().catch(() => {});
    }

    await waitForVideoFrame(bg, 6500);
  }

  async function playHeroVisualsFromGesture() {
    const backgroundReady = playHeroBackgroundVideo();
    let h1Ready = Promise.resolve();

    if (typeof window.resumeH1Video === "function") {
      h1Ready = window.resumeH1Video();
    } else if (typeof window.prepareH1 === "function") {
      h1Ready = window.prepareH1().catch((err) => {
        console.warn("H1 playback failed:", err);
      });
    }

    await Promise.race([
      Promise.allSettled([backgroundReady, h1Ready]),
      new Promise((resolve) => setTimeout(resolve, 6800)),
    ]);
  }

  function startHeroAutoplayWatch() {
    if (!shouldLoadHeroVideo()) return;

    playHeroBackgroundVideo();

    if (typeof window.startH1Autoplay === "function") {
      window.startH1Autoplay();
    } else if (typeof window.resumeH1Video === "function") {
      window.resumeH1Video();
    }

    if (heroAutoplayTimer) return;

    heroAutoplayTimer = window.setInterval(() => {
      const bg = document.querySelector("video.background");
      if (bg && (bg.paused || bg.ended || bg.readyState < 2)) {
        playHeroBackgroundVideo();
      }

      if (typeof window.startH1Autoplay === "function") {
        window.startH1Autoplay();
      } else if (typeof window.resumeH1Video === "function") {
        window.resumeH1Video();
      }
    }, 1200);
  }

  function waitForH1Preparer(timeoutMs = 1200) {
    return new Promise((resolve) => {
      if (typeof window.prepareH1 === "function") {
        resolve(window.prepareH1);
        return;
      }

      const started = performance.now();
      const check = () => {
        if (typeof window.prepareH1 === "function") {
          resolve(window.prepareH1);
          return;
        }

        if (performance.now() - started >= timeoutMs) {
          resolve(null);
          return;
        }

        requestAnimationFrame(check);
      };

      requestAnimationFrame(check);
    });
  }

  async function prepareCriticalHeroVisuals() {
    const prepareH1 = await waitForH1Preparer();
    const h1Ready = prepareH1 ? prepareH1() : Promise.resolve();

    await Promise.allSettled([
      prepareHeroBackgroundVideo(),
      h1Ready,
    ]);

    // Give the background video and H1 canvas one paint before the loader can open.
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  function loadFonts() {
    if (!document.fonts) return Promise.resolve();
    FONTS.forEach(({ face, sample }) => {
      try {
        document.fonts.load(face, sample);
      } catch {}
    });
    return document.fonts.ready;
  }

  function preloadAudio(url, timeoutMs = 4000) {
    return new Promise((resolve) => {
      const audio = new Audio();

      const done = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        clearTimeout(timer);
        audio.removeEventListener("canplaythrough", done);
        audio.removeEventListener("canplay", done);
        audio.removeEventListener("loadeddata", done);
        audio.removeEventListener("error", done);
      };

      const timer = setTimeout(done, timeoutMs);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", done, { once: true });
      audio.addEventListener("canplay", done, { once: true });
      audio.addEventListener("loadeddata", done, { once: true });
      audio.addEventListener("error", done, { once: true });
      audio.src = url;
      audio.load();
    });
  }

  async function preloadAudioBlob(url, onReady) {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Audio failed: ${url}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    onReady(blobUrl);
  }

  function warmRemainingAssetsInBackground() {
    if (backgroundWarmupStarted || navigator.connection?.saveData) return;
    backgroundWarmupStarted = true;

    const warmAudio = (tracks, skipIndex = -1) => {
      tracks.forEach((track, index) => {
        if (index === skipIndex || track.startsWith("blob:")) return;

        preloadAudioBlob(track, (blobUrl) => {
          tracks[index] = blobUrl;
        }).catch((err) => console.warn("Background audio warmup failed:", err));
      });
    };

    warmAudio(mainTracks, initialMainTrackIndex);
    warmAudio(contactTracks);

    if (typeof window.preloadSectionAssets === "function") {
      sectionsToWarmAfterReady.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) window.preloadSectionAssets(section).catch?.(() => {});
      });
    }
  }

  // ----------------------------
  // 5) MAIN LOADING FLOW
  // ----------------------------
  async function startLoading() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    startHeroAutoplayWatch();

    await Promise.allSettled(LOADER_ASSETS.map(loadImage));
    loader.classList.add("loader-assets-ready");
    await new Promise((r) => requestAnimationFrame(() => r()));

    const tasks = [loadFonts()];
    for (const a of ASSETS) {
      if (a.type === "image") tasks.push(loadImage(a.url));
      // if (a.type === "video") tasks.push(loadVideo(a.url));
    }

    if (!navigator.connection?.saveData) {
      if (shouldBlockForSectionPreviews) {
        tasks.push(preloadAudioBlob(mainTracks[initialMainTrackIndex], (blobUrl) => {
          mainTracks[initialMainTrackIndex] = blobUrl;
        }));

        contactTracks.forEach((track, index) => {
          tasks.push(preloadAudioBlob(track, (blobUrl) => {
            contactTracks[index] = blobUrl;
          }));
        });
      } else {
        tasks.push(preloadAudio(mainTracks[initialMainTrackIndex], 2500));
        contactTracks.forEach((track) => {
          tasks.push(preloadAudio(track, 2500));
        });
      }
    }

    if (shouldBlockForSectionPreviews && typeof window.preloadSectionAssets === "function") {
      sectionsToBlockFor.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) tasks.push(window.preloadSectionAssets(section));
      });
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

    await Promise.allSettled(wrapped);

    await Promise.race([
      prepareCriticalHeroVisuals(),
      new Promise((resolve) => setTimeout(resolve, 6500)),
    ]);

    criticalAssetsReady = true;
    setProgress(100);

    // Let the UI paint before switching state
    await new Promise((r) => requestAnimationFrame(() => r()));
    await new Promise((r) => setTimeout(r, 200));

    markReady();
    warmRemainingAssetsInBackground();
  }

  const enter = async () => {
    if (!canEnter || entered) return;
    entered = true;

    await playHeroVisualsFromGesture();

    loader.classList.add("reveal");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Kick off music WITHOUT blocking reveal
    startBackgroundMusicFromUserGesture();

    // Clouds timing
    setTimeout(() => loader.classList.add("cloud-out"), 3400);

    // Remove loader
    setTimeout(() => {
      loader.style.display = "none";
    }, 5200);
  };

  loader.addEventListener("pointerdown", enter);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") enter();
  });

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
const resumePreview = document.getElementById("resumePreview");

// --- Config ---
const SUPPORTED = ["en", "ja"]; // add "km" later
const DEFAULT_LANG = "en";
const RESUME_IMAGES = {
  en: [
    { src: "images/home-section/Resume-EN-1.png", alt: "English resume page 1" },
    { src: "images/home-section/Resume-EN-2.png", alt: "English resume page 2" },
  ],
  ja: [
    { src: "images/home-section/Resume-JP-1.png", alt: "Japanese resume page 1" },
    { src: "images/home-section/Resume-JP-2.png", alt: "Japanese resume page 2" },
  ],
};

// --- i18n state ---
let dict = {};
let langSwitchToken = 0;
const languageFontPromises = new Map();
const LANGUAGE_FONTS = {
  en: [
    { face: "400 1em 'New Rocker'", sample: "Contact Me" },
    { face: "400 1em 'Syncopate'", sample: "PROJECTS" },
    { face: "700 1em 'Syncopate'", sample: "KIMYOO" },
  ],
  ja: [
    { face: "400 1em 'Yuji Syuku'", sample: "日本語 プロフィール" },
    { face: "400 1em 'Futehodo'", sample: "プロジェクト スキル" },
    { face: "400 1em 'written'", sample: "興味のあること" },
  ],
};

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

function waitWithTimeout(promise, timeoutMs = 2500) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function loadLanguageFonts(lang) {
  if (!document.fonts) return Promise.resolve();

  const l = safeLang(lang);
  if (languageFontPromises.has(l)) return languageFontPromises.get(l);

  const fonts = LANGUAGE_FONTS[l] || LANGUAGE_FONTS[DEFAULT_LANG];
  const promise = Promise.allSettled(
    fonts.map(({ face, sample }) => {
      try {
        return document.fonts.load(face, sample);
      } catch {
        return Promise.resolve();
      }
    })
  ).then(() => document.fonts.ready).catch(() => {});

  languageFontPromises.set(l, promise);
  return promise;
}

function setLanguageSwitching(isSwitching) {
  document.documentElement.classList.toggle("lang-switching", isSwitching);
  langItems.forEach((el) => {
    el.setAttribute("aria-disabled", isSwitching ? "true" : "false");
  });
}

function updateResumePreview(lang) {
  if (!resumePreview) return;

  const resumeImages = RESUME_IMAGES[safeLang(lang)] || RESUME_IMAGES[DEFAULT_LANG];
  resumePreview.dataset.resumeLang = safeLang(lang);

  resumePreview.querySelectorAll(".pdf-img").forEach((img, index) => {
    const image = resumeImages[index];
    if (!image) return;

    img.src = image.src;
    img.alt = image.alt;
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

function syncAuroraText() {
  document.querySelectorAll(".info .name").forEach((nameEl) => {
    nameEl.setAttribute("data-aurora-text", nameEl.textContent.trim());
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
  syncAuroraText();
  updateResumePreview(lang);

  document.documentElement.lang = lang;
}

async function setLang(lang) {
  const l = safeLang(lang);
  const token = ++langSwitchToken;

  setLanguageSwitching(true);

  try {
    const [nextDict] = await Promise.all([
      fetchDict(l),
      waitWithTimeout(loadLanguageFonts(l)),
    ]);

    if (token !== langSwitchToken) return document.documentElement.lang;

    dict = nextDict;
    applyDict(l);
  } catch (err) {
    if (token !== langSwitchToken) return document.documentElement.lang;

    console.warn(`Locale "${l}" not loaded yet (using HTML fallback):`, err);
    await waitWithTimeout(loadLanguageFonts(l), 1200);
    document.documentElement.lang = l;

    // Even with fallback, still sync section title shadows from current HTML
    syncSectionTitleShadows();
    syncAuroraText();
    updateResumePreview(l);
  }

  localStorage.setItem("lang", l);
  setActiveLangUI(l);
  setLanguageSwitching(false);
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
  syncAuroraText();

  // Then try to load translations
  await setLang(initial);
})();

// =============================================================================
//                            PDF Display
// ============================================================================

// -------- Download PDF Modal Logic --------
const downloadIcon = document.getElementById("downloadIcon");
const pdfModal = document.getElementById("downloadPDF");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
let jsPdfPromise = null;

function loadScript(src) {
  if (src.includes("jspdf") && jsPdfPromise) return jsPdfPromise;

  return new Promise((resolve, reject) => {
    const absoluteSrc = new URL(src, document.baseURI).href;
    const existing = Array.from(document.scripts).find((script) => script.src === absoluteSrc);
    if (existing) {
      if (window.jspdf?.jsPDF) resolve();
      else existing.addEventListener("load", resolve, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Script failed: ${src}`));
    document.head.appendChild(script);
  });
}

function getResumeImages() {
  return Array.from(resumePreview?.querySelectorAll(".pdf-img") || []);
}

function loadImage(img) {
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth) return resolve();
    img.onload = resolve;
    img.onerror = reject;
  });
}

function imageToDataUrl(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const isPng = (img.src || "").toLowerCase().includes(".png");
  return {
    dataUrl: canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 1.0),
    format: isPng ? "PNG" : "JPEG",
  };
}

function fitImageToPage(pdf, img) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const scale = Math.min(pageW / img.naturalWidth, pageH / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  return {
    w,
    h,
    x: (pageW - w) / 2,
    y: (pageH - h) / 2,
  };
}

// Safety checks (so it won't crash if elements aren't on some page)
if (downloadIcon && pdfModal && resumePreview && downloadPdfBtn) {
  function openPDFModal() {
    updateResumePreview(document.documentElement.lang);
    pdfModal.hidden = false;
    if (typeof pdfModal.showModal === "function" && !pdfModal.open) {
      pdfModal.showModal();
    }
    document.body.classList.add("pdf-open");
  }

  function closePDFModal() {
    if (typeof pdfModal.close === "function" && pdfModal.open) {
      pdfModal.close();
    }
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
    if (e.target === pdfModal || e.target?.dataset?.close === "true") closePDFModal();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pdfModal.hidden) closePDFModal();
  });

  // Click image -> fullscreen toggle
  resumePreview.addEventListener("click", async (e) => {
    const img = e.target.closest(".pdf-img");
    if (!img) return;

    try {
      if (!document.fullscreenElement) {
        await img.requestFullscreen();
        img.style.cursor = "zoom-out";
      } else {
        await document.exitFullscreen();
        img.style.cursor = "zoom-in";
      }
    } catch (_) {}
  });

  // Click anywhere (outside image) to exit fullscreen (but keep modal open)
  document.addEventListener("click", (e) => {
    if (!document.fullscreenElement) return;
    if (e.target.classList?.contains("pdf-img")) return;
    document.exitFullscreen().catch(() => {});
  });

  // Download as PDF using jsPDF
  downloadPdfBtn.addEventListener("click", async () => {
    jsPdfPromise = loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
    await jsPdfPromise;

    if (!window.jspdf?.jsPDF) {
      alert("jsPDF not loaded. Make sure the CDN script is included.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const resumeImages = getResumeImages();
    const firstImage = resumeImages[0];

    if (!firstImage) return;

    // Ensure images are loaded
    await Promise.all(resumeImages.map(loadImage));

    const pdf = new jsPDF({
      orientation: firstImage.naturalWidth > firstImage.naturalHeight ? "landscape" : "portrait",
      unit: "pt",
      format: "a4",
    });

    resumeImages.forEach((img, index) => {
      if (index > 0) {
        const orientation = img.naturalWidth > img.naturalHeight ? "landscape" : "portrait";
        pdf.addPage("a4", orientation);
      }

      const { dataUrl, format } = imageToDataUrl(img);
      const { x, y, w, h } = fitImageToPage(pdf, img);
      pdf.addImage(dataUrl, format, x, y, w, h);
    });

    const lang = safeLang(document.documentElement.lang);
    pdf.save(`resume-${lang}.pdf`);
  });
}
