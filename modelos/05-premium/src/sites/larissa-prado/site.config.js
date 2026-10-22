/**
 * Modelo 05 · Premium — demonstração: Larissa Prado
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Para criar um novo cliente com este modelo, duplique esta pasta, edite este
 * arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * TEXTOS COM DESTAQUE: em `bio` e `description`, trechos entre **asteriscos**
 * aparecem em negrito.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que nome,
 * produtos, números e fotos são ilustrativos. Desligue apenas com dados reais.
 */

/**
 * Foto do Unsplash recortada pelo servidor de imagens com `srcset`.
 * Para fotos do cliente, use `{ src: '/media/arquivo.webp', alt, width, height }`.
 */
const unsplash = (id, alt, { ratio = 4 / 5, focus = 'faces' } = {}) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${focus}&w=${w}&h=${Math.round(w / ratio)}&q=78`;
  return {
    src: url(800),
    srcset: [400, 800, 1200, 1600].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width: 800,
    height: Math.round(800 / ratio),
  };
};

export default {
  id: 'larissa-prado',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Larissa Prado · Estrategista digital',
    description:
      'Larissa Prado — estrategista digital. Produtos e métodos que transformam design, conteúdo e IA em estrutura de vendas no Instagram.',
    themeColor: '#f6f1ea',
    // Domínio final (ex.: 'https://larissaprado.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: 'https://images.unsplash.com/photo-1551187320-7c709ab98985?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400;1,6..96,500&family=Montserrat:wght@300;400;500;600&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    greeting: 'Muito prazer, sou',
    name: 'Larissa Prado',
    role: 'Estrategista digital',
    bio: 'Sou **estrategista digital** e criadora de sistemas que transformam **design, conteúdo e IA em estrutura de vendas no Instagram.**',
    legalName: 'Larissa Prado',
  },

  hero: {
    photo: unsplash('photo-1551187320-7c709ab98985', 'Larissa Prado sentada em uma cadeira dourada, de blazer claro', { ratio: 3 / 4 }),
  },

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Larissa! Vim pelo seu bio site e quero saber mais sobre os seus produtos.',
    },
    booking: { url: '', message: '' },
    instagram: { handle: '' }, // Ex.: 'larissaprado'
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  // Vitrine de produtos. `side`: lado da imagem no celular ('left' ou 'right').
  products: [
    {
      id: 'plano-produtora',
      title: 'Plano Você Produtora',
      description: 'Tenha acesso aos meus produtos validados e venda como seu.',
      cta: 'Tenha acesso clicando aqui',
      side: 'left',
      image: unsplash('photo-1655156875398-d11323b4f5de', 'Notebook e celular sobre uma mesa branca', { ratio: 4 / 3, focus: 'center' }),
      action: { type: 'url', href: '', label: 'Plano Você Produtora' },
    },
    {
      id: 'pack-posts',
      title: 'Pack Posts de Sucesso',
      description: '**+200 templates** 100% editáveis, sem cara de Canva, para elevar a percepção de valor do seu perfil.',
      cta: 'Tenha acesso clicando aqui',
      side: 'right',
      image: unsplash('photo-1759156771079-6fef5b8d66c9', 'Celular e notebook sobre a mesa de trabalho', { ratio: 3 / 4, focus: 'center' }),
      action: { type: 'url', href: '', label: 'Pack Posts de Sucesso' },
    },
    {
      id: 'imagem-estrategica',
      title: 'Método Imagem Estratégica',
      description: 'Crie ensaios profissionais sem gastar nada. Usando apenas **IA gratuita + seu celular.**',
      cta: 'Tenha acesso clicando aqui',
      side: 'left',
      image: unsplash('photo-1781888683045-d8912c04671b', 'Retrato profissional de uma mulher de blazer claro', { ratio: 4 / 5 }),
      action: { type: 'url', href: '', label: 'Método Imagem Estratégica' },
    },
  ],

  footer: {
    links: ['instagram', 'whatsapp', 'website'],
    demoNote: 'Modelo demonstrativo: nome, produtos, números e fotos são ilustrativos.',
  },
};
