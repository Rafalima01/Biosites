# Layout dos cards (técnicas que funcionaram)

## Proporção fiel ao print em qualquer largura: `cqw`

Card com `container-type: inline-size`; tudo dentro dele medido em `cqw` (1cqw = 1% da largura do card).
Meça no print a posição de cada elemento em % da largura do card e use direto.

```css
.card--x {
  width: 100%;              /* obrigatório: com aspect-ratio o grid NÃO estica a largura sozinho */
  min-height: auto;
  aspect-ratio: 2.47 / 1;   /* proporção do card no print */
  overflow: visible;        /* para o que sai da borda */
  container-type: inline-size;
}
.card--x .titulo { font-size: 5.2cqw; }
.card--x .apoio  { font-size: max(9px, 2.1cqw); }  /* piso legível no celular */
```

- Os filhos usam `cqw`; o próprio card não pode usar o seu `cqw`.
- **A coluna do grid pai precisa de `grid-template-columns: minmax(0, 1fr)`**, senão o conteúdo em `cqw`
  alarga a coluna e a página ganha rolagem lateral (aconteceu: cards de 372 px numa tela de 375).
- Texto que pode crescer: em vez de `top` fixo, empilhe título e texto num flex em coluna com
  `inset` e `justify-content: center`, deixando espaço para os elementos do canto.

## Elementos que saem pela borda do card

- Card com `overflow: visible`. O que deve ficar **recortado no raio** (faixa de fundo, mão, desenho de
  fundo) vai dentro de uma camada interna: `.card__fundo { position:absolute; inset:0; overflow:hidden;
  border-radius: inherit; }`.
- Dê `z-index` crescente aos cards de baixo quando o elemento sai para cima (selo, carinha, papel), para
  ficar por cima do card anterior; e um `gap` entre cards de ~22 px para respirar.
- Elementos decorativos: `position:absolute; pointer-events:none`, com `filter: drop-shadow(...)`.

## Imagens

- **`img { height: auto }` global.** Sem isso, `<img width height>` com largura no CSS fica esticada
  (bug que deixou todos os 3D compridos). Regras com `height:100%` específicas continuam valendo.
- Foto com fundo de estúdio cinza num card bege: `mask-image: linear-gradient(90deg, #000 58%, transparent)`
  na borda + `filter: sepia(.22)` funde melhor que `mix-blend-mode: multiply` (que escurece).
- Desenho em traço com cor do CSS: um único SVG preto usado como **máscara**
  (`mask: url(x.svg) center/contain no-repeat; background: <cor>`), reaproveitado em cores diferentes.
- Papel realista com texto: a imagem do papel (Blender) vai como `background: url() center/100% 100%`
  e o texto fica no HTML por cima (acessível e editável).

## Detalhes que o usuário notou

- Elemento cobrindo letras da frase grande: no print o cérebro fica **na frente** e cobre parte das letras;
  a frase continua legível porque o objeto é pequeno (~20cqw).
- Texto do papel encostando na borda de baixo no celular: encurte o texto ou reposicione o papel.
- Carinha do canto em cima do texto: deixe recuo à direita no bloco de texto.
