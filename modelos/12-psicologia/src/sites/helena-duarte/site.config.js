/**
 * Modelo 12 · Psicologia — demonstração: Helena Duarte · Psicóloga (marca fictícia)
 *
 * Maquete: nome, CRP, contatos, endereço, textos e fotos são ilustrativos. Para uma cliente real,
 * copie esta pasta do modelo para `clientes/<cliente>` e edite o site.config.js dela.
 *
 * CÓDIGO DE ÉTICA (CFP, art. 20): na divulgação aparecem o nome e o CRP, e o preço não é usado como
 * propaganda — por isso a página de atendimentos não mostra valores (são combinados pelo WhatsApp).
 * DESTINOS PENDENTES: campos vazios ('') viram botões que avisam "destino ainda não configurado".
 * WHATSAPP: fictício (DDD 00). Troque pelo da cliente.
 */

/**
 * Foto do Unsplash recortada e convertida para webp pelo servidor de imagens, com `srcset`.
 * `crop`: 'faces' (foco no rosto), 'entropy' (parte mais detalhada) ou 'center'.
 */
const unsplash = (id, alt, { width, height, crop = 'faces' }) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fm=webp&fit=crop&crop=${crop}&w=${w}&h=${Math.round((w * height) / width)}&q=74`;
  return {
    src: url(width),
    srcset: [Math.round(width / 2), width].map((w) => `${url(w)} ${w}w`).join(', '),
    alt,
    width,
    height,
  };
};

const WHATSAPP = '+55 00 90000-0000';

export default {
  id: 'helena-duarte',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Helena Duarte · Psicóloga',
    description: 'Psicoterapia online e presencial com Helena Duarte, psicóloga. Atendimentos, abordagens e agendamento pelo WhatsApp.',
    themeColor: '#f4eee7',
    siteUrl: 'https://biosite-12-psicologia.vercel.app',
    ogImage: 'https://images.unsplash.com/photo-1684262855358-88f296a2cfc2?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Gluten:wght@700&family=Poppins:wght@400;500;600;700;800&display=swap',
    // Paleta bege, marrom e azul-marinho do modelo (src/styles/tokens.css). Para uma cliente, sobrescreva aqui.
    tokens: {},
  },

  brand: {
    name: 'Helena Duarte',
    role: 'Psicóloga',
    crp: 'CRP 00/00000',
  },

  // Card de abertura (bege): foto, nome com Ψ, título e botão de agendar.
  intro: {
    photo: unsplash('photo-1684262855358-88f296a2cfc2', 'Psicóloga sorrindo, de blazer branco e blusa azul', { width: 520, height: 720 }),
    title: 'Agendamento Online',
    button: 'Agende sua Consulta',
    action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Helena! Gostaria de agendar uma consulta.' },
  },

  // Card "Saúde Mental" (bege): frase grande com o cérebro 3D e as margaridas.
  therapies: {
    big: ['Saúde', 'Mental'],
    title: 'Terapias & Abordagens',
    text: 'Explore as diversas abordagens **terapêuticas** para promover seu **bem-estar emocional.**',
    action: { type: 'page', href: '/servicos/' },
  },

  // Card do Instagram (no print, "Visite nosso Blog"): selo em duas linhas, título e papel rasgado.
  content: {
    badge: ['Saúde Mental em', 'Primeiro Lugar'],
    title: 'Visite nosso Instagram',
    text: 'Acesse nosso Instagram e encontre dicas e conteúdos sobre saúde mental e emocional.',
    action: { type: 'channel', channel: 'instagram' },
  },

  // Card da localização: bilhete com o cérebro preso por tachinha e o horário no papel rasgado.
  place: {
    note: 'Atendemos até às',
    hour: '19h',
    title: 'Estamos Localizados',
    text: 'Estamos na Vila Mariana (SP), seu espaço seguro para cuidar da saúde mental.',
    action: { type: 'section', target: 'local' },
  },

  about: {
    id: 'sobre',
    kicker: 'Sobre mim',
    title: 'Olá, eu sou a',
    titleAccent: 'Helena',
    photo: unsplash('photo-1684262855355-7e3ff866e6a6', 'Retrato da psicóloga Helena Duarte', { width: 600, height: 760 }),
    paragraphs: [
      'Sou psicóloga clínica e atendo adolescentes e adultos que querem compreender melhor suas emoções e construir uma vida com mais equilíbrio.',
      'Meu trabalho é oferecer um espaço seguro, sem julgamentos, para você falar do que sente no seu tempo.',
    ],
    topics: ['Ansiedade', 'Autoestima', 'Relacionamentos', 'Luto', 'Estresse no trabalho', 'Autoconhecimento'],
  },

  steps: {
    kicker: 'Como funciona',
    title: 'Seu primeiro passo',
    items: [
      { n: '1', title: 'Mande uma mensagem', text: 'Pelo WhatsApp, a gente encontra o melhor dia e horário.' },
      { n: '2', title: 'Primeira sessão', text: 'Um encontro para nos conhecermos e entender o que você busca.' },
      { n: '3', title: 'Acompanhamento', text: 'Sessões semanais de 50 minutos, online ou presenciais.' },
    ],
  },

  local: {
    id: 'local',
    kicker: 'Atendimento',
    title: 'Online e presencial',
    address: 'Rua Exemplo, 000 · Vila Mariana, São Paulo - SP',
    online: 'Sessões online por videochamada, de qualquer lugar.',
  },

  schedule: [
    { day: 'Seg a Sex', time: '8h às 19h' },
    { day: 'Sábado', time: '8h às 12h' },
    { day: 'Domingo', time: 'Fechado' },
  ],

  cta: {
    title: 'Que tal começar hoje?',
    text: 'Mande uma mensagem e agende sua primeira sessão.',
    label: 'Agendar pelo WhatsApp',
    action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Helena! Gostaria de agendar uma consulta.' },
  },

  // Página /servicos/ (atendimentos): sem valores (CFP); tocar abre o WhatsApp com o nome do atendimento.
  services: [
    {
      category: 'Psicoterapia',
      items: [
        { name: 'Psicoterapia individual (adultos)', minutes: 50, description: 'Sessões semanais para ansiedade, autoestima, relacionamentos e outras questões.' },
        { name: 'Psicoterapia para adolescentes', minutes: 50, description: 'A partir de 13 anos, com conversas periódicas com os responsáveis.' },
        { name: 'Terapia de casal', minutes: 80, description: 'Comunicação, conflitos e decisões a dois.' },
      ],
    },
    {
      category: 'Formatos',
      items: [
        { name: 'Sessão online', minutes: 50, tag: 'Todo o Brasil', description: 'Por videochamada, com o mesmo cuidado do consultório.' },
        { name: 'Sessão presencial', minutes: 50, description: 'No consultório, na Vila Mariana, em São Paulo.' },
        { name: 'Primeira conversa', minutes: 30, description: 'Para tirar dúvidas sobre o processo terapêutico antes de começar.' },
      ],
    },
  ],

  pages: {
    servicos: {
      meta: {
        title: 'Atendimentos · Helena Duarte',
        description: 'Psicoterapia individual, para adolescentes e de casal, online e presencial, com Helena Duarte.',
      },
      title: 'Terapias &',
      titleAccent: 'Abordagens',
      subtitle: 'Toque no atendimento para conversar pelo WhatsApp. Os valores são informados por mensagem.',
      // {servico} é trocado pelo nome do atendimento tocado.
      message: 'Olá, Helena! Gostaria de saber mais sobre: {servico}.',
    },
  },

  contact: {
    whatsapp: { number: WHATSAPP, message: 'Olá, Helena! Vim pelo seu site.' },
    booking: { url: '', message: '' },
    instagram: { handle: '' },
    website: { url: '' },
    location: { address: 'Vila Mariana, São Paulo - SP', mapsUrl: '' },
  },

  social: { title: 'Acompanhe', channels: ['instagram', 'whatsapp', 'location'] },

  footer: {
    demoNote: 'Modelo demonstrativo: nome, CRP, contatos, endereço e fotos são ilustrativos.',
    // Crédito exigido pela licença do cérebro 3D (CC BY-SA 4.0); mantenha enquanto usar a imagem.
    credits: 'Cérebro 3D a partir do modelo de Nevit Dilmen (NIH 3D), licença CC BY-SA 4.0.',
  },
};
