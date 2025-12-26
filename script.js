// =============================================================================
// Background music
// ============================================================================

// const gate = document.getElementById("gate");
// const enterBtn = document.getElementById("enterBtn");

// const bgMusic = document.getElementById("bgMusic");
// const musicIcon = document.getElementById("musicIcon");

// // 🎵 main tracks (random first)
// const mainTracks = [
//   "./music/background-music-01.mp3",
//   "./music/background-music-02.mp3",
// ];

// // 🎵 last track (must be played only after both main tracks)
// const lastTrack = "./music/contact-background-music-02.mp3";

// let queue = [];
// let isPlaying = false;

// function loadTrack(src) {
//   bgMusic.src = src;
//   bgMusic.load();
// }

// // Build one full cycle:
// // random (01 or 02) -> the other one -> contact track
// function buildCycleQueue() {
//   const first = Math.random() < 0.5 ? 0 : 1; // 50/50
//   const second = 1 - first;

//   queue = [
//     mainTracks[first],
//     mainTracks[second],
//     lastTrack,
//   ];
// }

// // play next track when current ends
// bgMusic.addEventListener("ended", async () => {
//   // if cycle finished, build a new one (random again)
//   if (queue.length === 0) buildCycleQueue();

//   const nextSrc = queue.shift();
//   loadTrack(nextSrc);

//   try {
//     await bgMusic.play();
//     isPlaying = true;
//     musicIcon.src = "./icons/Musical.svg";
//   } catch (e) {
//     console.warn("Playback failed:", e);
//   }
// });

// // enter gate → start music
// enterBtn.addEventListener("click", async () => {
//   try {
//     bgMusic.volume = 0.7;

//     // start a fresh cycle
//     buildCycleQueue();

//     // play first track from the queue
//     const firstSrc = queue.shift();
//     loadTrack(firstSrc);

//     await bgMusic.play();
//     isPlaying = true;
//     musicIcon.src = "./icons/Musical.svg";
//   } catch (e) {
//     console.warn("Playback failed:", e);
//   }

//   gate.classList.add("hidden");
// });

// // toggle play / pause
// musicIcon.addEventListener("click", async () => {
//   if (isPlaying) {
//     bgMusic.pause();
//     musicIcon.src = "./icons/No Music.svg";
//     isPlaying = false;
//   } else {
//     try {
//       await bgMusic.play();
//       musicIcon.src = "./icons/Musical.svg";
//       isPlaying = true;
//     } catch (e) {
//       console.warn("Playback failed:", e);
//     }
//   }
// });

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
// H1's background
// =============================================================================

const h1 = document.querySelector(".video-h1");
const video = document.getElementById("h1vid");
const canvas = document.getElementById("h1canvas");
const ctx = canvas.getContext("2d");

// 0–1 range (like object-position percentages)
let posX = 0.5;  
let posY = 0.9; 

function resizeCanvas() {
  const text = h1.dataset.text;
  const style = getComputedStyle(h1);

  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = ctx.measureText(text);

  const height = parseFloat(style.fontSize) * 1.2;
  canvas.width = Math.ceil(metrics.width);
  canvas.height = Math.ceil(height);
}

function draw() {
  if (video.readyState >= 2) {
    const text = h1.dataset.text;
    const style = getComputedStyle(h1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw text mask
    ctx.save();
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    ctx.fillText(text, 0, 0);

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
  video.play().catch(() => {}); // just in case autoplay is picky
  draw();
});

window.addEventListener("resize", resizeCanvas);

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
