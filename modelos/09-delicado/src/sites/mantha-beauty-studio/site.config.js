/**
 * Mantha Beauty Studio · Samantha Carvalho (teste do Modelo 09 · Delicado com os dados reais da cliente)
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Fotos ficam em `public/media/`.
 *
 * Textos de "Sobre mim", frase do topo e dúvidas frequentes foram escritos só com
 * informações já confirmadas (serviços, horários, cidade). Troque pelos da cliente.
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
    title: 'Samantha Carvalho · Mantha Beauty Studio',
    description:
      'Sobrancelhas, cílios e lábios com Samantha Carvalho em Salvador. Design com henna, cílios em tufos de seda e spa labial. Agende pelo WhatsApp.',
    themeColor: '#f7ecef',
    // Domínio final (ex.: 'https://manthabeauty.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: 'https://biosite-09-delicado.vercel.app',
    ogImage: '/media/samantha-retrato-1080.webp',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Allura&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap',
    tokens: {},
  },

  brand: {
    firstName: 'Samantha',
    lastName: 'Carvalho',
    name: 'Mantha Beauty Studio',
    // Assinatura manuscrita: atrás da foto do topo e no rodapé.
    signature: 'Mantha',
    tagline: ['Sobrancelhas', 'Cílios', 'Lábios'],
  },

  hero: {
    photo: media('samantha-retrato', 'Samantha Carvalho sorrindo, com a mão no cabelo cacheado', { width: 1080, height: 1258, sizes: [640, 1080] }),
  },

  // Cards do topo. Ações: channel (whatsapp, instagram, location…), page (/servicos/), section (#id) ou url.
  menu: [
    {
      id: 'agendamento',
      title: 'Agendamento',
      text: 'Reserve seu horário',
      icon: 'calendar',
      action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Samantha! Vim pelo seu site e quero agendar um horário.' },
    },
    { id: 'servicos', title: 'Serviços e valores', text: 'Duração e valor de cada um', icon: 'list', action: { type: 'page', href: '/servicos/' } },
    { id: 'trabalhos', title: 'Meus trabalhos', text: 'Acompanhe no Instagram', icon: 'instagram', action: { type: 'channel', channel: 'instagram' } },
    { id: 'endereco', title: 'Como chegar', text: 'Abrir no mapa', icon: 'pin', action: { type: 'channel', channel: 'location' } },
  ],

  // Frase abaixo dos cards: primeira parte em serifa, segunda em letra manuscrita.
  phrase: { text: 'Sobrancelhas, cílios e lábios', script: 'com hora marcada.' },

  about: {
    id: 'sobre',
    title: 'Sobre',
    titleAccent: 'mim',
    paragraphs: [
      'Sou Samantha Carvalho, à frente do Mantha Beauty Studio, em Salvador.',
      'Faço design de sobrancelhas com henna, cílios em tufos de seda e spa labial, sempre com hora marcada e atenção a cada detalhe.',
    ],
    photo: media('samantha-sobre', 'Samantha Carvalho de conjunto rosa, em pé, sorrindo', { width: 680, height: 1210, sizes: [400, 680] }),
  },

  help: {
    title: 'Como posso te ajudar',
    items: [
      { icon: 'brow', title: 'Sobrancelhas', text: 'Design personalizado com henna, design simples e masculino.' },
      { icon: 'lashes', title: 'Cílios', text: 'Tufos de seda e mega volume, com remoção quando precisar.' },
      { icon: 'lips', title: 'Lábios', text: 'Spa labial para hidratar e deixar os lábios macios.' },
    ],
  },

  cta: {
    text: 'Atendimento de segunda a sábado, das 8h às 18h.',
    label: 'Quero agendar',
    message: 'Olá, Samantha! Vim pelo seu site e quero agendar um horário.',
  },

  gallery: {
    id: 'trabalhos',
    title: 'Meus trabalhos',
    items: [
      { caption: 'Sobrancelha marcada', photo: media('trabalho-1', 'Cliente com sobrancelhas escuras e bem desenhadas', { width: 800, height: 800, sizes: [400, 800] }) },
      { caption: 'Sobrancelha e cílios', photo: media('trabalho-2', 'Cliente loira com sobrancelhas acobreadas e cílios volumosos', { width: 800, height: 800, sizes: [400, 800] }) },
      { caption: 'Cílios volumosos', photo: media('trabalho-3', 'Cliente com cílios volumosos e sobrancelhas definidas', { width: 800, height: 800, sizes: [400, 800] }) },
      { caption: 'Olhar natural', photo: media('trabalho-4', 'Cliente sorrindo com cílios alongados e sobrancelhas naturais', { width: 800, height: 800, sizes: [400, 800] }) },
    ],
  },

  faq: {
    title: 'Dúvidas frequentes',
    items: [
      {
        q: 'Como faço para agendar?',
        a: 'Pelo WhatsApp. Toque em Agendamento ou no serviço que você quer, e a mensagem já vai pronta.',
      },
      { q: 'Qual o horário de atendimento?', a: 'De segunda a sábado, das 8h às 18h, sempre com hora marcada.' },
      { q: 'Quanto tempo dura cada serviço?', a: 'De 30 minutos a 1 hora. A duração e o valor de cada um estão em Serviços e valores.' },
      { q: 'Onde fica o studio?', a: 'Em Salvador. Toque em Como chegar para abrir a localização no mapa.' },
    ],
  },

  schedule: { day: 'Seg a Sáb', time: '8h às 18h' },

  // Serviços por categoria (página /servicos/). `minutes` vira "45 min" ou "1 h".
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

  pages: {
    servicos: {
      meta: {
        title: 'Serviços e valores · Samantha Carvalho',
        description: 'Sobrancelhas, cílios e lábios com Samantha Carvalho: duração, valores e agendamento pelo WhatsApp.',
      },
      title: 'Serviços',
      titleAccent: 'e valores',
      subtitle: 'Toque no serviço para agendar. A mensagem já vai pronta com o nome dele.',
    },
  },

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

  // Rodapé: "Acompanhe meu trabalho" com os canais abaixo.
  social: { title: 'Acompanhe meu trabalho', channels: ['instagram', 'whatsapp', 'location'] },

  footer: {
    demoNote: '',
  },
};
