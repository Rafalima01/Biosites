// Monta o HTML da página a partir de src/content.js (pré-renderizado pelo Vite: a página chega pronta).
// Uma página, dois jeitos: no celular é um bio site (perfil + atalhos); no tablet e no computador, um site
// completo (menu + abertura). As classes .so-celular e .so-tela escolhem o que aparece em cada um.
import { agencia, meta, segmentos, modelos, clientes, comparacao, passos, incluso, agenda, duvidas, zap } from './content.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ICONES = {
  seta: '<path d="M7 17 17 7M9 7h8v8"/>',
  baixo: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.6.3-1.6.5-2.9-.1a9.5 9.5 0 0 1-4.6-4.6c-.6-1.3-.4-2.3-.1-2.9z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  sim: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  nao: '<path d="M7 7l10 10M17 7 7 17"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
};
const icone = (nome, tam = 18) =>
  `<svg class="ic" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome]}</svg>`;

const externo = (url) => `href="${esc(url)}" target="_blank" rel="noopener noreferrer"`;
const marca = (classe = '') => `<img class="marca__simbolo ${classe}" src="/media/vertex-mark.svg" alt="" width="40" height="26">`;
const rotulo = (n, texto) => `<p class="rotulo"><span>${esc(n)}</span>${esc(texto)}</p>`;

/** Moldura de celular com o print do site (o print pode rolar sozinho: classe fone--rola). */
const Fone = (img, alt, classe = '', carregar = 'lazy') =>
  `<span class="fone ${classe}"><span class="fone__tela"><img src="/media/modelos/${esc(img)}.webp" alt="${esc(alt)}" loading="${carregar}" decoding="async"></span></span>`;

const Nav = () => `<header class="nav so-tela">
    <a class="nav__marca" href="#topo" aria-label="${esc(agencia.nome)}, início">${marca()}<span>Vertex<b>Labs</b></span></a>
    <nav aria-label="Seções"><ul class="nav__links">
      <li><a href="#modelos">Modelos</a></li><li><a href="#diferenca">Diferença</a></li><li><a href="#agenda">Agenda</a></li>
      <li><a href="#como">Como funciona</a></li><li><a href="#clientes">Clientes</a></li><li><a href="#duvidas">Dúvidas</a></li>
    </ul></nav>
    <a class="botao botao--escuro" ${externo(agencia.orcamento)}>Pedir orçamento ${icone('seta', 16)}</a>
  </header>`;

/** Celular: perfil de bio site com os atalhos numerados. */
const Perfil = () => {
  const atalhos = [
    ['#modelos', 'Modelos prontos', `${modelos.length} demonstrações no ar`],
    ['#clientes', 'Clientes no ar', 'Sites reais, de quem já confiou'],
    ['#agenda', 'Agenda online', 'Horários livres e sinal no Pix'],
    ['#como', 'Como funciona', 'Do primeiro oi ao link na bio'],
    ['#duvidas', 'Dúvidas', 'Domínio, ajustes e valores'],
  ];
  return `<section class="perfil so-celular" aria-label="Apresentação">
    <div class="perfil__simbolo">${marca()}</div>
    <h1 class="perfil__nome">${esc(agencia.nome)}</h1>
    <p class="perfil__handle">${esc(agencia.handle)}</p>
    <p class="perfil__bio">${esc(agencia.bio)}</p>
    <div class="perfil__acoes">
      <a class="botao botao--marca botao--cheio" ${externo(agencia.orcamento)}>${icone('whatsapp', 20)} Quero meu bio site</a>
      <a class="perfil__social" ${externo(agencia.instagram)} aria-label="Instagram da Vertex Labs (abre em nova aba)">${icone('instagram', 22)}</a>
    </div>
    <ol class="atalhos">${atalhos
      .map(([href, titulo, sub], i) => {
        // O primeiro atalho mostra miniaturas de três modelos no lugar da seta
        const fim = i
          ? icone('seta', 18)
          : `<span class="atalhos__minis" aria-hidden="true">${['08-glam', '12-psicologia', '13-imobiliaria'].map((id) => `<img src="/media/modelos/${id}.webp" alt="" width="40" height="86" loading="lazy">`).join('')}</span>`;
        return `<li><a href="${href}"><span class="atalhos__n">0${i + 1}</span><span><strong>${esc(titulo)}</strong><small>${esc(sub)}</small></span>${fim}</a></li>`;
      })
      .join('')}</ol>
  </section>`;
};

/** Tela: abertura com a frase forte, os botões e dois celulares rolando sites de verdade. */
const Abertura = () => `<section class="abertura so-tela" aria-labelledby="abertura-titulo">
    <div class="abertura__linhas" aria-hidden="true"><i></i><i></i><i></i><b>+</b><b>+</b></div>
    <div class="abertura__texto">
      <p class="rotulo rotulo--marca">— Bio sites sob medida</p>
      <h1 class="abertura__titulo" id="abertura-titulo"><span>O link da bio</span> <span>não precisa ser</span> <em>só uma lista.</em></h1>
      <p class="abertura__sub">Criamos bio sites com a cara do seu negócio: serviços, agenda, portfólio e WhatsApp num endereço só, prontos para quem chega pelo Instagram.</p>
      <div class="abertura__acoes">
        <a class="botao botao--marca" ${externo(agencia.orcamento)}>${icone('whatsapp', 20)} Quero meu bio site</a>
        <a class="botao botao--linha" href="#modelos">Ver os ${modelos.length} modelos ${icone('baixo', 16)}</a>
      </div>
      <ul class="abertura__fatos"><li><b>${modelos.length}</b> modelos no ar</li><li><b>${segmentos.length}</b> segmentos</li><li><b>${clientes.length}</b> clientes publicados</li></ul>
    </div>
    <div class="abertura__fones" aria-hidden="true">
      ${Fone('12-psicologia-longo', '', 'fone--rola fone--frente', 'eager')}
      ${Fone('jailane-ferreira-longo', '', 'fone--rola fone--tras', 'eager')}
      <span class="abertura__selo">Role e veja:<br>sites reais</span>
    </div>
  </section>`;

const Faixa = () => {
  const itens = ['Nail designer', 'Barbearia', 'Psicóloga', 'Corretor de imóveis', 'Delivery', 'Mentora', 'Casa de temporada', 'Sobrancelhas'];
  const linha = itens.map((t) => `<span>${esc(t)}</span><b aria-hidden="true">✕</b>`).join('');
  return `<div class="faixa" aria-label="Segmentos atendidos"><div class="faixa__trilho">${linha}${linha}</div></div>`;
};

const Vitrine = () => {
  const filtros = ['Todos', ...segmentos]
    .map((s, i) => `<button type="button" class="filtro" data-filtro="${esc(i ? s : '*')}" aria-pressed="${i ? 'false' : 'true'}">${esc(s)}</button>`)
    .join('');
  const cards = modelos
    .map(
      (m) => `<li class="modelo" data-segmento="${esc(m.segmento)}">
        <a class="modelo__link" ${externo(m.url)} aria-label="Abrir a demonstração do modelo ${esc(m.n)} ${esc(m.nome)} (nova aba)">
          ${Fone(m.id, `Modelo ${m.n} · ${m.nome}`)}
          <span class="modelo__info">
            <span class="modelo__topo"><span class="modelo__n">${esc(m.n)}</span><span class="modelo__seg">${esc(m.segmento)}${m.agenda ? ' · com agenda' : ''}</span></span>
            <span class="modelo__nome">${esc(m.nome)}</span>
            <span class="modelo__marca">${esc(m.marca)}</span>
            <span class="modelo__frase">${esc(m.frase)}</span>
            <span class="modelo__ir">Ver funcionando ${icone('seta', 15)}</span>
          </span>
        </a>
      </li>`,
    )
    .join('');
  // Card final que fecha a grade (4 colunas no computador, 3 no tablet): ocupa o que sobra da última fileira.
  const sobra = (cols) => cols - (modelos.length % cols || cols) || cols;
  const proximo = `<li class="modelo modelo--seu" data-segmento="*" style="--sobra-4:${sobra(4)};--sobra-3:${sobra(3)}">
        <div class="seu">
          <p class="rotulo rotulo--marca">— Modelo ${String(modelos.length + 1).padStart(2, '0')}</p>
          <p class="seu__titulo">O próximo <em>pode ser o seu.</em></p>
          <p class="seu__texto">Não achou o seu segmento? Partimos de uma referência que você goste e criamos do zero, com a sua marca.</p>
          <a class="botao botao--marca" ${externo(zap('Olá, Vertex! Quero um bio site do zero para o meu negócio.'))}>${icone('whatsapp', 20)} Quero o meu</a>
        </div>
      </li>`;
  return `<section class="vitrine secao secao--escura" id="modelos" aria-labelledby="modelos-titulo">
    <div class="secao__cabeca">
      ${rotulo('01', 'Modelos prontos')}
      <h2 class="titulo" id="modelos-titulo">${modelos.length} pontos de partida. <em>Nenhum igual ao seu.</em></h2>
      <p class="secao__sub">Cada modelo é uma demonstração no ar, com marca fictícia. O seu sai com as suas fotos, cores e serviços.</p>
    </div>
    <div class="filtros" role="group" aria-label="Filtrar por segmento">${filtros}</div>
    <ul class="modelos">${cards}${proximo}</ul>
  </section>`;
};

const Comparacao = () => `<section class="comparacao secao" id="diferenca" aria-labelledby="diferenca-titulo">
    <div class="secao__cabeca">
      ${rotulo('02', 'A diferença')}
      <h2 class="titulo" id="diferenca-titulo">Lista de links todo mundo tem. <em>Bio site é outra coisa.</em></h2>
    </div>
    <div class="tabela" role="table" aria-label="Lista de links comum comparada ao bio site">
      <div class="tabela__linha tabela__linha--cabeca" role="row"><span role="columnheader"></span><span role="columnheader">Lista de links</span><span role="columnheader">Bio site Vertex</span></div>
      ${comparacao
        .map(
          ([item, lista, bio]) => `<div class="tabela__linha" role="row"><span class="tabela__item" role="rowheader">${esc(item)}</span><span class="tabela__nao" role="cell">${icone('nao', 16)}${esc(lista)}</span><span class="tabela__sim" role="cell">${icone('sim', 16)}${esc(bio)}</span></div>`,
        )
        .join('')}
    </div>
  </section>`;

const Agenda = () => `<section class="agenda secao" id="agenda" aria-labelledby="agenda-titulo">
    <div class="agenda__fone">${Fone('11-barbearia-agenda', 'Modelo 11, barbearia com agenda online')}</div>
    <div class="agenda__texto">
      ${rotulo('03', 'Agenda online')}
      <h2 class="titulo" id="agenda-titulo">${esc(agenda.titulo)}</h2>
      <p class="secao__sub">${esc(agenda.texto)}</p>
      <ul class="lista-check">${agenda.itens.map((t) => `<li>${icone('sim', 18)}${esc(t)}</li>`).join('')}</ul>
      <a class="botao botao--linha" ${externo(agenda.demo)}>Testar a agenda no modelo 11 ${icone('seta', 16)}</a>
    </div>
  </section>`;

const Passos = () => `<section class="passos secao" id="como" aria-labelledby="como-titulo">
    <div class="secao__cabeca">
      ${rotulo('04', 'Como funciona')}
      <h2 class="titulo" id="como-titulo">Do primeiro oi <em>ao link na bio.</em></h2>
    </div>
    <ol class="passos__lista">${passos.map((p) => `<li><span class="passos__n">${esc(p.n)}</span><strong>${esc(p.titulo)}</strong><p>${esc(p.texto)}</p></li>`).join('')}</ol>
  </section>`;

const Clientes = () => `<section class="clientes secao secao--escura" id="clientes" aria-labelledby="clientes-titulo">
    <div class="secao__cabeca">
      ${rotulo('05', 'Clientes no ar')}
      <h2 class="titulo" id="clientes-titulo">Não é maquete. <em>É gente vendendo.</em></h2>
    </div>
    <ul class="clientes__lista">${clientes
      .map(
        (c) => `<li><a class="cliente" ${externo(c.url)} aria-label="Abrir o site de ${esc(c.nome)} (nova aba)">
          ${Fone(c.id, `Site de ${c.nome}`)}
          <span class="cliente__info"><span class="cliente__papel">${esc(c.papel)}</span><span class="cliente__nome">${esc(c.nome)}</span><span class="cliente__texto">${esc(c.texto)}</span><span class="modelo__ir">Abrir o site ${icone('seta', 15)}</span></span>
        </a></li>`,
      )
      .join('')}</ul>
  </section>`;

const Incluso = () => `<section class="incluso secao" aria-labelledby="incluso-titulo">
    <div class="secao__cabeca">
      ${rotulo('06', 'O que vem junto')}
      <h2 class="titulo" id="incluso-titulo">Tudo o que o link da bio <em>deveria fazer.</em></h2>
    </div>
    <ul class="incluso__lista">${incluso.map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(t)}</li>`).join('')}</ul>
  </section>`;

const Duvidas = () => `<section class="duvidas secao" id="duvidas" aria-labelledby="duvidas-titulo">
    <div class="secao__cabeca">
      ${rotulo('07', 'Dúvidas')}
      <h2 class="titulo" id="duvidas-titulo">Perguntas que todo mundo faz.</h2>
    </div>
    <div class="duvidas__lista">${duvidas.map(([p, r]) => `<details><summary>${esc(p)}${icone('mais', 18)}</summary><p>${esc(r)}</p></details>`).join('')}</div>
  </section>`;

const Final = () => `<section class="final" aria-labelledby="final-titulo">
    <div class="abertura__linhas" aria-hidden="true"><i></i><i></i><b>+</b></div>
    <p class="rotulo rotulo--marca">— ${esc(agencia.nome)}</p>
    <h2 class="final__titulo" id="final-titulo"><span>Construímos o que</span> <em>ainda não existe.</em></h2>
    <p class="final__sub">Inclusive o seu bio site. Conte o que você vende e a gente mostra como ele fica.</p>
    <a class="botao botao--marca botao--grande" ${externo(agencia.orcamento)}>${icone('whatsapp', 22)} Quero meu bio site</a>
  </section>`;

const Rodape = () => `<footer class="rodape">
    <a class="nav__marca" href="#topo">${marca()}<span>Vertex<b>Labs</b></span></a>
    <p>${esc(agencia.slogan)}</p>
    <div class="rodape__links"><a ${externo(agencia.instagram)}>${icone('instagram', 18)} ${esc(agencia.handle)}</a><a ${externo(agencia.orcamento)}>${icone('whatsapp', 18)} WhatsApp</a></div>
    <small>© <span data-ano>2026</span> ${esc(agencia.nome)}. Modelos com marcas fictícias, para demonstração.</small>
  </footer>`;

export function renderPage() {
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="theme-color" content="#0b0b0c">`,
    `<link rel="canonical" href="${esc(agencia.site)}/">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:image" content="${esc(agencia.site + meta.ogImage)}">`,
    `<meta property="og:type" content="website">`,
    `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">`,
    `<script>document.documentElement.classList.add('js')</script>`,
  ].join('\n    ');
  const body = `<a class="pular" href="#conteudo">Pular para o conteúdo</a>
  <div id="topo"></div>
  ${Nav()}
  <main id="conteudo">
    ${Perfil()}
    ${Abertura()}
    ${Faixa()}
    ${Vitrine()}
    ${Comparacao()}
    ${Agenda()}
    ${Passos()}
    ${Clientes()}
    ${Incluso()}
    ${Duvidas()}
    ${Final()}
  </main>
  ${Rodape()}
  <a class="flutuante so-celular" ${externo(agencia.orcamento)} aria-label="Pedir orçamento pelo WhatsApp (nova aba)">${icone('whatsapp', 26)}</a>`;
  return { head, body };
}
