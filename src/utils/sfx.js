// ── Sound Engine (Web Audio API) ──
const SFX = {
  _ctx: null,
  _get() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  },
  play(type) {
    try {
      const ctx = this._get();
      const now = ctx.currentTime;
      if (type === "pop") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        o.start(now); o.stop(now + 0.15);
      } else if (type === "coin") {
        [800, 1000, 1200].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "triangle"; o.frequency.setValueAtTime(f, now + i * 0.06);
          g.gain.setValueAtTime(0.2, now + i * 0.06); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.12);
          o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.12);
        });
      } else if (type === "levelup") {
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.25, now + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.2);
        });
      } else if (type === "celeb") {
        [784, 988, 1175, 1568, 1175, 1568].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "square"; o.frequency.setValueAtTime(f, now + i * 0.08);
          g.gain.setValueAtTime(0.15, now + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.15);
        });
      } else if (type === "match") {
        [880, 1175].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.25, now + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.15);
        });
      } else if (type === "tap") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(1000, now);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        o.start(now); o.stop(now + 0.05);
      } else if (type === "buy") {
        [1200, 900, 1400].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.08);
          g.gain.setValueAtTime(0.2, now + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.1);
        });
      } else if (type === "purr") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(180, now); o.frequency.linearRampToValueAtTime(200, now + 0.3);
        g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0.08, now + 0.15); g.gain.linearRampToValueAtTime(0.15, now + 0.3); g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        o.start(now); o.stop(now + 0.5);
      } else if (type === "feed") {
        [600, 800, 1000, 1200].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.06);
          g.gain.setValueAtTime(0.15, now + i * 0.06); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.1);
          o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.1);
        });
      } else if (type === "bossHit") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sawtooth"; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        o.start(now); o.stop(now + 0.2);
      } else if (type === "bossDefeat") {
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = i < 3 ? "sine" : "square";
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.2, now + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
          o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.25);
        });
      } else if (type === "evolve") {
        [440, 554, 659, 880, 1047, 1319, 1568].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.09);
          g.gain.setValueAtTime(0.18, now + i * 0.09); g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.2);
          o.start(now + i * 0.09); o.stop(now + i * 0.09 + 0.2);
        });
      } else if (type === "alarm") {
        // Friendly alarm bell — three ascending chimes repeated
        [880, 1047, 1319, 880, 1047, 1319, 880, 1047, 1319].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = "sine"; o.frequency.setValueAtTime(f, now + i * 0.15);
          g.gain.setValueAtTime(0.25, now + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);
          o.start(now + i * 0.15); o.stop(now + i * 0.15 + 0.2);
        });
      } else if (type === "flap") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        o.start(now); o.stop(now + 0.1);
      } else if (type === "crash") {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        o.start(now); o.stop(now + 0.25);
      } else if (type === "tick") {
        // Soft tick for last-minute warning
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.setValueAtTime(1200, now);
        g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        o.start(now); o.stop(now + 0.06);
      } else if (type === "victory") {
        // Victory fanfare — longer celebratory sequence
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = i < 4 ? "sine" : "square";
          o.frequency.setValueAtTime(f, now + i * 0.12);
          g.gain.setValueAtTime(0.2, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.25);
          o.start(now + i * 0.12); o.stop(now + i * 0.12 + 0.25);
        });
      }
    } catch (e) { /* silent fail */ }
  }
};

export default SFX;
