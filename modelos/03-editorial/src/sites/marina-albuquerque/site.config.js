/**
 * Modelo 03 · Editorial — demonstração: Marina Albuquerque
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
 * números e fotos são ilustrativos. Desligue apenas com dados reais.
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
  retrato: 'photo-1676694047749-ee0fa2709893',
  cetim: 'photo-1686212164366-b25166623992',
  trabalho: 'photo-1762341118325-23fece6a2508',
};

export default {
  id: 'marina-albuquerque',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Marina Albuquerque · Mentora de marketing digital',
    description:
      'Marina Albuquerque — mentoria individual e cursos de marketing digital para empreendedoras que querem vender com posicionamento.',
    themeColor: '#0d1b36',
    // Domínio final (ex.: 'https://marinaalbuquerque.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: `https://images.unsplash.com/${PHOTO.retrato}?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78`,
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Poppins:wght@300;400;500&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    firstName: 'Marina',
    lastName: 'Albuquerque',
    role: 'Mentora de marketing digital',
    tagline: 'Estratégia e posicionamento para empreendedoras que querem vender com autoridade.',
    legalName: 'Marina Albuquerque',
  },

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Marina! Vim pelo seu bio site e fiquei com uma dúvida.',
    },
    booking: {
      url: '', // Opcional: link de agenda (Calendly etc.). Vazio = agendamento pelo WhatsApp.
      message: 'Olá, Marina! Gostaria de saber mais sobre a mentoria individual.',
    },
    instagram: { handle: '' }, // Ex.: 'marinaalbuquerque'
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  hero: {
    photo: unsplash(PHOTO.retrato, 'Marina Albuquerque sorrindo, de blazer preto, em fundo azul-marinho', { ratio: 4 / 5 }),
    stats: [
      { value: '+3.500', label: 'alunas no Brasil' },
      { value: '+14 anos', label: 'de experiência' },
    ],
    cta: { label: 'Torne-se minha aluna', action: { type: 'url', href: '', label: 'Inscrição' } },
  },

  // `layout`: 'photo-left' | 'photo-right' (foto + título) ou 'texture' (imagem de fundo + botão).
  banners: [
    {
      id: 'mentoria',
      title: 'Mentoria',
      subtitle: 'Individual',
      layout: 'photo-left',
      photo: unsplash(PHOTO.retrato, 'Retrato de Marina Albuquerque', { ratio: 1 }),
      action: { type: 'channel', channel: 'booking' },
    },
    {
      id: 'servicos',
      title: 'Meus serviços',
      cta: 'Saiba mais',
      layout: 'texture',
      photo: unsplash(PHOTO.cetim, '', { ratio: 3, focus: 'center' }),
      action: { type: 'section', target: 'servicos' },
    },
    {
      id: 'fale-comigo',
      title: 'Fale comigo',
      layout: 'photo-right',
      flip: true, // espelha a foto para não repetir o mesmo enquadramento do banner "Mentoria"
      photo: unsplash(PHOTO.retrato, 'Marina Albuquerque sorrindo', { ratio: 1 }),
      action: { type: 'channel', channel: 'whatsapp' },
    },
  ],

  about: {
    id: 'sobre',
    titleLead: 'Quem é',
    title: 'Marina Albuquerque?',
    paragraphs: [
      'Ajudo empreendedoras a transformar conhecimento em uma marca reconhecida, com estratégia de conteúdo, posicionamento e vendas no digital.',
      'Meu trabalho une método e escuta: cada aluna constrói um plano que respeita o próprio ritmo e a própria história.',
    ],
    photo: unsplash(PHOTO.trabalho, 'Mesa de trabalho com notebook e documentos', { ratio: 2.4, focus: 'bottom' }),
  },

  services: {
    id: 'servicos',
    eyebrow: 'Como posso te ajudar',
    title: 'Meus serviços',
    items: [
      { title: 'Mentoria individual', description: 'Acompanhamento próximo para definir posicionamento, oferta e plano de conteúdo.' },
      { title: 'Mentoria em grupo', description: 'Encontros ao vivo com outras empreendedoras, trocas e tarefas práticas.' },
      { title: 'Cursos online', description: 'Aulas gravadas sobre marketing digital para aprender no seu ritmo.' },
    ],
    cta: { label: 'Quero saber mais', action: { type: 'channel', channel: 'whatsapp' } },
  },

  faq: {
    titleLead: 'Ficou com',
    titleItalic: 'alguma dúvida?',
    text: 'Me chame no WhatsApp e eu te ajudo a escolher o melhor caminho.',
    cta: { label: 'Fale comigo', action: { type: 'channel', channel: 'whatsapp' } },
  },

  closing: {
    photo: unsplash(PHOTO.retrato, 'Marina Albuquerque em retrato de estúdio', { ratio: 1 }),
  },

  footer: {
    links: ['instagram', 'whatsapp', 'website'],
    demoNote: 'Modelo demonstrativo: nome, números e fotos são ilustrativos.',
  },
};
