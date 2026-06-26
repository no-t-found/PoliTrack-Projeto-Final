/* ════════════════════════════════════════════════════════════
   MÓDULO DE VÍDEOS
   Lógica da galeria de vídeos: seleção, autoplay, countdown,
   e o botão de ocultar/mostrar a sidebar de navegação.
   Os dados (lista de vídeos) vivem em data.js.

   Usa a YouTube IFrame Player API (em vez de só parâmetros de
   URL) por duas razões:
   1. Conseguimos detetar o momento exato em que o vídeo começa
      a reproduzir de verdade (onStateChange) e só aí tornar o
      iframe visível — elimina o "flash" de controlos nativos
      do YouTube que aparece enquanto o player inicializa,
      independentemente de quanto tempo isso demore na rede
      da pessoa que está a ver o site.
   2. setPlaybackQuality('hd1080') força 1080p de forma mais
      fiável do que o parâmetro de URL "vq" sozinho.
═══════════════════════════════════════════════════════════════ */

const VideoGallery = (() => {
  let currentIndex = 0;
  let countdownTimer = null;
  let countdown = CONFIG.videoDurationSec;
  let isPaused = false;
  let sidebarCollapsed = false;
  let apiReady = false;
  let pendingVideoId = null;
  let player = null;

  // referências DOM (preenchidas em init)
  let elFrameWrap, elPlaceholder, elTitle, elDesc, elCountdown, elAutonext;
  let elSidebar, elToggle, elMainArea;

  // Um ID real do YouTube tem sempre 11 caracteres e nunca
  // começa por "VIDEO_ID" (usado como placeholder em data.js).
  function hasRealId(video) {
    return Boolean(video.id) && !video.id.startsWith('VIDEO_ID') && video.id.length === 11;
  }

  /** Carrega o script da IFrame API uma única vez. */
  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) {
      apiReady = true;
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      if (pendingVideoId) {
        createPlayer(pendingVideoId);
        pendingVideoId = null;
      }
    };
  }

  function createPlayer(videoId) {
    elFrameWrap.style.display = 'block';
    elFrameWrap.classList.add('has-player');
    elFrameWrap.classList.remove('is-playing');
    elFrameWrap.innerHTML = '<div id="yt-player-target"></div>';

    player = new YT.Player('yt-player-target', {
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        loop: 1,
        playlist: videoId,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          // Força 1080p de forma explícita via API — mais
          // fiável do que o parâmetro de URL "vq" isolado.
          e.target.setPlaybackQuality('hd1080');
          e.target.playVideo();
        },
        onStateChange: (e) => {
          // Estado 1 = a reproduzir de verdade. Só agora o
          // iframe se torna visível — sem flash de controlos.
          if (e.data === YT.PlayerState.PLAYING) {
            elPlaceholder.style.display = 'none';
            elFrameWrap.classList.add('is-playing');
            // reforça 1080p sempre que o estado muda para
            // reproduzir, caso o YouTube tenha ajustado a
            // qualidade automaticamente por largura de banda
            e.target.setPlaybackQuality('hd1080');
          }
        },
        onPlaybackQualityChange: (e) => {
          if (e.data !== 'hd1080' && e.target.getAvailableQualityLevels().includes('hd1080')) {
            e.target.setPlaybackQuality('hd1080');
          }
        },
      },
    });
  }

  function buildPosterUrl(videoId) {
    // Thumbnail estática do YouTube — é só uma imagem (alguns KB),
    // nada a ver com o peso do player/JS da IFrame API.
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  function select(index, { loadPlayer = true } = {}) {
    const video = VIDEOS[index];
    currentIndex = index;

    // atualiza estado ativo na sidebar
    document.querySelectorAll('.vid-item-row').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // atualiza overlay de contexto
    elTitle.textContent = video.title;
    elDesc.textContent = video.desc;

    // destrói o player anterior, se existir
    if (player && typeof player.destroy === 'function') {
      player.destroy();
      player = null;
    }

    if (hasRealId(video)) {
      if (loadPlayer) {
        elPlaceholder.style.display = 'flex';
        if (apiReady) {
          createPlayer(video.id);
        } else {
          pendingVideoId = video.id;
          loadYouTubeApi();
        }
      } else {
        // Estado leve: poster estático em vez do player pesado.
        // Usado só na carga inicial, antes da secção entrar no
        // viewport — ver setupLazyLoad().
        elPlaceholder.style.display = 'none';
        elFrameWrap.style.display = 'block';
        elFrameWrap.classList.remove('is-playing', 'has-player');
        elFrameWrap.innerHTML =
          `<img class="vid-poster" src="${buildPosterUrl(video.id)}" alt="" loading="lazy">`;
      }
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
    elTitle       = document.getElementById('vid-now-title');
    elDesc        = document.getElementById('vid-now-desc');
    elCountdown   = document.getElementById('vid-countdown');
    elAutonext    = document.getElementById('vid-autonext');
    elSidebar     = document.getElementById('vid-sidebar');
    elToggle      = document.getElementById('vid-toggle');
    elMainArea    = document.getElementById('vid-main');

    elMainArea.addEventListener('mouseenter', pause);
    elMainArea.addEventListener('mouseleave', resume);

    elToggle.addEventListener('click', toggleSidebar);

    // Estado inicial leve: mostra o título/descrição do primeiro
    // vídeo e um poster estático (thumbnail), sem carregar nada
    // pesado do YouTube ainda. select(0) com loadPlayer=false só
    // atualiza a UI textual e a barra de progresso continua
    // parada — o player real só nasce quando a secção entra no
    // viewport (ver setupLazyLoad abaixo).
    select(0, { loadPlayer: false });
    setupLazyLoad();
  }

  /** Lazy-load real: só cria o primeiro player pesado da IFrame
   *  API quando a secção #s5 entra no viewport. Em ecrãs onde a
   *  pessoa nunca chega lá (sai antes, ou no modo kiosk muda de
   *  direção), o player do YouTube nunca chega a carregar. */
  function setupLazyLoad() {
    const section = document.getElementById('s5');
    if (!section || !('IntersectionObserver' in window)) {
      // sem suporte a IntersectionObserver — carrega de imediato
      // como fallback, em vez de nunca mostrar vídeo nenhum.
      select(currentIndex, { loadPlayer: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          select(currentIndex, { loadPlayer: true });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(section);
  }

  // API pública — selectVid() é chamado inline pelos botões no HTML
  return { init, select, toggleSidebar };
})();

// Exposta globalmente para os onclick="" inline no HTML
function selectVid(index) {
  VideoGallery.select(index);
}
