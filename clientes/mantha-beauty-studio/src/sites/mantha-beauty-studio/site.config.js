/**
 * Mantha Beauty Studio · Samantha Carvalho (cliente real, Modelo 08 · Glam)
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Fotos da cliente ficam em `public/media/`.
 *
 * INSPIRAÇÕES: fotos de trabalhos da própria Samantha. As escolhidas no "+"
 * entram na mensagem do WhatsApp. Sem fotos, a galeria some e o site mostra
 * as especialidades no lugar.
 */

const media = (name, alt, { width, height, sizes }) => ({
  src: `/media/${name}-${sizes[sizes.length - 1]}.webp`,
  srcset: sizes.map((w) => `/media/${name}-${w}.webp ${w}w`).join(', '),
  alt,
  width,
  height,
});

const whatsapp = '5571996509097';

export default {
  id: 'mantha-beauty-studio',
  lang: 'pt-BR',
  demo: false,

  meta: {
    title: 'Mantha Beauty Studio · Samantha Carvalho',
    description:
      'Sobrancelhas, cílios e lábios com Samantha Carvalho. Design com henna, cílios em tufos de seda e spa labial. Agende pelo WhatsApp.',
    themeColor: '#5b3a7e',
    // Domínio final (ex.: 'https://manthabeauty.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: 'https://biosite-mantha-beauty-studio.vercel.app',
    ogImage: '/media/samantha-capa-900.webp',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Poiret+One&family=Poppins:wght@300;400;500;600&display=swap',
    // Roxo do estúdio de fotos no fundo; o rosa continua nos botões e destaques.
    tokens: {
      '--glass': 'rgba(244, 236, 245, 0.74)',
      '--pink-tint': '#6c4391',
    },
  },

  // Foto de fundo atrás dos cartões (sempre desfocada).
  backdrop: { ...media('samantha-fundo', '', { width: 1280, height: 1920, sizes: [640, 1280] }), blur: true },

  brand: {
    neon: 'Mantha', // letreiro em neon sobre a foto
    sign: 'Beauty Studio', // linha abaixo do letreiro (o nome completo vai no título da página)
    name: 'Mantha Beauty Studio',
    designer: 'Samantha Carvalho',
    role: 'Sobrancelhas · Cílios · Lábios',
    photo: media('samantha-rosto', 'Samantha Carvalho sorrindo, com cabelo cacheado', { width: 400, height: 400, sizes: [400] }),
  },

  studio: {
    // Foto alta, com o letreiro no espaço acima da cabeça (não cobre o rosto).
    photo: media('samantha-capa', 'Samantha Carvalho de conjunto rosa em fundo roxo', { width: 900, height: 1276, sizes: [480, 900] }),
    layout: 'portrait',
  },

  // Serviço em destaque. Sem foto de trabalho, mostra um selo com a categoria.
  featured: {
    status: 'Agenda aberta',
    category: 'Sobrancelhas',
    service: 'Design personalizado com henna',
    detail: '1 h · R$ 40',
    photo: media('trabalho-1', 'Sobrancelhas marcadas com design e henna', { width: 800, height: 800, sizes: [400, 800] }),
  },

  // Bloco ao lado das especialidades.
  schedule: { label: 'Atendimento', day: 'Seg a Sáb', time: '8h às 18h' },

  cta: {
    label: 'Agendar horário',
    note: 'Atendimento com hora marcada. Escolha o serviço abaixo ou chame no WhatsApp.',
    message: 'Olá, Samantha! Vim pelo seu site e quero agendar um horário.',
  },

  // Fotos de trabalhos da Samantha. Cada foto pode ter várias categorias.
  inspo: {
    title: 'Inspirações',
    subtitle: 'Toque no + para mostrar à Samantha o que você quer',
    tags: ['Sobrancelhas', 'Cílios'],
    items: [
      { id: 'sobrancelha-marcada', title: 'Sobrancelha marcada', tags: ['Sobrancelhas'], photo: media('trabalho-1', 'Cliente com sobrancelhas escuras e bem desenhadas', { width: 800, height: 800, sizes: [400, 800] }) },
      { id: 'sobrancelha-e-cilios', title: 'Sobrancelha e cílios', tags: ['Sobrancelhas', 'Cílios'], photo: media('trabalho-2', 'Cliente loira com sobrancelhas acobreadas e cílios volumosos', { width: 800, height: 800, sizes: [400, 800] }) },
      { id: 'cilios-volumosos', title: 'Cílios volumosos', tags: ['Cílios', 'Sobrancelhas'], photo: media('trabalho-3', 'Cliente com cílios volumosos e sobrancelhas definidas', { width: 800, height: 800, sizes: [400, 800] }) },
      { id: 'olhar-natural', title: 'Olhar natural', tags: ['Cílios', 'Sobrancelhas'], photo: media('trabalho-4', 'Cliente sorrindo com cílios alongados e sobrancelhas naturais', { width: 800, height: 800, sizes: [400, 800] }) },
    ],
  },

  // Serviços por categoria. `minutes` vira "45 min" ou "1 h".
  services: [
    {
      category: 'Sobrancelhas',
      items: [
        {
          name: 'Design personalizado com henna',
          minutes: 60,
          price: 40,
          description:
            'Une a modelagem das sobrancelhas com a coloração. É desenhado sob medida para valorizar a estrutura óssea do rosto; a henna pigmenta a pele e os fios, criando volume e disfarçando falhas com naturalidade.',
        },
        {
          name: 'Design simples',
          minutes: 40,
          price: 30,
          description:
            'Técnica de depilação e limpeza que remove apenas o excesso de pelos: alinha o formato natural, limpa a área ao redor e define a base. Diferente do design personalizado.',
        },
        { name: 'Design masculino', minutes: 45, price: 40 },
      ],
    },
    {
      category: 'Cílios',
      items: [
        {
          name: 'Aplicação de tufos de seda',
          minutes: 45,
          price: 50,
          description:
            'Pequenos feixes de fios sintéticos ultrafinos colados sobre os cílios naturais para dar volume, com higienização rigorosa dos olhos e colas específicas.',
        },
        {
          name: 'Tufos de seda mega volume',
          minutes: 50,
          price: 55,
          description: 'Extensão rápida que garante um olhar super denso e expressivo.',
        },
        { name: 'Remoção de cílios em tufos', minutes: 30, price: 25 },
      ],
    },
    {
      category: 'Lábios',
      items: [
        {
          name: 'Spa labial',
          minutes: 30,
          price: 15,
          description:
            'Tratamento não invasivo de revitalização, nutrição e hidratação profunda: remove células mortas, combate o ressecamento e deixa os lábios macios, lisos e com brilho natural.',
        },
      ],
    },
  ],

  contact: {
    whatsapp: {
      number: whatsapp,
      message: 'Olá, Samantha! Vim pelo seu site.',
    },
    booking: { url: '', message: '' },
    instagram: { handle: 'mantha_beautystudio' },
    website: { url: '' },
    location: {
      address: '',
      mapsUrl: 'https://maps.app.goo.gl/7dmhXiAfS2kZnGQt5',
    },
  },

  // Botões de links no cartão de serviços.
  links: [
    { id: 'whatsapp', label: 'Falar no WhatsApp', action: { type: 'channel', channel: 'whatsapp' } },
    { id: 'instagram', label: 'Instagram @mantha_beautystudio', action: { type: 'channel', channel: 'instagram' } },
    { id: 'localizacao', label: 'Como chegar', action: { type: 'channel', channel: 'location' } },
  ],

  footer: {
    demoNote: '',
  },
};
