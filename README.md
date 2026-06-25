# PoliTrack — Website de Exposição

Site de apresentação para a exposição de finalistas do projeto PoliTrack.

## Estrutura da pasta

```
politrack/
├── index.html              ← estrutura de todas as secções
├── css/
│   ├── 01-tokens.css        ← cores, fontes, escala — MUDA AQUI as cores globais
│   ├── 02-base.css          ← reset e estrutura do scroll
│   ├── 03-components.css    ← peças reutilizadas (botão início, separadores, footer)
│   ├── 04-section-capa.css
│   ├── 05-section-enquadramento.css
│   ├── 06-section-manifesto.css
│   ├── 08-section-videos.css
│   ├── 09-section-download.css
│   └── 10-section-creditos.css
├── js/
│   ├── data.js               ← conteúdo dos vídeos — MUDA AQUI os textos e IDs
│   ├── navigation.js          ← lógica de scroll entre secções e modo kiosk
│   ├── videos.js               ← lógica da galeria de vídeos (autoplay, seleção)
│   └── app.js                   ← arranca tudo
└── assets/
    └── fonts/                    ← ficheiros de fontes (.otf, .ttf)
```

> Nota: a secção de "Problemática" foi removida. O site tem agora 6 secções:
> Capa → Enquadramento → Manifesto ("O que é") → Demonstração → Download → Créditos.
> Os ficheiros CSS mantêm a numeração original (saltando o `07`) para que o
> histórico de nomes continue a corresponder aos commits/conversas anteriores.

## Responsividade

O site adapta-se a três faixas de ecrã:

- **Desktop grande (>1024px)** — layout fiel ao Figma, escalado proporcionalmente
  via `clamp(0.04vw, 0.05208vw, 0.075vw)`. O `clamp()` trava o crescimento em
  monitores muito grandes (4K, ecrãs de exposição) e o encolhimento em ecrãs
  pequenos de laptop, para o texto nunca ficar gigante nem ilegível.
- **Tablet (≤1024px)** — cada secção tem uma media query própria no fim do
  respetivo ficheiro CSS que reestrutura layouts de duas colunas em colunas
  empilhadas (ex: capa passa o iPhone para debaixo do texto; vídeos passa a
  sidebar para uma faixa horizontal por cima do player).
- **Mobile (≤480px)** — ajustes adicionais de tamanho de fonte e espaçamento
  dentro das mesmas media queries.

Para ajustar o comportamento em mobile de uma secção específica, abre o
ficheiro CSS dessa secção e edita o bloco `@media (max-width: 1024px)` ou
`@media (max-width: 480px)` no final do ficheiro.

## Como editar coisas comuns

### Mudar o texto/ID de um vídeo
Abre `js/data.js`. Cada vídeo é um objeto:

```js
{
  id: 'VIDEO_ID_01',          // substitui pelo ID real do YouTube
  cat: 'Descoberta',          // categoria na sidebar
  title: 'Home Page',         // título mostrado
  desc: 'Feed principal...'   // frase de contexto no overlay
}
```

O **ID do YouTube** são os 11 caracteres depois de `?v=` no URL do vídeo
(ex: `youtube.com/watch?v=dQw4w9WgXcQ` → ID é `dQw4w9WgXcQ`).

Se mudares a ordem ou adicionares vídeos no `data.js`, também tens de
atualizar a sidebar correspondente em `index.html` (botões `<button class="vid-item-row">`)
para que os `onclick="selectVid(N)"` e o número de barras de progresso (`vp-N`) coincidam.

### Mudar uma cor em todo o site
Abre `css/01-tokens.css`. As variáveis `--bg`, `--accent`, `--primary`, etc.
propagam-se automaticamente a todas as secções que as usam.

### Mudar o estilo de uma secção específica
Cada secção tem o seu próprio ficheiro CSS (`04` a `10`), nomeado pela
ordem em que aparece no site. Edita só o ficheiro da secção que queres mudar
— as outras não são afetadas.

### Mudar o tempo de cada vídeo no autoplay
Abre `js/data.js`, no objeto `CONFIG`:
```js
videoDurationSec: 15,   // segundos por vídeo
```

### Mudar quando o modo "exposição" (kiosk) começa
Também em `CONFIG`, no mesmo ficheiro:
```js
idleTimeoutMs: 20000,     // ms de inatividade antes de começar
kioskIntervalMs: 10000,   // ms entre cada avanço de secção
```

## Sobre as imagens do Figma

A maioria das imagens já foi trazida para `assets/images/` (logo da
faculdade, telefone com o ícone do PoliTrack, hero da app, badges das
lojas, QR codes reais, e todas as 5 barras de cor). Já não dependem do
Figma e não vão expirar.

**Ficam apenas 5 imagens** ainda a apontar para URLs temporários do
Figma (`figma.com/api/mcp/asset/...`), que expiram cerca de 7 dias
depois de gerados:

| Onde aparece | O que é |
|---|---|
| Capa — fundo da secção | imagem de fundo gradiente teal |
| Capa e Créditos — ícone do logótipo | o símbolo (templo) do PoliTrack |
| Capa e Créditos — wordmark | a palavra "PoliTrack" em tipografia |

Antes da exposição:

1. Abre o frame da capa no Figma (`520-11820`) → seleciona cada elemento
   (fundo, ícone do logo, wordmark) → Export → PNG a 2x
2. Guarda os ficheiros em `assets/images/` com nomes claros, ex:
   `logo-icon.png`, `logo-wordmark.png`, `capa-bg.png`
3. Em `index.html`, procura por `figma.com/api/mcp/asset` (Ctrl+F) e
   substitui cada `src="https://www.figma.com/api/mcp/asset/..."` pelo
   caminho local correspondente, ex: `src="assets/images/logo-icon.png"`

Os QR codes da secção de Download e da secção de Créditos já são os
PNGs reais que forneceste — não precisas de tocar nesses.

## Sistema de escala

O site usa uma variável `--u` (definida em `01-tokens.css`) que faz tudo
escalar proporcionalmente com a largura da janela, mantendo as proporções
exatas dos frames do Figma (que são todos 1920×1080px).

`calc(92 * var(--u))` significa "92px no frame original do Figma" — o
browser converte isso automaticamente para o tamanho certo em qualquer
écran. Não precisas de tocar nisto a não ser que estejas a reconstruir
uma secção a partir de um novo frame Figma.

## Navegação do site (para referência)

- **Scroll / setas ↑↓**: navega entre as 6 secções
- **Botão "Início"**: volta à capa (visível a partir da 2ª secção)
- **Dots à direita**: clicáveis, saltam para qualquer secção
- **Botão de seta na sidebar de vídeos**: oculta/mostra a lista —
  nunca desaparece por completo, fica sempre uma faixa fina clicável
- **Modo exposição**: após 20s sem interação, avança automaticamente
  pelas secções a cada 10s — qualquer interação (rato, scroll, teclado)
  cancela e reinicia o temporizador
