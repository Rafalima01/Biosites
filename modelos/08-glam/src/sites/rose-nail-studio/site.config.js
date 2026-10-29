/**
 * Modelo 08 · Glam — demonstração: Rosé Nail Studio (marca fictícia)
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Para criar um novo cliente com este modelo, duplique esta pasta, edite este
 * arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * INSPIRAÇÕES: a cliente toca no "+" das fotos para escolher referências. Elas
 * aparecem no cartão de agendamento e entram na mensagem do WhatsApp.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que marca,
 * valores e fotos são ilustrativos. Desligue apenas com dados reais.
 */

/**
 * Foto do Unsplash recortada pelo servidor de imagens com `srcset`.
 * Para fotos do cliente, use `{ src: '/media/arquivo.webp', alt, width, height }`.
 */
const unsplash = (id, alt, { ratio = 1, focus = 'center' } = {}) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${focus}&w=${w}&h=${Math.round(w / ratio)}&q=78`;
  return {
    src: url(800),
    srcset: [320, 480, 800, 1200].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width: 800,
    height: Math.round(800 / ratio),
  };
};

export default {
  id: 'rose-nail-studio',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Rosé Nail Studio · Bia Lins, nail designer',
    description:
      'Alongamento em gel, blindagem e nail art delicada. Escolha suas inspirações e agende seu horário com a Bia pelo WhatsApp.',
    themeColor: '#f17cb0',
    // Domínio final (ex.: 'https://rosenailstudio.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Poiret+One&family=Poppins:wght@300;400;500;600&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  // Foto de fundo atrás dos cartões de vidro (desfocada no celular).
  backdrop: unsplash('photo-1514565131-fce0801e5785', '', { ratio: 16 / 10 }),

  brand: {
    neon: 'Nail Room', // letreiro em neon sobre a foto do studio
    name: 'Rosé Nail Studio',
    designer: 'Bia Lins',
    role: 'Nail designer',
    photo: unsplash('photo-1544005313-94ddf0286df2', 'Retrato da nail designer Bia Lins', { focus: 'faces' }),
  },

  studio: {
    photo: unsplash('photo-1600948836101-f9ffda59d250', 'Bancada do studio com espelhos redondos', { ratio: 4 / 3 }),
  },

  // Cartão de destaque (o "pedido" da referência).
  featured: {
    status: 'Agenda aberta',
    service: 'Alongamento em gel',
    detail: '+ nail art delicada',
    photo: unsplash('photo-1604902396830-aca29e19b067', 'Unhas rosadas em formato amendoado'),
  },

  // Bloco de horários ao lado das inspirações escolhidas.
  schedule: { label: 'Atendimento', day: 'Ter a Sáb', time: '9h às 19h' },

  cta: {
    label: 'Agendar horário',
    note: 'Para confirmar o horário, pedimos um sinal de 50% via Pix.',
    message: 'Olá, Bia! Vim pelo seu site e quero agendar um horário.',
  },

  inspo: {
    title: 'Inspirações',
    subtitle: 'Toque no + para mostrar à Bia o que você quer',
    // Categorias para filtrar a galeria. Cada foto pode ter várias.
    tags: ['Nude', 'Rosa', 'Nail art', 'Curtinhas'],
    items: [
      { id: 'nude-amendoada', title: 'Nude amendoada', tags: ['Nude'], photo: unsplash('photo-1610992015732-2449b76344bc', 'Unhas nude amendoadas sobre tecido claro') },
      { id: 'rosa-pastel', title: 'Rosa chiclete', tags: ['Rosa'], photo: unsplash('photo-1604902396830-aca29e19b067', 'Unhas rosa sobre fundo rosa') },
      { id: 'love', title: 'Nail art "love"', tags: ['Nail art', 'Rosa'], photo: unsplash('photo-1519014816548-bf5fe059798b', 'Unhas vermelhas com a palavra love') },
      { id: 'pastel-mix', title: 'Pastel lilás', tags: ['Curtinhas'], photo: unsplash('photo-1607779097040-26e80aa78e66', 'Unhas curtas em tons pastel') },
      { id: 'colorida', title: 'Chama colorida', tags: ['Nail art', 'Curtinhas'], photo: unsplash('photo-1571290274554-6a2eaa771e5f', 'Unhas com desenho de chamas coloridas') },
      { id: 'black', title: 'Preta com glitter', tags: ['Nail art'], photo: unsplash('photo-1604654894610-df63bc536371', 'Unhas pretas brilhantes') },
    ],
  },

  // Serviços com valor. `from: true` mostra "a partir de".
  services: [
    { name: 'Alongamento em gel', price: 'R$ 180', from: true },
    { name: 'Manutenção do alongamento', price: 'R$ 120' },
    { name: 'Blindagem', price: 'R$ 90' },
    { name: 'Esmaltação em gel', price: 'R$ 70' },
    { name: 'Nail art (por unha)', price: 'R$ 10', from: true },
  ],

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Bia! Vim pelo seu site.',
    },
    booking: { url: '', message: '' },
    instagram: { handle: '' }, // Ex.: 'rosenailstudio'
    website: { url: '' },
    location: {
      address: '', // Ex.: 'Rua Exemplo, 123 - Moema, São Paulo - SP'
      mapsUrl: '',
    },
  },

  // Botões de links no último cartão.
  links: [
    { id: 'instagram', label: 'Instagram', action: { type: 'channel', channel: 'instagram' } },
    { id: 'localizacao', label: 'Como chegar', action: { type: 'channel', channel: 'location' } },
    { id: 'cursos', label: 'Curso de alongamento', action: { type: 'url', href: '', label: 'Curso de alongamento' } },
  ],

  footer: {
    demoNote: 'Modelo demonstrativo: marca fictícia; valores e fotos são ilustrativos.',
  },
};
