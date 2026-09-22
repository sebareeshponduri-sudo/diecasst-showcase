/**
 * 3D Void Vertical Particle Engine
 * Gentle, slow ambient floating in 3D depth layers with vertical scroll-following physics
 */

class Void3DParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.particleCount = 90;
    this.fov = 420;
    this.maxDepth = 1200;
    
    // Slow vertical velocity & scroll coupling
    this.scrollVelocityY = 0;
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;
    this.lastScrollTime = performance.now();
    
    // Mouse subtle horizontal parallax
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.currentRotX = 0;
    this.currentRotY = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });

    // Populate particles across depth volume with fixed depth planes
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  createParticle(randomInitialY = false) {
    const spreadX = this.width * 1.35;
    const spreadY = this.height * 1.35;
    const z = 40 + Math.random() * (this.maxDepth - 40);

    return {
      x: (Math.random() - 0.5) * spreadX,
      y: randomInitialY ? (Math.random() - 0.5) * spreadY : spreadY / 2 + 20,
      z: z, // Fixed depth plane (no back-and-forth movement)
      baseRadius: 1.2 + Math.random() * 1.8,
      baseVy: -0.32 - Math.random() * 0.38, // Noticeably faster upward ambient float
      vx: (Math.random() - 0.5) * 0.1, // Subtle horizontal sway
      alpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.016 + Math.random() * 0.018, // Active breathing cycle
      amplitude: 0.16 + Math.random() * 0.22,
      colorVariant: Math.random() > 0.45 ? 'accent' : 'slate',
      prevScreenX: 0,
      prevScreenY: 0
    };
  }

  handleMouseMove(e) {
    const normX = (e.clientX - this.centerX) / this.centerX;
    const normY = (e.clientY - this.centerY) / this.centerY;
    this.targetRotY = normX * 0.05;
    this.targetRotX = -normY * 0.05;
  }

  handleScroll() {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const now = performance.now();
    const dt = Math.max(now - this.lastScrollTime, 1);
    const scrollDelta = (currentScrollY - this.lastScrollY) / (dt / 16);

    this.lastScrollY = currentScrollY;
    this.lastScrollTime = now;

    // Smoothly follow scroll speed vertically (up and down)
    this.scrollVelocityY -= scrollDelta * 0.42;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse parallax interpolation
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.03;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.03;

    // Fluid damping to ease back into slow float
    this.scrollVelocityY *= 0.93;

    const cosY = Math.cos(this.currentRotY);
    const sinY = Math.sin(this.currentRotY);
    const cosX = Math.cos(this.currentRotX);
    const sinX = Math.sin(this.currentRotX);

    const halfHeight = this.height * 0.7;
    const halfWidth = this.width * 0.7;

    const projectedPoints = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Slow Harmonic Sway
      p.phase += p.phaseSpeed;
      const harmonicSway = Math.sin(p.phase) * p.amplitude;
      
      // Depth parallax: Foreground particles react slightly more to scroll speed than background
      const depthScale = this.fov / (this.fov + p.z);
      const verticalMove = p.baseVy + harmonicSway + (this.scrollVelocityY * depthScale);
      
      p.y += verticalMove;
      p.x += p.vx;

      // Vertical boundary wrapping (slow smooth wrap)
      if (p.y < -halfHeight - 30) {
        p.y = halfHeight + 20;
        p.x = (Math.random() - 0.5) * (this.width * 1.35);
      } else if (p.y > halfHeight + 30) {
        p.y = -halfHeight - 20;
        p.x = (Math.random() - 0.5) * (this.width * 1.35);
      }

      if (p.x < -halfWidth - 30) p.x = halfWidth + 20;
      if (p.x > halfWidth + 30) p.x = -halfWidth - 20;

      // 3D camera projection
      let rx = p.x * cosY - p.z * sinY;
      let rz = p.x * sinY + p.z * cosY;
      let ry = p.y * cosX - rz * sinX;
      rz = p.y * sinX + rz * cosX;

      if (rz <= 5) continue;

      const scale = this.fov / (this.fov + rz);
      const screenX = this.centerX + rx * scale;
      const screenY = this.centerY + ry * scale;
      const screenRadius = Math.max(0.6, p.baseRadius * scale * 1.8);

      // Depth Alpha Fog
      const depthFactor = 1 - Math.min(Math.max(rz / this.maxDepth, 0), 1);
      const alpha = Math.min(p.alpha * (0.3 + depthFactor * 0.7), 0.8);

      projectedPoints.push({ screenX, screenY, rz, alpha, color: p.colorVariant });

      // Draw Particle
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.colorVariant === 'accent'
        ? `rgba(165, 243, 252, ${alpha})`
        : `rgba(148, 163, 184, ${alpha * 0.75})`;
      this.ctx.fill();

      p.prevScreenX = screenX;
      p.prevScreenY = screenY;
    }

    // Connect close vertical void nodes with faint ambient lines
    const maxDist = 80;
    const len = projectedPoints.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < Math.min(i + 8, len); j++) {
        const p1 = projectedPoints[i];
        const p2 = projectedPoints[j];

        if (Math.abs(p1.rz - p2.rz) > 140) continue;

        const dx = p1.screenX - p2.screenX;
        const dy = p1.screenY - p2.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.08 * Math.min(p1.alpha, p2.alpha);
          this.ctx.beginPath();
          this.ctx.moveTo(p1.screenX, p1.screenY);
          this.ctx.lineTo(p2.screenX, p2.screenY);
          this.ctx.strokeStyle = `rgba(165, 243, 252, ${lineAlpha})`;
          this.ctx.lineWidth = 0.65;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.particleEngine = new Void3DParticleEngine('particle-canvas');
});
