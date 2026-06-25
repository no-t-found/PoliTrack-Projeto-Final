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
    id: 'VIDEO_ID_01',
    cat: 'Descoberta',
    title: 'Home Page',
    desc: 'Feed principal de iniciativas legislativas recentes — ponto de entrada da app e acesso rápido a filtros e pesquisa.'
  },
  {
    id: '19FyTLUHRH8',
    cat: 'Descoberta',
    title: 'Temas',
    desc: 'Navegação por categoria CAP — chip no card ou via filtros — para explorar iniciativas por área temática.'
  },
  {
    id: 'VIDEO_ID_03',
    cat: 'Pesquisa',
    title: 'Busca semântica',
    desc: 'Pesquisa por texto livre com motor semântico: resultados incluem iniciativas relacionadas por significado, não só por palavra exata.'
  },
  {
    id: 'VIDEO_ID_04',
    cat: 'Pesquisa',
    title: 'Filtros subtrativos',
    desc: 'Cinco dimensões cumulativas — Legislatura, Tema CAP, Proponente, Resultado e Tipo. Cada seleção afina e condiciona o seguinte.'
  },
  {
    id: 'VIDEO_ID_05',
    cat: 'Partidos',
    title: 'Por grupo parlamentar',
    desc: 'Filtro de proponente na pesquisa — mostra todas as iniciativas de um grupo parlamentar específico.'
  },
  {
    id: 'VIDEO_ID_06',
    cat: 'Partidos',
    title: 'Por página de partido',
    desc: 'Página de partido com iniciativas recentes, histórico de votações e lista de deputados eleitos.'
  },
  {
    id: 'VIDEO_ID_07',
    cat: 'Detalhe',
    title: 'Iniciativa',
    desc: 'Card expandido — votos por partido, autores, datas, estado atual e timeline do processo legislativo.'
  },
  {
    id: 'VIDEO_ID_08',
    cat: 'Pessoal',
    title: 'Perfil',
    desc: 'Página pessoal — preferências, temas seguidos e histórico de iniciativas consultadas.'
  },
  {
    id: 'VIDEO_ID_09',
    cat: 'Sistema de Design',
    title: 'Identidade visual',
    desc: 'Paleta de cor, tipografia — PP Neue Machina, Power Grotesk e Neue Haas Grotesk — tokens e componentes iOS.'
  },
  {
    id: 'VIDEO_ID_10',
    cat: 'Sistema de Design',
    title: 'Ícones & Proponentes',
    desc: 'Sistema de 18 ícones para proponentes parlamentares — grelha consistente, adaptados ao contexto da app.'
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
  idleTimeoutMs: 20000,

  /** Tempo entre cada avanço de secção no modo kiosk, em ms */
  kioskIntervalMs: 10000,
};
