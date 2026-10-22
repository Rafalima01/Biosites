/**
 * Modelo 02 · Autoridade — demonstração: Agatha Rigazzi
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Para criar um novo cliente com este modelo, duplique esta pasta, edite este
 * arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que nomes,
 * números e depoimentos são ilustrativos. Desligue apenas com dados reais.
 */

/**
 * Foto do Unsplash recortada pelo servidor de imagens (foco no rosto) com `srcset`.
 * Para fotos do cliente, use `{ src: '/media/arquivo.webp', alt, width, height }`.
 */
const unsplash = (id, alt, { ratio = 4 / 5, focus = 'faces' } = {}) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${focus}&w=${w}&h=${Math.round(w / ratio)}&q=78`;
  return {
    src: url(800),
    srcset: [400, 800, 1200].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width: 800,
    height: Math.round(800 / ratio),
  };
};

const PHOTO = {
  pensativa: 'photo-1706565029882-6f25f1d9af65',
  retrato: 'photo-1706565029539-d09af5896340',
  sorrindo: 'photo-1706565029071-f8f70ce91e71',
};

export default {
  id: 'agatha-rigazzi',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Agatha Rigazzi · Mentora de negócios',
    description:
      'Agatha Rigazzi — mentoria, cursos e consultorias para mulheres que querem posicionar o próprio negócio com estratégia e identidade.',
    themeColor: '#efe8e1',
    // Domínio final (ex.: 'https://agatharigazzi.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: 'https://images.unsplash.com/photo-1706565029882-6f25f1d9af65?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    firstName: 'Agatha',
    lastName: 'Rigazzi',
    role: 'Mentora de negócios',
    tagline: 'Estratégia, posicionamento e presença digital para mulheres que querem crescer com identidade.',
    legalName: 'Agatha Rigazzi',
  },

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Agatha! Vim pelo seu bio site e fiquei com uma dúvida.',
    },
    booking: {
      url: '', // Opcional: link de agenda (Calendly etc.). Vazio = agendamento pelo WhatsApp.
      message: 'Olá, Agatha! Gostaria de agendar uma conversa.',
    },
    instagram: { handle: '' }, // Ex.: 'agatharigazzi'
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  hero: {
    photo: unsplash(PHOTO.pensativa, 'Agatha Rigazzi sorrindo, de blazer branco, com a mão apoiada no queixo', { ratio: 4 / 5 }),
    proof: {
      value: '+5.000',
      label: 'alunas no Brasil',
      avatars: [
        unsplash('photo-1697663426713-82f6bab7d84b', '', { ratio: 1 }),
        unsplash('photo-1759262310978-59b8eb05969b', '', { ratio: 1 }),
        unsplash('photo-1697663426683-530277eb4fbd', '', { ratio: 1 }),
      ],
    },
    cta: { label: 'Junte-se a nós!', action: { type: 'url', href: '', label: 'Comunidade' } },
  },

  // `tone`: 'light' (bege, foto à direita) ou 'dark' (chocolate, foto à esquerda).
  features: [
    {
      id: 'agendamento',
      title: 'Agendamento',
      description: 'Reserve um horário para uma conversa individual sobre o seu negócio.',
      cta: 'Saiba mais',
      tone: 'light',
      photo: unsplash(PHOTO.retrato, 'Retrato de Agatha Rigazzi de blazer branco', { ratio: 5 / 6 }),
      action: { type: 'channel', channel: 'booking' },
    },
    {
      id: 'aprenda-comigo',
      title: 'Aprenda comigo',
      description: 'Cursos e mentorias para posicionar sua marca com estratégia.',
      cta: 'Saiba mais',
      tone: 'dark',
      photo: unsplash(PHOTO.sorrindo, 'Agatha Rigazzi sorrindo em estúdio claro', { ratio: 5 / 6 }),
      action: { type: 'url', href: '', label: 'Cursos e mentorias' },
    },
    {
      id: 'servicos',
      title: 'Meus serviços',
      description: 'Consultorias e acompanhamentos para cada fase do seu negócio.',
      cta: 'Saiba mais',
      tone: 'light',
      photo: unsplash(PHOTO.pensativa, 'Agatha Rigazzi com expressão serena', { ratio: 5 / 6 }),
      action: { type: 'section', target: 'servicos' },
    },
  ],

  about: {
    id: 'sobre',
    titleLead: 'Quem é',
    title: 'Agatha Rigazzi',
    paragraphs: [
      'Acredito que toda mulher pode construir um negócio com identidade, propósito e estratégia.',
      'Aqui você encontra conteúdos, cursos e acompanhamentos pensados para transformar o que você sabe em uma marca reconhecida — sem fórmulas prontas.',
    ],
  },

  services: {
    id: 'servicos',
    eyebrow: 'Como posso te ajudar',
    title: 'Meus serviços',
    items: [
      { title: 'Mentoria individual', description: 'Encontros personalizados para definir posicionamento, oferta e próximos passos.' },
      { title: 'Consultoria de marca', description: 'Diagnóstico da sua presença digital com um plano de ação claro.' },
      { title: 'Cursos online', description: 'Conteúdos gravados para você aprender no seu ritmo.' },
    ],
    cta: { label: 'Quero saber mais', action: { type: 'channel', channel: 'whatsapp' } },
  },

  testimonials: {
    id: 'depoimentos',
    titleLead: 'O que as',
    titleStrong: 'alunas',
    titleItalic: 'estão falando?',
    note: 'Depoimentos ilustrativos — substitua por relatos reais, com autorização das alunas.',
    items: [
      { name: 'Juliana Silva', rating: 5, text: 'As mentorias me ajudaram a enxergar com clareza o que torna o meu trabalho único.' },
      { name: 'Carla Almeida', rating: 5, text: 'Saí de cada encontro com tarefas práticas e muito mais segurança para divulgar meu negócio.' },
      { name: 'Fernanda Costa', rating: 5, text: 'Um acompanhamento atencioso, direto ao ponto e com muita sensibilidade.' },
    ],
  },

  finalCta: {
    photo: unsplash(PHOTO.retrato, 'Agatha Rigazzi olhando para a câmera', { ratio: 4 / 5 }),
    titleLead: 'Ficou com',
    titleItalic: 'alguma dúvida?',
    text: 'Me chame no WhatsApp e eu te ajudo a encontrar o melhor caminho.',
    cta: { label: 'Fale comigo', action: { type: 'channel', channel: 'whatsapp' } },
  },

  footer: {
    links: ['instagram', 'whatsapp', 'website'],
    demoNote: 'Modelo demonstrativo: nomes, números, depoimentos e fotos são ilustrativos.',
  },
};
