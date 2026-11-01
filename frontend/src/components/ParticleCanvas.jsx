import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle pool
    const particleCount = 45;
    const particles = [];
    const colors = [
      'rgba(255, 107, 43, ',  // Witch Orange
      'rgba(245, 186, 66, ',  // Antique Gold
      'rgba(157, 78, 221, ',  // Arcane Purple
      'rgba(0, 245, 212, '    // Spectral Cyan
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.2 + 0.8,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2, // Floats gently upward like embers
        pulseSpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.pulseSpeed;
        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.angle) * 0.25);

        // Wrap around
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw particle with glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${currentAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.colorBase}0.8)`;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas fixed inset-0 pointer-events-none z-0"
    />
  );
}

