/**
 * Modelo 07 · Hospedagem — demonstração: Maré Mansa · Casas de temporada (marca fictícia)
 *
 * Site de reserva direta para quem aluga casas por temporada (Airbnb, Booking,
 * Instagram). Todo o conteúdo, as casas, os preços, a agenda e os pacotes vivem
 * aqui. Para criar um novo cliente, duplique esta pasta, edite este arquivo e
 * aponte `src/sites/index.js` para a nova pasta.
 *
 * AGENDA: datas no formato 'AAAA-MM-DD'. Cada reserva é [check-in, check-out]:
 * o dia do check-out fica livre para uma nova entrada.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que marca,
 * casas, preços, depoimentos e fotos são ilustrativos. Desligue apenas com dados reais.
 */

/**
 * Foto do Unsplash recortada pelo servidor de imagens com `srcset`.
 * Para fotos do cliente, use `{ src: '/media/arquivo.webp', alt, width, height }`.
 */
const unsplash = (id, alt, { ratio = 4 / 3, focus = 'center' } = {}) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${focus}&w=${w}&h=${Math.round(w / ratio)}&q=78`;
  return {
    src: url(800),
    srcset: [480, 800, 1200, 1600].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width: 800,
    height: Math.round(800 / ratio),
  };
};

/**
 * Só para a demonstração: data 'AAAA-MM-DD' a `dias` de hoje, para a agenda de
 * exemplo nunca ficar no passado. Em clientes reais, escreva as datas direto.
 */
const daqui = (dias) => {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export default {
  id: 'mare-mansa',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Maré Mansa · Casas de temporada em Imbassaí e Praia do Forte',
    description:
      'Casas pé na areia no Litoral Norte da Bahia. Veja fotos, agenda e valores e reserve direto com o anfitrião, sem taxa de plataforma.',
    themeColor: '#0f4352',
    // Domínio final (ex.: 'https://maremansa.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    name: 'Maré Mansa',
    tagline: 'Casas de temporada',
    legalName: 'Maré Mansa Temporada',
    region: 'Litoral Norte da Bahia',
  },

  hero: {
    eyebrow: 'Imbassaí · Praia do Forte · Bahia',
    title: 'Seu refúgio **pé na areia**',
    text: 'Casas com piscina a poucos passos do mar. Escolha a casa, veja a agenda e reserve direto com a gente.',
    badge: 'Reserva direta · sem taxa de plataforma',
    photo: unsplash('photo-1564013799919-ab600027ffc6', 'Casa de praia branca com piscina e coqueiros', { ratio: 4 / 5 }),
    stats: [
      { value: '3', label: 'casas' },
      { value: '4,9', label: 'avaliação média' },
      { value: '+600', label: 'hóspedes' },
    ],
  },

  // Casas. Preços em reais por noite; `weekendPrice` vale para as noites de sexta e sábado.
  // `bookings`: períodos já ocupados ([check-in, check-out]). `airbnbUrl` é opcional.
  houses: [
    {
      id: 'casa-coqueiros',
      name: 'Casa Coqueiros',
      location: 'Imbassaí, Bahia',
      tag: 'Mais reservada',
      summary: 'Casa térrea com piscina, deck e área gourmet, a 300 m da praia.',
      description:
        'Ideal para famílias grandes e grupos de amigos. Cinco suítes com ar-condicionado, sala integrada à área gourmet e um quintal gramado com piscina e espreguiçadeiras. A praia fica a cinco minutos de caminhada pela trilha do condomínio.',
      guests: 14,
      bedrooms: 5,
      baths: 6,
      price: 1290,
      weekendPrice: 1590,
      cleaningFee: 280,
      minNights: 2,
      amenities: ['Piscina', 'Wi-Fi', 'Ar-condicionado', 'Churrasqueira', 'Estacionamento (4 carros)', 'Roupa de cama e banho'],
      photos: [
        unsplash('photo-1564013799919-ab600027ffc6', 'Piscina da Casa Coqueiros cercada de coqueiros'),
        unsplash('photo-1600210492486-724fe5c67fb0', 'Sala de estar integrada e iluminada'),
        unsplash('photo-1616594039964-ae9021a400a0', 'Suíte com cama de casal e roupa de cama branca'),
      ],
      bookings: [
        [daqui(3), daqui(6)],
        [daqui(10), daqui(12)],
        [daqui(17), daqui(20)],
        [daqui(31), daqui(34)],
      ],
      airbnbUrl: '',
    },
    {
      id: 'casa-areia',
      name: 'Casa Areia',
      location: 'Praia do Forte, Bahia',
      tag: 'Novo',
      summary: 'Arquitetura moderna, piscina aquecida e varanda com rede.',
      description:
        'Casa nova, decorada em tons claros, com quatro suítes, cozinha completa e varanda com rede de frente para a piscina aquecida. Fica a dez minutos de carro da vila de Praia do Forte e do Projeto Tamar.',
      guests: 10,
      bedrooms: 4,
      baths: 5,
      price: 980,
      weekendPrice: 1190,
      cleaningFee: 220,
      minNights: 2,
      amenities: ['Piscina aquecida', 'Wi-Fi', 'Ar-condicionado', 'Cozinha completa', 'Pet friendly', 'Estacionamento (3 carros)'],
      photos: [
        unsplash('photo-1580587771525-78b9dba3b914', 'Fachada moderna da Casa Areia com piscina'),
        unsplash('photo-1600607687939-ce8a6c25118c', 'Sala com sofá claro e portas de vidro'),
        unsplash('photo-1505693416388-ac5ce068fe85', 'Quarto com cama de casal estofada e luz natural'),
      ],
      bookings: [
        [daqui(1), daqui(4)],
        [daqui(8), daqui(9)],
        [daqui(14), daqui(16)],
        [daqui(22), daqui(27)],
      ],
      airbnbUrl: '',
    },
    {
      id: 'bangalo-brisa',
      name: 'Bangalô Brisa',
      location: 'Imbassaí, Bahia',
      tag: 'Para casais',
      summary: 'Bangalô romântico com ofurô, cercado de mata e a 150 m do rio.',
      description:
        'Um refúgio para dois: suíte ampla com ofurô privativo, cozinha compacta e varanda cercada de mata. A poucos passos do encontro do rio com o mar, o cartão-postal de Imbassaí.',
      guests: 3,
      bedrooms: 1,
      baths: 1,
      price: 420,
      weekendPrice: 520,
      cleaningFee: 90,
      minNights: 2,
      amenities: ['Ofurô privativo', 'Wi-Fi', 'Ar-condicionado', 'Café da manhã opcional', 'Estacionamento'],
      photos: [
        unsplash('photo-1615880484746-a134be9a6ecf', 'Varanda de madeira do Bangalô Brisa com vista para a mata ao entardecer'),
        unsplash('photo-1631049307264-da0ec9d70304', 'Suíte do bangalô com cama de casal'),
        unsplash('photo-1506953823976-52e1fdc0149a', 'Coqueiro sobre a areia clara de frente para o mar'),
      ],
      bookings: [
        [daqui(2), daqui(4)],
        [daqui(7), daqui(11)],
        [daqui(15), daqui(17)],
        [daqui(24), daqui(26)],
      ],
      airbnbUrl: '',
    },
  ],

  // Períodos com preço diferenciado (substituem o preço normal e o de fim de semana).
  // `houses` vazio = vale para todas as casas. `markup`: 0.25 = 25% acima do preço normal.
  seasons: [{ label: 'Alta temporada', from: '2026-12-18', to: '2027-01-31', markup: 0.25, houses: [] }],

  // Pacotes de datas especiais: valor fechado. As noites do pacote saem da reserva avulsa.
  packages: [
    {
      id: 'reveillon-2027',
      tag: 'Réveillon',
      title: 'Virada pé na areia',
      house: 'casa-coqueiros',
      from: '2026-12-29',
      to: '2027-01-02',
      price: 12900,
      note: 'Inclui ceia para 14 pessoas e decoração da área da piscina.',
      photo: unsplash('photo-1467810563316-b5476525c0f9', 'Mãos segurando estrelinhas acesas ao anoitecer'),
    },
    {
      id: 'carnaval-2027',
      tag: 'Carnaval',
      title: 'Carnaval longe da muvuca',
      house: 'casa-areia',
      from: '2027-02-05',
      to: '2027-02-10',
      price: 8900,
      note: 'Cinco diárias com kit boas-vindas e late checkout.',
      photo: unsplash('photo-1492684223066-81342ee5ff30', 'Confetes caindo sobre a multidão em festa'),
    },
    {
      id: 'namorados-2027',
      tag: 'Dia dos Namorados',
      title: 'Escapada a dois',
      house: 'bangalo-brisa',
      from: '2027-06-11',
      to: '2027-06-13',
      price: 1490,
      note: 'Duas noites com café da manhã, espumante e ofurô decorado.',
      photo: unsplash('photo-1518199266791-5375a83190b7', 'Luzes desfocadas em formato de coração'),
    },
  ],

  // Estimativa de quanto o hóspede economiza sem a taxa de serviço de plataformas de reserva.
  // Ajuste conforme a taxa real cobrada nos anúncios do cliente; 0 esconde a economia.
  platformFee: 0.14,

  perks: {
    title: 'Por que reservar direto?',
    items: [
      { icon: 'tag', title: 'Sem taxa de plataforma', text: 'Você paga só a diária e a limpeza, sem taxa de serviço.' },
      { icon: 'chat', title: 'Fala direto com o anfitrião', text: 'Resposta pelo WhatsApp em até 10 minutos.' },
      { icon: 'gift', title: 'Kit boas-vindas', text: 'Água de coco, frutas da estação e cafés regionais na chegada.' },
      { icon: 'shield', title: 'Reserva garantida', text: 'Contrato simples, sinal de 30% e saldo no check-in.' },
    ],
  },

  testimonials: [
    { quote: 'Casa linda, impecável e com tudo que precisávamos. Reservar direto foi rápido e saiu mais barato.', name: 'Marina e Caio', origin: 'São Paulo · Casa Coqueiros' },
    { quote: 'O anfitrião respondeu na hora e deixou um kit de boas-vindas maravilhoso. Já marcamos a volta.', name: 'Família Andrade', origin: 'Belo Horizonte · Casa Areia' },
    { quote: 'O bangalô é um sonho. O ofurô à noite com o barulho do mar não tem preço.', name: 'Juliana R.', origin: 'Salvador · Bangalô Brisa' },
  ],

  faq: [
    { q: 'Como funciona a reserva direta?', a: 'Escolha a casa e as datas na agenda e envie a solicitação pelo WhatsApp. Confirmamos a disponibilidade, enviamos o contrato e a reserva é garantida com um sinal de 30%.' },
    { q: 'Os valores da agenda são finais?', a: 'São estimativas com diárias e taxa de limpeza. O valor final é confirmado no WhatsApp antes do pagamento.' },
    { q: 'Qual é o horário de check-in e check-out?', a: 'Check-in a partir das 14h e check-out até as 11h. Late checkout sob consulta.' },
    { q: 'As casas aceitam animais de estimação?', a: 'A Casa Areia é pet friendly. Nas demais, consulte antes de reservar.' },
    { q: 'A casa fornece roupa de cama e banho?', a: 'Sim, todas as casas entregam roupa de cama e toalhas de banho. Toalhas de piscina não estão incluídas.' },
    { q: 'É permitido realizar festas ou eventos?', a: 'Não são permitidas festas com som alto ou pessoas além do número de hóspedes da reserva.' },
    { q: 'Como é feito o pagamento?', a: 'Pix ou cartão de crédito em até 6x. Sinal de 30% na reserva e saldo até o check-in.' },
  ],

  contact: {
    whatsapp: {
      number: '', // Ex.: '5571999999999' (DDI + DDD + número)
      message: 'Olá! Vim pelo site e gostaria de saber mais sobre as casas.',
    },
    instagram: { handle: '' }, // Ex.: 'maremansa'
    airbnb: { url: '' }, // Perfil de anfitrião no Airbnb (opcional, reforça a confiança)
    website: { url: '' },
    location: {
      address: '', // Ex.: 'Rua das Palmeiras, 100 - Imbassaí, Mata de São João - BA'
      mapsUrl: '',
    },
  },

  footer: {
    links: ['instagram', 'whatsapp', 'airbnb'],
    demoNote: 'Modelo demonstrativo: marca fictícia; casas, valores, agenda, depoimentos e fotos são ilustrativos.',
  },
};
