/**
 * Я-Зарядка AI — Основная логика
 * Version 2.0 (Production)
 */

// ===================================
// Reveal on scroll animation
// ===================================
const initScrollReveal = () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
};

// ===================================
// Mobile touch animations
// ===================================
const initTouchFeedback = () => {
  document.querySelectorAll('.btn, .game-card, .demo-btn').forEach(btn => {
    btn.addEventListener('touchstart', function(e) {
      this.classList.add('touch-active');
      setTimeout(() => this.classList.remove('touch-active'), 300);
    });
  });
};

// ===================================
// Night mode (automatic based on time)
// ===================================
const initNightMode = () => {
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 6;
  
  if (isNight) {
    document.body.classList.add('night-mode');
  }
  
  // Allow manual toggle
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = isNight ? '☀️' : '🌙';
  toggleBtn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;width:50px;height:50px;border-radius:50%;background:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);';
  toggleBtn.setAttribute('aria-label', 'Переключить тему');
  
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
  });
  
  document.body.appendChild(toggleBtn);
};

// ===================================
// Magnetic button effect
// ===================================
const initMagneticButtons = () => {
  document.querySelectorAll('.btn.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
};

// ===================================
// Particle effects on click
// ===================================
const createParticle = (x, y) => {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.innerHTML = ['✨', '⭐', '⚡', '🌟'][Math.floor(Math.random() * 4)];
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.fontSize = `${20 + Math.random() * 20}px`;
  
  document.body.appendChild(particle);
  
  setTimeout(() => particle.remove(), 1000);
};

const initParticleEffects = () => {
  document.addEventListener('click', (e) => {
    // Create particles on buttons and interactive elements
    if (e.target.closest('.btn, .game-card, .demo-btn, .play-btn')) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createParticle(
            e.clientX + (Math.random() - 0.5) * 50,
            e.clientY + (Math.random() - 0.5) * 50
          );
        }, i * 50);
      }
    }
  });
};

// ===================================
// Sun cursor following mouse
// ===================================
const initSunCursor = () => {
  // Only on desktop
  if (window.innerWidth <= 900) return;
  
  const sun = document.createElement('div');
  sun.className = 'sun-cursor';
  sun.innerHTML = `
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="20" fill="#FFD85A"/>
      <g stroke="#FFD85A" stroke-width="4">
        <line x1="50" y1="10" x2="50" y2="25"/>
        <line x1="50" y1="75" x2="50" y2="90"/>
        <line x1="10" y1="50" x2="25" y2="50"/>
        <line x1="75" y1="50" x2="90" y2="50"/>
        <line x1="22" y1="22" x2="32" y2="32"/>
        <line x1="68" y1="68" x2="78" y2="78"/>
        <line x1="22" y1="78" x2="32" y2="68"/>
        <line x1="68" y1="32" x2="78" y2="22"/>
      </g>
    </svg>
  `;
  
  document.body.appendChild(sun);
  
  document.addEventListener('mousemove', (e) => {
    sun.style.transform = `translate(${e.clientX - 40}px, ${e.clientY - 40}px)`;
  });
};

// ===================================
// Mascot helper
// ===================================
const mascotMessages = [
  "Отличная работа! 💪",
  "Ты супер! ⭐",
  "Продолжай в том же духе! 🚀",
  "Молодец! 👏",
  "Так держать! 🔥",
  "Ты сможешь! 💫",
  "Ура! 🎉"
];

const initMascotHelper = () => {
  const mascot = document.createElement('div');
  mascot.className = 'mascot-helper';
  mascot.textContent = '🤖';
  mascot.setAttribute('aria-label', 'Помощник');
  
  const bubble = document.createElement('div');
  bubble.className = 'mascot-bubble';
  
  document.body.appendChild(mascot);
  document.body.appendChild(bubble);
  
  mascot.addEventListener('click', () => {
    const randomMsg = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
    bubble.textContent = randomMsg;
    bubble.classList.add('visible');
    
    setTimeout(() => bubble.classList.remove('visible'), 3000);
  });
  
  // Show random message every 30 seconds
  setInterval(() => {
    if (!bubble.classList.contains('visible')) {
      const randomMsg = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
      bubble.textContent = randomMsg;
      bubble.classList.add('visible');
      setTimeout(() => bubble.classList.remove('visible'), 3000);
    }
  }, 30000);
};

// ===================================
// Breathing exercise
// ===================================
const initBreathingExercise = () => {
  const breathingArea = document.getElementById('breathingExercise');
  if (!breathingArea) return;
  
  const circle = document.createElement('div');
  circle.className = 'breathing-circle';
  circle.textContent = 'Вдох';
  
  breathingArea.appendChild(circle);
  
  const textChange = () => {
    const phase = circle.textContent === 'Вдох' ? 'Выдох' : 'Вдох';
    circle.textContent = phase;
  };
  
  setInterval(textChange, 4000);
};

// ===================================
// Star catcher mini-game
// ===================================
let starScore = 0;

const initStarGame = () => {
  const gameArea = document.getElementById('starGame');
  if (!gameArea) return;
  
  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'score-display';
  scoreDisplay.textContent = 'Счёт: 0';
  gameArea.appendChild(scoreDisplay);
  
  const spawnStar = () => {
    if (!document.body.contains(gameArea)) return;
    
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.left = `${Math.random() * 90}%`;
    star.style.top = '-30px';
    
    star.addEventListener('click', () => {
      starScore++;
      scoreDisplay.textContent = `Счёт: ${starScore}`;
      star.remove();
      
      // Create particle effect
      for (let i = 0; i < 3; i++) {
        createParticle(
          parseFloat(star.style.left) * gameArea.offsetWidth / 100,
          parseFloat(star.offsetTop)
        );
      }
    });
    
    gameArea.appendChild(star);
    
    setTimeout(() => {
      if (document.body.contains(star)) star.remove();
    }, 3000);
  };
  
  // Spawn stars every 800ms
  const gameInterval = setInterval(spawnStar, 800);
  
  // Store interval for cleanup
  gameArea.dataset.intervalId = gameInterval;
};

// ===================================
// Initialize all
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTouchFeedback();
  initNightMode();
  initMagneticButtons();
  initParticleEffects();
  initSunCursor();
  initMascotHelper();
  initBreathingExercise();
  initStarGame();
  
  console.log('⚡ Я-Зарядка AI готов!');
});
