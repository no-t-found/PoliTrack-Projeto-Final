/* ════════════════════════════════════════════════════════════
   MÓDULO DE VÍDEOS
   Lógica da galeria de vídeos: seleção, autoplay, countdown,
   e o botão de ocultar/mostrar a sidebar de navegação.
   Os dados (lista de vídeos) vivem em data.js.
═══════════════════════════════════════════════════════════════ */

const VideoGallery = (() => {
  let currentIndex = 0;
  let countdownTimer = null;
  let countdown = CONFIG.videoDurationSec;
  let isPaused = false;
  let sidebarCollapsed = false;

  // referências DOM (preenchidas em init)
  let elFrameWrap, elPlaceholder, elCat, elTitle, elDesc, elCountdown, elAutonext;
  let elSidebar, elToggle;

  function buildEmbedUrl(videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}` +
      `?autoplay=1&mute=1&loop=1&playlist=${videoId}` +
      `&controls=0&rel=0&modestbranding=1&playsinline=1` +
      `&iv_load_policy=3&disablekb=1&fs=0`;
  }

  // Um ID real do YouTube tem sempre 11 caracteres e nunca
  // começa por "VIDEO_ID" (usado como placeholder em data.js).
  function hasRealId(video) {
    return Boolean(video.id) && !video.id.startsWith('VIDEO_ID') && video.id.length === 11;
  }

  function select(index) {
    const video = VIDEOS[index];
    currentIndex = index;

    // atualiza estado ativo na sidebar
    document.querySelectorAll('.vid-item-row').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // atualiza overlay de contexto
    elCat.textContent = video.cat;
    elTitle.textContent = video.title;
    elDesc.textContent = video.desc;

    // carrega o vídeo real ou mostra o placeholder
    if (hasRealId(video)) {
      elPlaceholder.style.display = 'none';
      elFrameWrap.style.display = 'block';
      elFrameWrap.innerHTML =
        `<iframe src="${buildEmbedUrl(video.id)}" title="${video.title}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
      elPlaceholder.style.display = 'flex';
      elFrameWrap.style.display = 'none';
      elFrameWrap.innerHTML = '';
    }

    startCountdown();
  }

  function startCountdown() {
    clearInterval(countdownTimer);

    // reset de todas as barras de progresso
    document.querySelectorAll('.vid-pf').forEach(el => {
      el.style.transition = 'none';
      el.style.width = '0%';
    });

    countdown = CONFIG.videoDurationSec;
    elCountdown.textContent = countdown;

    // anima a barra do item atual
    const fill = document.getElementById(`vp-${currentIndex}`);
    if (fill) {
      requestAnimationFrame(() => {
        fill.style.transition = `width ${CONFIG.videoDurationSec}s linear`;
        fill.style.width = '100%';
      });
    }

    countdownTimer = setInterval(() => {
      if (isPaused) return;
      countdown--;
      elCountdown.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        select((currentIndex + 1) % VIDEOS.length);
      }
    }, 1000);
  }

  function pause() {
    isPaused = true;
    elAutonext.style.opacity = '0.35';
  }

  function resume() {
    isPaused = false;
    elAutonext.style.opacity = '1';
  }

  /** Mostra/oculta a sidebar de navegação. Nunca desaparece por
   *  completo — fica sempre uma faixa fina com o botão visível,
   *  para o utilizador saber que pode voltar a abri-la. */
  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    elSidebar.classList.toggle('collapsed', sidebarCollapsed);
    elToggle.setAttribute('aria-expanded', String(!sidebarCollapsed));
    elToggle.setAttribute('aria-label', sidebarCollapsed ? 'Mostrar lista de vídeos' : 'Ocultar lista de vídeos');
  }

  function init() {
    elFrameWrap   = document.getElementById('vid-frame-wrap');
    elPlaceholder = document.getElementById('vid-placeholder');
    elCat         = document.getElementById('vid-now-cat');
    elTitle       = document.getElementById('vid-now-title');
    elDesc        = document.getElementById('vid-now-desc');
    elCountdown   = document.getElementById('vid-countdown');
    elAutonext    = document.getElementById('vid-autonext');
    elSidebar     = document.getElementById('vid-sidebar');
    elToggle      = document.getElementById('vid-toggle');

    const mainArea = document.getElementById('vid-main');
    mainArea.addEventListener('mouseenter', pause);
    mainArea.addEventListener('mouseleave', resume);

    elToggle.addEventListener('click', toggleSidebar);

    select(0);
  }

  // API pública — selectVid() é chamado inline pelos botões no HTML
  return { init, select, toggleSidebar };
})();

// Exposta globalmente para os onclick="" inline no HTML
function selectVid(index) {
  VideoGallery.select(index);
}
