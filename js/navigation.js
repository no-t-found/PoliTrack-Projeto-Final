/* ════════════════════════════════════════════════════════════
   MÓDULO DE NAVEGAÇÃO
   Scroll entre secções, botão de início, dots, e modo kiosk
   (avanço automático quando não há interação).
═══════════════════════════════════════════════════════════════ */

const Navigation = (() => {
  let currentSection = 0;
  let kioskTimer = null;
  let idleTimer = null;

  // Índices de secções com fundo claro — os dots e o botão
  // "início" precisam de uma variante de cor mais escura aqui
  // para manter contraste suficiente (ver css/03-components.css).
  const LIGHT_SECTIONS = [2]; // S3 — Manifesto ("O que é")

  let elRoot, elDots, elHomeBtn, elKioskPip, elNavDots;

  function goTo(index) {
    elRoot.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
  }

  function goHome() {
    goTo(0);
  }

  function updateActiveState(index) {
    currentSection = index;
    elDots.forEach((dot, i) => dot.classList.toggle('on', i === index));
    elHomeBtn.classList.toggle('vis', index > 0);

    const onLightSection = LIGHT_SECTIONS.includes(index);
    elNavDots.classList.toggle('on-light', onLightSection);
    elHomeBtn.classList.toggle('on-light', onLightSection);
  }

  function startKioskMode() {
    elKioskPip.classList.add('vis');
    kioskTimer = setInterval(() => {
      // Na secção de vídeos, o avanço automático é controlado
      // pelo número de loops de cada vídeo (ver videos.js), não
      // por este temporizador de secções — por isso não avança
      // enquanto a pessoa estiver a ver essa secção.
      if (currentSection === CONFIG.videoSectionIndex) return;
      goTo((currentSection + 1) % CONFIG.totalSections);
    }, CONFIG.kioskIntervalMs);
  }

  function stopKioskMode() {
    elKioskPip.classList.remove('vis');
    clearInterval(kioskTimer);
  }

  function resetIdleTimer() {
    stopKioskMode();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(startKioskMode, CONFIG.idleTimeoutMs);
  }

  function handleKeyboard(e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      elRoot.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      elRoot.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    }
  }

  function init() {
    elRoot     = document.getElementById('root');
    elDots     = document.querySelectorAll('.dot');
    elHomeBtn  = document.getElementById('home-btn');
    elKioskPip = document.getElementById('kiosk-pip');
    elNavDots  = document.getElementById('nav-dots');

    elRoot.addEventListener('scroll', () => {
      updateActiveState(Math.round(elRoot.scrollTop / window.innerHeight));
      resetIdleTimer();
    }, { passive: true });

    document.addEventListener('keydown', handleKeyboard);

    ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(evt => {
      document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();
  }

  return { init, goTo, goHome };
})();

// Exposta globalmente para os onclick="" inline no HTML
function goTo(index) {
  Navigation.goTo(index);
}
function goHome() {
  Navigation.goHome();
}
