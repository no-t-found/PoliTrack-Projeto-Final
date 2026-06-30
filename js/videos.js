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
  let qualityCheckTimer = null;
  let loopCount = 0;
  let videoDuration = null;
  let progressBarActive = false;

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

    /** Tenta forçar 1080p; se a melhor qualidade disponível for
     *  inferior (rede fraca), usa a mais alta que existir. */
    function enforceTopQuality(target) {
      const levels = target.getAvailableQualityLevels();
      if (levels.includes('hd1080')) {
        target.setPlaybackQuality('hd1080');
      } else if (levels.length > 0) {
        target.setPlaybackQuality(levels[0]); // já vem ordenado da melhor para a pior
      }
    }

    player = new YT.Player('yt-player-target', {
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        vq: 'hd1080',
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          // Força 1080p de forma explícita via API — mais
          // fiável do que o parâmetro de URL "vq" isolado.
          // Tenta de imediato e outra vez num instante depois,
          // porque a lista de qualidades disponíveis só fica
          // completa após o primeiro segundo de buffer.
          enforceTopQuality(e.target);
          setTimeout(() => enforceTopQuality(e.target), 1000);

          loopCount = 0;
          e.target.playVideo();
        },
        onStateChange: (e) => {
          // Estado 1 = a reproduzir de verdade. Só agora o
          // iframe se torna visível — sem flash de controlos.
          if (e.data === YT.PlayerState.PLAYING) {
            elPlaceholder.style.display = 'none';
            elFrameWrap.classList.add('is-playing');
            enforceTopQuality(e.target);

            // Duração real do vídeo — só fica disponível de
            // forma fiável depois do estado PLAYING (em onReady
            // o YouTube ainda não carregou os metadados, e
            // getDuration() devolve 0, o que desincronizava a
            // barra de progresso e fazia o vídeo avançar antes
            // ou depois do momento certo).
            const realDuration = e.target.getDuration();
            if (realDuration > 0) {
              videoDuration = realDuration;
            }
            startProgressBar();

            // Verificação periódica: o YouTube pode reduzir a
            // qualidade a meio da reprodução por largura de
            // banda — volta a forçar 1080p sempre que isso
            // acontecer, enquanto o vídeo estiver a correr.
            clearInterval(qualityCheckTimer);
            qualityCheckTimer = setInterval(() => {
              if (e.target.getPlayerState() === YT.PlayerState.PLAYING) {
                enforceTopQuality(e.target);
              }
            }, 4000);
          } else {
            clearInterval(qualityCheckTimer);
          }

          // Estado 0 = o vídeo chegou ao fim de verdade (sem o
          // parâmetro loop:1, que impedia este evento de disparar
          // e por isso travava o avanço automático por completo).
          // Conta as repetições e avança para o próximo item da
          // galeria ao atingir CONFIG.videoLoopsBeforeAdvance —
          // por defeito é 1, ou seja, avança logo no fim da
          // primeira reprodução. Se for >1, reinicia manualmente
          // o vídeo do início para as voltas extra.
          if (e.data === YT.PlayerState.ENDED) {
            loopCount++;
            if (loopCount >= CONFIG.videoLoopsBeforeAdvance) {
              select((currentIndex + 1) % VIDEOS.length);
            } else {
              e.target.seekTo(0);
              e.target.playVideo();
              progressBarActive = false;
              startProgressBar();
            }
          }
        },
        onPlaybackQualityChange: (e) => {
          enforceTopQuality(e.target);
        },
      },
    });
  }

  function buildPosterUrl(videoId) {
    // Thumbnail máxima disponível (1280×720 quando existe).
    // Se o YouTube não tiver esta versão, o browser recebe uma
    // imagem preta — mas para os vídeos já publicados é seguro.
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  function select(index, { loadPlayer = true } = {}) {
    const video = VIDEOS[index];
    currentIndex = index;
    loopCount = 0;
    videoDuration = null;
    progressBarActive = false;

    // atualiza estado ativo na sidebar
    document.querySelectorAll('.vid-item-row').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // atualiza overlay de contexto
    elTitle.textContent = video.title;
    elDesc.textContent = video.desc;

    // destrói o player anterior, se existir
    clearInterval(qualityCheckTimer);
    clearInterval(countdownTimer);
    if (player && typeof player.destroy === 'function') {
      player.destroy();
      player = null;
    }

    // reset visual das barras de progresso — o player real
    // (quando carregado) vai animar a sua própria barra via
    // startProgressBar(), chamado a partir de onStateChange.
    document.querySelectorAll('.vid-pf').forEach(el => {
      el.style.transition = 'none';
      el.style.width = '0%';
    });
    elCountdown.textContent = CONFIG.videoDurationSec;

    if (hasRealId(video)) {
      if (loadPlayer) {
        elPlaceholder.style.display = 'none';
        elFrameWrap.style.display = 'block';
        elFrameWrap.classList.remove('is-playing', 'has-player');
        elFrameWrap.innerHTML =
          `<img class="vid-poster" src="${buildPosterUrl(video.id)}" alt="" fetchpriority="high">`;
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
          `<img class="vid-poster" src="${buildPosterUrl(video.id)}" alt="" fetchpriority="high">`;
      }
    } else {
      // Vídeo ainda sem ID real associado (item por adicionar em
      // js/data.js). Mesmo assim nunca se mostra uma mensagem do
      // tipo "vídeo a adicionar" — isso dava a entender que o
      // site está incompleto. Em vez disso, mantém-se visível o
      // último frame/poster que já estava no ecrã, como se fosse
      // só uma pausa antes do conteúdo carregar.
      elPlaceholder.style.display = 'none';
    }
  }

  /** Anima a barra de progresso do item atual e a contagem
   *  decrescente "Próximo em Ns", sincronizadas com a duração
   *  real do vídeo (detetada em onReady) — não um valor fixo.
   *  Reinicia a cada loop, já que o vídeo recomeça do zero. */
  function startProgressBar() {
    // Evita reiniciar a barra/contagem se o vídeo já estava a
    // reproduzir e só houve um soluço momentâneo de buffering —
    // o YouTube pode disparar PLAYING mais de uma vez para o
    // mesmo vídeo, e reiniciar a barra cada vez dessincronizava
    // o tempo mostrado do tempo real restante.
    if (progressBarActive) return;
    progressBarActive = true;

    clearInterval(countdownTimer);

    const duration = videoDuration || CONFIG.videoDurationSec;
    countdown = Math.round(duration);
    elCountdown.textContent = countdown;

    const fill = document.getElementById(`vp-${currentIndex}`);
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        fill.style.transition = `width ${duration}s linear`;
        fill.style.width = '100%';
      });
    }

    countdownTimer = setInterval(() => {
      if (isPaused) return;
      countdown--;
      elCountdown.textContent = Math.max(countdown, 0);
      if (countdown <= 0) {
        clearInterval(countdownTimer);
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

  /** Quando o rato sai da sidebar, esta oculta-se automaticamente
   *  — não é preciso clicar no botão. Aplica-se sempre que a
   *  sidebar está aberta, seja porque a pessoa clicou no botão
   *  ou só passou o rato por cima enquanto estava colapsada. */
  function collapseOnMouseLeave() {
    if (!sidebarCollapsed) {
      sidebarCollapsed = true;
      elSidebar.classList.add('collapsed');
      elToggle.setAttribute('aria-expanded', 'false');
      elToggle.setAttribute('aria-label', 'Mostrar lista de vídeos');
    }
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
    elSidebar.addEventListener('mouseleave', collapseOnMouseLeave);

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
