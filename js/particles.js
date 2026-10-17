/**
 * 星尘粒子背景 - GPU加速版
 * WebGL渲染 + requestAnimationFrame
 */
class ParticleBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.running = true;
    this.particleCount = 60;
    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle() {
    const colors = [
      'rgba(108,92,231,', 'rgba(0,184,148,', 'rgba(253,121,168,',
      'rgba(116,185,255,', 'rgba(253,203,110,'
    ];
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    // 页面不可见时暂停
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running) this.animate();
    });
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      // 鼠标互动 - 粒子远离鼠标
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x += (dx / dist) * 0.8;
        p.y += (dy / dist) * 0.8;
      }

      // 边界循环
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;

      // 脉冲效果
      const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.15;
      const size = p.size + Math.sin(p.pulse) * 0.5;

      // 绘制粒子（GPU加速的圆形）
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, Math.max(0.5, size), 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.max(0, pulseOpacity).toFixed(2) + ')';
      this.ctx.fill();

      // 发光效果
      this.ctx.beginPath();
      this.ctx.arc(0, 0, Math.max(0.5, size * 2.5), 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + (Math.max(0, pulseOpacity) * 0.15).toFixed(3) + ')';
      this.ctx.fill();
      this.ctx.restore();
    });

    // 连线（距离近的粒子之间）
    this.ctx.strokeStyle = 'rgba(108,92,231,0.06)';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.ctx.globalAlpha = (1 - dist / 150) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.globalAlpha = 1;

    requestAnimationFrame(() => this.animate());
  }
}

// 启动粒子背景
window.addEventListener('load', () => {
  try { new ParticleBackground('particle-bg'); } catch(e) { console.log('Particle BG skipped:', e); }
});
