/**
 * Mantha Beauty Studio · Samantha Carvalho — bio site oficial (cópia do Modelo 09 · Delicado com as cores dela)
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
    themeColor: '#f3efe4',
    // Domínio final (ex.: 'https://manthabeauty.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: 'https://biosite-mantha-beauty-studio.vercel.app',
    ogImage: '/media/samantha-retrato-1080.webp',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Allura&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap',
    // Identidade visual da Samantha: roxo ameixa, dourado e creme (cores tiradas da identidade dela).
    tokens: {
      '--bg': '#f3efe4', // creme
      '--bg-soft': '#faf7f0',
      '--surface': '#fffdf8',
      '--rose': '#a07a98', // roxo claro: contornos e ícones de linha
      '--rose-deep': '#784870', // roxo ameixa da marca: títulos e destaques
      '--rose-light': '#e8c79a', // dourado champanhe: sobrenome sobre a foto
      '--rose-tint': '#f1e9ee', // lilás bem claro: fundo dos itens
      '--rose-ink': '#6a3d63', // roxo para texto pequeno (contraste AA)
      '--tile': 'linear-gradient(150deg, #9b6b93, #6a3c63)',
      '--band': 'linear-gradient(135deg, #8a5882, #5e3358)',
      '--glow': 'rgba(94, 51, 88, 0.8)',
      '--focus-ring': 'rgba(120, 72, 112, 0.22)',
      '--ink': '#352a33',
      '--muted': '#77696f',
      '--line': 'rgba(120, 72, 112, 0.2)',
      '--shadow': '0 24px 48px -28px rgba(94, 51, 88, 0.42)',
      '--shadow-soft': '0 10px 24px -18px rgba(94, 51, 88, 0.45)',
      '--shadow-strong': '0 50px 90px -50px rgba(94, 51, 88, 0.55)',
      '--signature-faint': 'rgba(197, 149, 96, 0.22)', // dourado suave atrás dos títulos
      '--signature-fill': 'linear-gradient(135deg, #fae2c4, #daa95b 55%, #c59560)', // dourado no rodapé
      '--kicker-line': 'rgba(197, 149, 96, 0.55)', // fios dourados ao lado dos subtítulos
      '--hero-fade': '#2c1d2a',
    },
  },

  brand: {
    firstName: 'Samantha',
    lastName: 'Carvalho',
    name: 'Mantha Beauty Studio',
    // Assinatura manuscrita: atrás do "Sobre mim", do título de serviços e no rodapé (nunca sobre as fotos).
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
      action: { type: 'page', href: '/agendar/' },
    },
    { id: 'servicos', title: 'Serviços e valores', text: 'Duração e valores', icon: 'list', action: { type: 'page', href: '/servicos/' } },
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
    action: { type: 'page', href: '/agendar/' },
  },

  // Agendamento online (/agendar/): calendário com os horários livres, sinal por Pix e envio pelo WhatsApp.
  // Os horários ocupados vêm da agenda do Google (endereço secreto iCal na variável AGENDA_ICS_URL da Vercel).
  // Sem a variável, o calendário mostra todo o expediente e a confirmação fica no WhatsApp.
  booking: {
    days: [1, 2, 3, 4, 5, 6], // 0 = domingo … 6 = sábado
    open: '08:00',
    close: '18:00', // o serviço precisa terminar até este horário
    step: 30, // minutos entre um horário e outro
    breaks: [], // ex.: [{ from: '12:00', to: '13:00' }]
    minNotice: 120, // antecedência mínima, em minutos
    daysAhead: 30, // até quantos dias à frente dá para agendar
    offset: -180, // fuso do studio em minutos (Salvador: UTC-3)
    deposit: 0.3, // sinal de 30%
  },

  // Sistema de Agendamento da Vertex: horários, bloqueios e agendamentos ficam no painel
  // (https://sistema-agendamento-sand.vercel.app). A chave abaixo é a pública ("anon"), feita para ir no site.
  sistema: {
    url: 'https://jbudmvywhaskaemicubn.supabase.co',
    chave:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWRtdnl3aGFza2FlbWljdWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDYxMTksImV4cCI6MjEwODg4MjExOX0.zziLB69DZhG9eubnS1cICOItrKwVCDTygnw7Jviuu0A',
    studio: 'mantha-beauty-studio',
  },

  // Pix do sinal. FASE DE TESTE: chave provisória; trocar pela chave da Samantha antes de usar de verdade.
  pix: {
    key: '+5571992351084', // celular no formato +55DDDNÚMERO
    keyLabel: 'Celular',
    keyDisplay: '(71) 99235-1084',
    holder: 'Samantha Carvalho Beauty Studio',
    city: 'Salvador',
  },

  policy: {
    title: 'Política de agendamento e cancelamento',
    paragraphs: [
      'Para garantir seu horário, é necessário o pagamento de uma taxa de agendamento de 30%, que será abatida do valor total.',
      'Em caso de cancelamento, desistência ou não comparecimento, o valor da taxa não será reembolsado.',
      'Ao realizar o agendamento, você concorda com esta política. Agradeço pela sua compreensão.',
    ],
    signature: 'Samantha Carvalho Beauty Studio',
    agree: 'Li e concordo com a política de agendamento e cancelamento.',
  },

  gallery: {
    id: 'trabalhos',
    title: 'Meus trabalhos',
    items: [
      { photo: media('trabalho-1', 'Cliente com sobrancelhas escuras e bem desenhadas', { width: 800, height: 800, sizes: [400, 800] }) },
      { photo: media('trabalho-2', 'Cliente loira com sobrancelhas acobreadas e cílios volumosos', { width: 800, height: 800, sizes: [400, 800] }) },
      { photo: media('trabalho-3', 'Cliente com cílios volumosos e sobrancelhas definidas', { width: 800, height: 800, sizes: [400, 800] }) },
      { photo: media('trabalho-4', 'Cliente sorrindo com cílios alongados e sobrancelhas naturais', { width: 800, height: 800, sizes: [400, 800] }) },
    ],
  },

  faq: {
    title: 'Dúvidas frequentes',
    items: [
      {
        q: 'Como faço para agendar?',
        a: 'Toque em Agendamento ou no serviço que você quer, escolha o dia e o horário livres e envie o sinal de 30% pelo Pix. A confirmação é pelo WhatsApp, com o comprovante.',
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
        description: 'Sobrancelhas, cílios e lábios com Samantha Carvalho: duração, valores e agendamento online.',
      },
      title: 'Serviços',
      titleAccent: 'e valores',
      subtitle: 'Toque no serviço para escolher o dia e o horário.',
    },
    agendar: {
      meta: {
        title: 'Agendar horário · Samantha Carvalho',
        description: 'Escolha o serviço, o dia e o horário livres e garanta seu atendimento com Samantha Carvalho.',
      },
      title: 'Agendar',
      titleAccent: 'horário',
      subtitle: 'Escolha o dia e o horário livres. O horário fica garantido com o sinal de 30% pelo Pix.',
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
