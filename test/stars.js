// =====================
// 1️⃣ SETUP
// =====================
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = [];
const shootingStars = [];
const STAR_COUNT = 150;

// Create background stars
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    s: Math.random() * 0.5 + 0.2
  });
}

// =====================
// 2️⃣ SHOOTING STAR CREATOR
// =====================
function createShootingStar() {
  const angle = Math.PI / 4; // 45° (↘︎ direction)

  shootingStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5,
    length: Math.random() * 100 + 60,
    speed: Math.random() * 12 + 8,
    angle: angle,
    life: 0
  });
}

// =====================
// 3️⃣ DRAW LOOP
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🌟 Background stars
  ctx.fillStyle = "white";
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.s;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }

  // 🌠 Shooting stars (REAL METEOR PHYSICS)
  ctx.save();
  ctx.shadowColor = "white";
  ctx.shadowBlur = 12;

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];

    const dx = Math.cos(s.angle);
    const dy = Math.sin(s.angle);

    // Tail gradient (opposite direction)
    const gradient = ctx.createLinearGradient(
      s.x,
      s.y,
      s.x - dx * s.length,
      s.y - dy * s.length
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(
      s.x - dx * s.length,
      s.y - dy * s.length
    );
    ctx.stroke();

    // Bright meteor head
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Move meteor (same angle)
    s.x += dx * s.speed;
    s.y += dy * s.speed;
    s.life++;

    if (s.life > 35) {
      shootingStars.splice(i, 1);
    }
  }

  ctx.restore();

  // Random spawn
  if (Math.random() < 0.02) {
    createShootingStar();
  }

  requestAnimationFrame(draw);
}

// =====================
// 4️⃣ START
// =====================
draw();
