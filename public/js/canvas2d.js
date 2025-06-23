// ===========================
// ESTRELLAS FUGACES CÓSMICAS
// ===========================

// 1. Utils
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// 2. Canvas Setup
let canvas, ctx;
export function iniciarCanvas2d(canvasId = "estrellas-fugaces") {
  canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`No se encontró canvas con id ${canvasId}`);
    return;
  }
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(animarEstrellas);

  // Lanzador automático
  setInterval(() => {
    if (Math.random() > 0.5) lanzarEstrellaRandom();
  }, 1400);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 3. Clase Estrella Fugaz
class EstrellaFugaz {
  constructor() {
    this.direccion = Math.random() > 0.5 ? 1 : -1;
    this.startY = randomBetween(canvas.height * 0.08, canvas.height * 0.48);
    this.radius = randomBetween(2, 4.3);
    this.length = canvas.width * randomBetween(0.55, 0.77);
    this.duration = randomBetween(1700, 2500);
    this.startTime = performance.now();
    this.endY = this.startY + randomBetween(-55, 55);
    this.arcHeight = randomBetween(80, 240);
    this.particles = [];
    this.particleLife = randomBetween(430, 650);
  }

  // Posición sobre parábola
  getPos(progress) {
    const t = progress;
    const x = this.direccion === 1
      ? t * this.length
      : canvas.width - t * this.length;
    const y = this.startY - Math.sin(Math.PI * t) * this.arcHeight + (this.endY - this.startY) * t;
    return { x, y };
  }

  draw(now) {
    const elapsed = now - this.startTime;
    let progress = Math.min(elapsed / this.duration, 1);

    // Cola afilada
    ctx.save();
    ctx.beginPath();
    let pasos = 36;
    for (let i = 0; i <= pasos; i++) {
      const t = progress - (i / pasos) * 0.40;
      if (t < 0) continue;
      const { x, y } = this.getPos(t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Gradiente de cola
    const { x: x0, y: y0 } = this.getPos(progress);
    const { x: x1, y: y1 } = this.getPos(progress - 0.37);
    let grad = ctx.createLinearGradient(x0, y0, x1, y1);
    if (this.direccion === 1) {
      grad.addColorStop(0, "rgba(255,255,255,0.99)");
      grad.addColorStop(0.06, "#fffbe0");
      grad.addColorStop(0.38, "#b187f0cc");
      grad.addColorStop(1, "rgba(130,64,210,0)");
    } else {
      grad.addColorStop(1, "rgba(255,255,255,0.99)");
      grad.addColorStop(0.95, "#fffbe0");
      grad.addColorStop(0.62, "#b187f0cc");
      grad.addColorStop(0, "rgba(130,64,210,0)");
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.radius * (1.15 - progress * 0.7);
    ctx.shadowColor = "#ffe1ff";
    ctx.shadowBlur = 17;
    ctx.globalAlpha = 0.79 - 0.55 * progress;
    ctx.stroke();
    ctx.restore();

    // Partículas chispeantes
    if (progress < 0.98 && Math.random() > 0.81) {
      const { x, y } = this.getPos(progress - 0.15 * Math.random());
      this.particles.push({
        x, y,
        alpha: 0.5 + Math.random() * 0.25,
        size: 1 + Math.random() * 1.6,
        born: now
      });
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      let life = (now - p.born) / this.particleLife;
      if (life > 1) {
        this.particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha * (1 - life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - life * 0.5), 0, 2 * Math.PI);
      ctx.fillStyle = "#fffbe9";
      ctx.shadowColor = "#a86cf7";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    // Cabeza brillante y afilada
    ctx.save();
    const { x, y } = this.getPos(progress);
    // Halo
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 2.2, 0, 2 * Math.PI);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#fffce1";
    ctx.shadowColor = "#fff8";
    ctx.shadowBlur = 18;
    ctx.fill();
    // Centro brillante
    ctx.beginPath();
    ctx.arc(x, y, this.radius * 0.95, 0, 2 * Math.PI);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 7;
    ctx.fill();
    // Destello afilado tipo estrella
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
    ctx.restore();

    return progress < 1;
  }
}

// 4. Control de instancias
let estrellas = [];
function lanzarEstrellaRandom() {
  estrellas.push(new EstrellaFugaz());
}

// 5. Animación principal
function animarEstrellas(now) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  estrellas = estrellas.filter(e => e.draw(now));
  requestAnimationFrame(animarEstrellas);
}


// ============
// HTML SUGERIDO
// ============
// <canvas id="estrellas-fugaces" style="position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:7000;"></canvas>
