/* ════════════════════════════════════════════════════════════
   DADOS DO SITE
   Edita este ficheiro para mudar conteúdo sem tocar na lógica.
═══════════════════════════════════════════════════════════════ */

/**
 * Lista de vídeos da secção de demonstração.
 *
 * id    → ID do vídeo no YouTube (os 11 caracteres depois de "?v=" no URL).
 *         Enquanto não tiveres o vídeo, deixa "VIDEO_ID_XX" — a placeholder
 *         aparece automaticamente.
 * cat   → categoria mostrada na sidebar (agrupa vídeos relacionados)
 * title → título do vídeo, mostrado na sidebar e no overlay
 * desc  → frase de contexto mostrada no overlay durante a reprodução
 */
const VIDEOS = [
  {
    id: 'FMxj9qku-XA',
    cat: 'Descoberta',
    title: 'Navegação',
    desc: 'O ecrã inicial agrega as iniciativas legislativas mais recentes e serve de ponto de entrada para filtros e pesquisa.'
  },
  {
    id: '19FyTLUHRH8',
    cat: 'Descoberta',
    title: 'Temas',
    desc: 'As iniciativas são organizadas por categorias temáticas CAP, acessíveis por etiqueta no card ou através dos filtros, que permitem explorar o arquivo legislativo por área '
  },
  {
    id: 'SIRFGLYjfTY',
    cat: 'Pesquisa',
    title: 'Busca semântica',
    desc: 'Pesquisa por linguagem natural: o sistema infere intenção e agrupa resultados por proximidade semântica.'
  },
  {
    id: '1A3uUWz-Bv4',
    cat: 'Pesquisa',
    title: 'Filtros subtrativos',
    desc: 'Um sistema de afunilamento progressivo: cada filtro aplicado reduz e refina o universo de resultados disponíveis.'
  },
  {
    id: 'nqF6HKroBgw',
    cat: 'Partidos',
    title: 'Por grupo parlamentar',
    desc: 'Filtro por proponente: a pesquisa devolve todas as iniciativas associadas a um grupo parlamentar específico.'
  },
  {
    id: 'wSPsm8RnKSo',
    cat: 'Partidos',
    title: 'Por página de partido',
    desc: 'Uma entrada direta no perfil político de um partido: o que propõe, o histórico de como vota e quem o representa na Assembleia.'
  },
  {
    id: 'IZQEd1NjTH8',
    cat: 'Pessoal',
    title: 'Perfil',
    desc: 'Espaço pessoal onde o utilizador guarda iniciativas, temas que o agradam e o histórico de iniciativas interagidas.'
  },
  {
    id: 'tgmUMnCs2wA',
    cat: 'Sistema de Design',
    title: 'Identidade visual',
    desc: 'Define a linguagem visual da aplicação: variações de logótipos, escolha tipográfica e tokens de cor que garantem coerência entre ecrãs.'
  },
  {
    id: 'B-2S-Q3gu78',
    cat: 'Sistema de Design',
    title: 'Ícones & Cores',
    desc: 'Um sistema de ícones desenhados para representar os proponentes parlamentares, o boletim de voto e as cores associadas.'
  },
];

/**
 * Configuração geral do comportamento do site.
 */
const CONFIG = {
  /** Duração de cada vídeo no autoplay, em segundos */
  videoDurationSec: 15,

  /** Número total de secções (para o ciclo do modo kiosk) */
  totalSections: 6,

  /** Tempo de inatividade antes de o modo kiosk começar, em ms */
  idleTimeoutMs: 30000,

  /** Tempo entre cada avanço de secção no modo kiosk, em ms.
     Mais curto que o idleTimeoutMs — o primeiro avanço espera
     30s de inatividade, mas depois disso cada secção fica
     menos tempo, para o ciclo de exposição passar mais rápido. */
  kioskIntervalMs: 15000,

  /** Índice da secção de vídeos (Demonstração) — o modo kiosk
   *  geral (avanço de secção) não se aplica aqui; em vez disso,
   *  cada vídeo da galeria reproduz-se videoLoopsBeforeAdvance
   *  vezes antes de avançar para o vídeo seguinte. */
  videoSectionIndex: 3,

  /** Quantas vezes cada vídeo dá a volta completa antes de
   *  avançar automaticamente para o vídeo seguinte na galeria. */
  videoLoopsBeforeAdvance: 1,
};
