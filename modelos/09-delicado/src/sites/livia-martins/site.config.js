/**
 * Modelo 09 · Delicado — demonstração: Lívia Martins · Studio Lívia Beauty (marca fictícia)
 *
 * Maquete: nomes, valores, contatos, textos e fotos são ilustrativos. Para uma cliente real,
 * copie esta pasta do modelo para `clientes/<cliente>` e edite o site.config.js dela
 * (exemplo real: clientes/mantha-beauty-studio).
 *
 * DESTINOS PENDENTES: campos vazios ('') viram botões que avisam "destino ainda não configurado".
 * PIX: a chave abaixo é fictícia (DDD 00). Não use para receber.
 */

/** Foto do Unsplash recortada pelo servidor de imagens (foco no rosto), com `srcset`. */
const unsplash = (id, alt, { width, height }) => {
  const url = (w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${Math.round((w * height) / width)}&q=78`;
  return {
    src: url(width),
    srcset: [Math.round(width / 2), width].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width,
    height,
  };
};

export default {
  id: 'livia-martins',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Lívia Martins · Studio Lívia Beauty',
    description: 'Unhas, sobrancelhas e cílios com Lívia Martins. Serviços, valores e agendamento online.',
    themeColor: '#fbf3f3',
    siteUrl: 'https://biosite-09-delicado.vercel.app',
    ogImage: 'https://images.unsplash.com/photo-1706565029071-f8f70ce91e71?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Allura&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap',
    // Paleta rosa do modelo (src/styles/tokens.css). Para uma cliente, sobrescreva aqui as variáveis.
    tokens: {},
  },

  brand: {
    firstName: 'Lívia',
    lastName: 'Martins',
    name: 'Studio Lívia Beauty',
    signature: 'Lívia',
    tagline: ['Unhas', 'Sobrancelhas', 'Cílios'],
  },

  hero: {
    photo: unsplash('photo-1706565029071-f8f70ce91e71', 'Mulher sorrindo em estúdio claro', { width: 1080, height: 1258 }),
  },

  menu: [
    { id: 'agendamento', title: 'Agendamento', text: 'Reserve seu horário', icon: 'calendar', action: { type: 'page', href: '/agendar/' } },
    { id: 'servicos', title: 'Serviços e valores', text: 'Duração e valores', icon: 'list', action: { type: 'page', href: '/servicos/' } },
    { id: 'trabalhos', title: 'Meus trabalhos', text: 'Acompanhe no Instagram', icon: 'instagram', action: { type: 'channel', channel: 'instagram' } },
    { id: 'endereco', title: 'Como chegar', text: 'Abrir no mapa', icon: 'pin', action: { type: 'channel', channel: 'location' } },
  ],

  phrase: { text: 'Unhas, sobrancelhas e cílios', script: 'com hora marcada.' },

  about: {
    id: 'sobre',
    title: 'Sobre',
    titleAccent: 'mim',
    paragraphs: [
      'Sou Lívia Martins, à frente do Studio Lívia Beauty.',
      'Cuido de unhas, sobrancelhas e cílios com hora marcada e atenção a cada detalhe, para você sair se sentindo ainda mais bonita.',
    ],
    photo: unsplash('photo-1706565029539-d09af5896340', 'Retrato de mulher de blazer branco', { width: 680, height: 1210 }),
  },

  help: {
    title: 'Como posso te ajudar',
    items: [
      { icon: 'sparkle', title: 'Unhas', text: 'Alongamento, manutenção e esmaltação em gel.' },
      { icon: 'brow', title: 'Sobrancelhas', text: 'Design personalizado, com ou sem henna.' },
      { icon: 'lashes', title: 'Cílios', text: 'Extensão em tufos e lash lifting.' },
    ],
  },

  cta: {
    text: 'Atendimento de segunda a sábado, das 9h às 19h.',
    label: 'Quero agendar',
    action: { type: 'page', href: '/agendar/' },
  },

  // Agendamento online (/agendar/): calendário com os horários livres, sinal por Pix e envio pelo WhatsApp.
  // Com `sistema`, os horários vêm do Sistema de Agendamento da Vertex e o agendamento fica gravado no
  // painel (https://sistema-agendamento-sand.vercel.app). Na maquete, aponta para o studio de
  // demonstração "studio-livia" (sistemas/agendamento/supabase/seed.sql). A chave é a pública ("anon").
  // Sem `sistema`, os ocupados vêm da agenda do Google (iCal em AGENDA_ICS_URL) e `booking` define o expediente.
  sistema: {
    url: 'https://jbudmvywhaskaemicubn.supabase.co',
    chave:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWRtdnl3aGFza2FlbWljdWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDYxMTksImV4cCI6MjEwODg4MjExOX0.zziLB69DZhG9eubnS1cICOItrKwVCDTygnw7Jviuu0A',
    studio: 'studio-livia',
  },

  booking: {
    days: [1, 2, 3, 4, 5, 6],
    open: '09:00',
    close: '19:00',
    step: 30,
    breaks: [{ from: '12:00', to: '13:00' }],
    minNotice: 120,
    daysAhead: 30,
    offset: -180,
    deposit: 0.3,
  },

  // Chave fictícia (DDD 00): o Pix é gerado só para demonstração.
  pix: {
    key: '+5500900000000',
    keyLabel: 'Celular',
    keyDisplay: '(00) 90000-0000',
    holder: 'Studio Livia Beauty',
    city: 'Salvador',
  },

  policy: {
    title: 'Política de agendamento e cancelamento',
    paragraphs: [
      'Para garantir seu horário, é necessário o pagamento de um sinal de 30%, que será abatido do valor total.',
      'Em caso de cancelamento com menos de 24 horas, desistência ou não comparecimento, o sinal não será reembolsado.',
      'Ao realizar o agendamento, você concorda com esta política.',
    ],
    signature: 'Studio Lívia Beauty',
    agree: 'Li e concordo com a política de agendamento e cancelamento.',
  },

  gallery: {
    id: 'trabalhos',
    title: 'Meus trabalhos',
    items: [
      { photo: unsplash('photo-1610992015762-45dca7fa3a85', 'Mão com unhas em tom rosa claro', { width: 800, height: 800 }) },
      { photo: unsplash('photo-1612887390768-fb02affea7a6', 'Unhas em rosa suave sobre tecido branco', { width: 800, height: 800 }) },
      { photo: unsplash('photo-1630843599725-32ead7671867', 'Unhas em branco leitoso com acabamento delicado', { width: 800, height: 800 }) },
      { photo: unsplash('photo-1607779097040-26e80aa78e66', 'Unhas em malva, branco e prata com brilho', { width: 800, height: 800 }) },
    ],
  },

  faq: {
    title: 'Dúvidas frequentes',
    items: [
      {
        q: 'Como faço para agendar?',
        a: 'Toque em Agendamento ou no serviço que você quer, escolha o dia e o horário livres e envie o sinal de 30% pelo Pix. A confirmação é pelo WhatsApp, com o comprovante.',
      },
      { q: 'Qual o horário de atendimento?', a: 'De segunda a sábado, das 9h às 19h, com pausa das 12h às 13h.' },
      { q: 'Quanto tempo dura cada serviço?', a: 'A duração e o valor de cada um estão em Serviços e valores.' },
      { q: 'Onde fica o studio?', a: 'Toque em Como chegar para abrir a localização no mapa.' },
    ],
  },

  schedule: { day: 'Seg a Sáb', time: '9h às 19h' },

  services: [
    {
      category: 'Unhas',
      items: [
        { name: 'Alongamento em gel', minutes: 120, price: 150, description: 'Aplicação com molde ou tip, cutilagem e esmaltação inclusas.' },
        { name: 'Manutenção em gel', minutes: 90, price: 110 },
        { name: 'Esmaltação em gel', minutes: 45, price: 55 },
      ],
    },
    {
      category: 'Sobrancelhas',
      items: [
        { name: 'Design personalizado', minutes: 40, price: 35, description: 'Modelagem sob medida para valorizar o formato do rosto.' },
        { name: 'Design com henna', minutes: 60, price: 45 },
      ],
    },
    {
      category: 'Cílios',
      items: [
        { name: 'Extensão em tufos', minutes: 60, price: 80 },
        { name: 'Lash lifting', minutes: 60, price: 90, description: 'Curvatura e alongamento dos cílios naturais, sem extensão.' },
      ],
    },
  ],

  pages: {
    servicos: {
      meta: {
        title: 'Serviços e valores · Lívia Martins',
        description: 'Unhas, sobrancelhas e cílios com Lívia Martins: duração, valores e agendamento online.',
      },
      title: 'Serviços',
      titleAccent: 'e valores',
      subtitle: 'Toque no serviço para escolher o dia e o horário.',
    },
    agendar: {
      meta: {
        title: 'Agendar horário · Lívia Martins',
        description: 'Escolha o serviço, o dia e o horário livres e garanta seu atendimento.',
      },
      title: 'Agendar',
      titleAccent: 'horário',
      subtitle: 'Escolha o dia e o horário livres. O horário fica garantido com o sinal de 30% pelo Pix.',
    },
  },

  contact: {
    whatsapp: { number: '', message: 'Olá, Lívia! Vim pelo seu site.' },
    booking: { url: '', message: '' },
    instagram: { handle: '' },
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  social: { title: 'Acompanhe meu trabalho', channels: ['instagram', 'whatsapp', 'location'] },

  footer: {
    demoNote: 'Modelo demonstrativo: nomes, valores, contatos e fotos são ilustrativos.',
  },
};
