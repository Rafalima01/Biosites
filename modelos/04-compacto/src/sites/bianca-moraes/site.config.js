/**
 * Modelo 04 · Compacto — demonstração: Bianca Moraes
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Para criar um novo cliente com este modelo, duplique esta pasta, edite este
 * arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que o nome,
 * os textos e as fotos são ilustrativos. Desligue apenas com dados reais.
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

const PHOTO = {
  studio: 'photo-1760895535234-2c39c57cf187',
  retrato: 'photo-1654765437407-a078b98f6b1b',
};

export default {
  id: 'bianca-moraes',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Bianca Moraes · Designer de sobrancelhas',
    description:
      'Bianca Moraes — designer de sobrancelhas. Um espaço preparado para proporcionar conforto, leveza e uma experiência acolhedora.',
    themeColor: '#5e2e1f',
    // Domínio final (ex.: 'https://biancamoraes.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: `https://images.unsplash.com/${PHOTO.retrato}?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78`,
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    name: 'Bianca Moraes',
    role: 'Designer de sobrancelhas',
    monogram: ['B', 'M'],
    description:
      'Nosso espaço foi preparado para proporcionar conforto, leveza e uma experiência acolhedora, onde cada cliente se sente ainda mais linda, confiante e bem cuidada.',
    legalName: 'Bianca Moraes',
  },

  cover: unsplash(PHOTO.studio, 'Bancada do studio com produtos de beleza e flores em tons claros', { ratio: 16 / 9, focus: 'center' }),
  portrait: unsplash(PHOTO.retrato, 'Bianca Moraes sorrindo', { ratio: 1 }),

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Bianca! Vim pelo seu bio site e gostaria de agendar um horário.',
    },
    booking: { url: '', message: 'Olá, Bianca! Gostaria de agendar um horário.' },
    instagram: { handle: '' }, // Ex.: 'biancamoraes.sobrancelhas'
    youtube: { url: '' },
    website: { url: '' },
    location: {
      address: '', // Ex.: 'Rua Exemplo, 123 - Bairro, Cidade - UF'
      mapsUrl: '',
    },
  },

  // Botões principais (2 colunas). Ações: channel, sheet (painel), section ou url.
  actions: [
    { label: 'WhatsApp', action: { type: 'channel', channel: 'whatsapp' } },
    { label: 'Serviços', action: { type: 'sheet', target: 'servicos' } },
    { label: 'Sobre', action: { type: 'sheet', target: 'sobre' } },
    { label: 'Endereço', action: { type: 'channel', channel: 'location' } },
  ],

  // Painéis que abrem sobre a página, mantendo o bio site em uma única tela.
  sheets: [
    {
      id: 'servicos',
      eyebrow: 'Atendimento',
      title: 'Serviços',
      items: [
        { title: 'Design de sobrancelhas', description: 'Desenho personalizado respeitando o formato do seu rosto.' },
        { title: 'Design com henna', description: 'Preenchimento com henna para um efeito mais marcado.' },
        { title: 'Brow lamination', description: 'Fios alinhados e disciplinados por mais tempo.' },
        { title: 'Epilação de buço', description: 'Acabamento delicado para complementar o atendimento.' },
      ],
      note: 'Lista demonstrativa — substitua pelos serviços reais.',
      cta: { label: 'Agendar horário', action: { type: 'channel', channel: 'booking' } },
    },
    {
      id: 'sobre',
      eyebrow: 'Prazer, Bianca',
      title: 'Sobre',
      paragraphs: [
        'Sou designer de sobrancelhas e acredito que pequenos detalhes fazem toda a diferença na forma como nos vemos.',
        'Cada atendimento começa com uma conversa para entender o seu estilo e chegar a um resultado natural, que valorize o que você já tem de mais bonito.',
      ],
      cta: { label: 'Falar no WhatsApp', action: { type: 'channel', channel: 'whatsapp' } },
    },
  ],

  // Barra de redes: o canal de `center` fica em destaque, elevado sobre a barra.
  dock: {
    left: ['youtube', 'location'],
    center: 'whatsapp',
    right: ['instagram', 'website'],
  },

  footer: {
    demoNote: 'Modelo demonstrativo: nome, textos e fotos são ilustrativos.',
  },
};
