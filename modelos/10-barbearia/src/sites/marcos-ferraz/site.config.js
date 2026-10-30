/**
 * Modelo 10 · Barbearia — demonstração: Marcos Ferraz · Ferraz Barber Club (marca fictícia)
 *
 * Maquete: nomes, valores, contatos, endereço, textos e fotos são ilustrativos. Para um cliente
 * real, copie esta pasta do modelo para `clientes/<cliente>` e edite o site.config.js dele.
 *
 * DESTINOS PENDENTES: campos vazios ('') viram botões que avisam "destino ainda não configurado".
 * WHATSAPP: o número abaixo é fictício (DDD 00). Troque pelo do cliente.
 */

/**
 * Foto do Unsplash recortada e convertida para webp pelo servidor de imagens, com `srcset`.
 * `crop`: 'faces' (foco no rosto), 'entropy' (parte mais detalhada) ou 'center'.
 */
const unsplash = (id, alt, { width, height, crop = 'faces' }) => {
  const url = (w) =>
    `https://images.unsplash.com/${id}?auto=format&fm=webp&fit=crop&crop=${crop}&w=${w}&h=${Math.round((w * height) / width)}&q=72`;
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
  id: 'marcos-ferraz',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Marcos Ferraz · Ferraz Barber Club',
    description: 'Corte, barba e combos com Marcos Ferraz, barbeiro no Rio de Janeiro. Serviços, valores e agendamento pelo WhatsApp.',
    themeColor: '#2a1606',
    siteUrl: 'https://biosite-10-barbearia.vercel.app',
    ogImage: 'https://images.unsplash.com/photo-1693756222572-23e251a7737d?auto=format&fit=crop&crop=faces&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Great+Vibes&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,800;1,800&display=swap',
    // Paleta café e âmbar do modelo (src/styles/tokens.css). Para um cliente, sobrescreva aqui as variáveis.
    tokens: {},
  },

  brand: {
    firstName: 'Marcos',
    lastName: 'Ferraz',
    name: 'Ferraz Barber Club',
    kicker: 'Barbeiro · RJ',
  },

  hero: {
    photo: unsplash('photo-1693756222572-23e251a7737d', 'Barbeiro de barba apontando a tesoura para a câmera', { width: 1000, height: 1250 }),
  },

  // Cards grandes do início. `art` põe uma ilustração 3D (PNG sem fundo) no lugar da foto.
  // Calendário: 31 imagens (uma por dia) geradas no Blender por scripts/blender/calendario.py;
  // `{dia}` vira o dia de hoje. Outras cores: rode o script com --base, --folha e --dourado.
  cards: [
    {
      id: 'agendar',
      art: '/media/calendario/{dia}.png',
      title: 'Agende seu corte',
      text: 'Escolha o melhor horário e garanta sua cadeira sem fila.',
      button: 'Agende seu horário',
      action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Marcos! Quero agendar um horário.' },
    },
    {
      id: 'estilo',
      title: 'Estilo e tendências',
      text: 'Degradê, pompadour, texturizado: veja os cortes da semana.',
      button: 'Saiba mais',
      photo: unsplash('photo-1582771498000-8ad44e6c84db', 'Barbeiro finalizando um topete com pomada', { width: 520, height: 600, crop: 'entropy' }),
      action: { type: 'section', target: 'cortes' },
    },
    {
      id: 'servicos',
      title: 'Serviços e valores',
      text: 'Corte, barba, combos e pigmentação, com duração e valor.',
      button: 'Ver valores',
      badge: 'scissors', // selo laranja no canto (nome de um ícone de icons.js)
      photo: unsplash('photo-1589985494639-69e60c82cab2', 'Barbeiro de luvas laranja fazendo degradê na máquina', { width: 520, height: 600, crop: 'entropy' }),
      action: { type: 'page', href: '/servicos/' },
    },
    {
      id: 'espaco',
      title: 'Conheça o espaço',
      text: 'Cadeira de couro, café passado na hora e ar-condicionado.',
      button: 'Como chegar',
      photo: unsplash('photo-1702865272115-5afdbae975af', 'Cadeira de barbeiro em couro marrom capitonê', { width: 520, height: 600, crop: 'entropy' }),
      action: { type: 'section', target: 'espaco' },
    },
  ],

  about: {
    id: 'sobre',
    kicker: 'O barbeiro',
    title: 'Sobre o',
    titleAccent: 'Marcos',
    paragraphs: [
      'Barbeiro há mais de dez anos, Marcos Ferraz começou cortando o cabelo dos amigos do bairro e hoje comanda o Ferraz Barber Club, no Rio.',
      'Do clássico na tesoura ao degradê na navalha, cada corte é pensado para o seu rosto e para o seu dia a dia. Tudo com hora marcada, sem pressa e sem fila.',
    ],
    highlights: [
      { value: '10+', label: 'anos de navalha' },
      { value: 'Ter a Sáb', label: 'de portas abertas' },
      { value: 'Zero', label: 'fila com hora marcada' },
    ],
  },

  gallery: {
    id: 'cortes',
    kicker: 'Estilo e tendências',
    title: 'Cortes da semana',
    items: [
      { caption: 'Degradê', photo: unsplash('photo-1640301133857-c4bc5789c1bb', 'Cliente cortando o cabelo com o barbeiro de boné', { width: 600, height: 720, crop: 'entropy' }) },
      { caption: 'Pompadour', photo: unsplash('photo-1640301133543-41fe25ad6450', 'Barbeiro modelando o topete de um cliente', { width: 600, height: 720, crop: 'entropy' }) },
      { caption: 'Na tesoura', photo: unsplash('photo-1703792685152-d13e206924d8', 'Barbeiro tatuado cortando o cabelo de um menino na tesoura', { width: 600, height: 720, crop: 'entropy' }) },
      { caption: 'Acabamento', photo: unsplash('photo-1703792686667-7486746389a1', 'Barbeiro fazendo o acabamento de um corte na cadeira', { width: 600, height: 720, crop: 'entropy' }) },
    ],
    more: { label: 'Mais cortes no Instagram', action: { type: 'channel', channel: 'instagram' } },
  },

  space: {
    id: 'espaco',
    kicker: 'O espaço',
    title: 'Ferraz Barber Club',
    photo: unsplash('photo-1773904215697-e6c21fc27ac2', 'Salão da barbearia com cadeiras de couro e luz dourada', { width: 900, height: 600, crop: 'center' }),
    perks: ['Ar-condicionado', 'Café e cerveja gelada', 'Wi-Fi', 'Estacionamento perto'],
    address: 'Rua Exemplo, 000 · Tijuca, Rio de Janeiro',
  },

  cta: {
    title: 'Bora dar um trato no visual?',
    text: 'Chama no WhatsApp e reserva seu horário.',
    label: 'Chamar no WhatsApp',
    action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Marcos! Quero agendar um horário.' },
  },

  schedule: [
    { day: 'Ter a Sex', time: '9h às 20h' },
    { day: 'Sábado', time: '8h às 18h' },
    { day: 'Dom e Seg', time: 'Fechado' },
  ],

  // Página /servicos/: tocar no serviço abre o WhatsApp com o nome e o valor dele.
  services: [
    {
      category: 'Cabelo',
      items: [
        { name: 'Corte masculino', minutes: 40, price: 45, description: 'Tesoura e máquina, lavagem e finalização.' },
        { name: 'Degradê', minutes: 45, price: 50, description: 'Low, mid ou high fade, com navalha no acabamento.' },
        { name: 'Corte infantil', minutes: 30, price: 35, description: 'Até 10 anos.' },
        { name: 'Pezinho', minutes: 15, price: 15, description: 'Contorno e acabamento entre um corte e outro.' },
      ],
    },
    {
      category: 'Barba',
      items: [
        { name: 'Barba completa', minutes: 30, price: 35, description: 'Toalha quente, navalha e balm.' },
        { name: 'Barboterapia', minutes: 45, price: 50, description: 'Esfoliação, toalha quente, navalha e hidratação.' },
        { name: 'Sobrancelha na navalha', minutes: 10, price: 15 },
      ],
    },
    {
      category: 'Combos',
      items: [
        { name: 'Corte + barba', minutes: 70, price: 75, tag: 'Mais pedido', description: 'O clássico da casa, com toalha quente.' },
        { name: 'Degradê + barba', minutes: 75, price: 80 },
        { name: 'Corte + barba + sobrancelha', minutes: 80, price: 85 },
      ],
    },
    {
      category: 'Química e tratamento',
      items: [
        { name: 'Pigmentação de barba', minutes: 30, price: 30, description: 'Preenche falhas e uniformiza a cor.' },
        { name: 'Pigmentação de cabelo', minutes: 30, price: 35 },
        { name: 'Hidratação', minutes: 20, price: 25 },
        { name: 'Platinado', minutes: 120, price: 150, from: true, description: 'Valor final depende do comprimento do cabelo.' },
      ],
    },
  ],

  pages: {
    servicos: {
      meta: {
        title: 'Serviços e valores · Marcos Ferraz',
        description: 'Corte, barba, combos e pigmentação com Marcos Ferraz: duração, valores e agendamento pelo WhatsApp.',
      },
      title: 'Serviços',
      titleAccent: 'e valores',
      subtitle: 'Toque no serviço para agendar pelo WhatsApp.',
      // Mensagem enviada ao tocar num serviço; {servico} e {valor} são trocados pelos dados dele.
      message: 'Olá, Marcos! Quero agendar: {servico} ({valor}). Qual horário você tem?',
    },
  },

  contact: {
    whatsapp: { number: WHATSAPP, message: 'Olá, Marcos! Vim pelo seu site.' },
    booking: { url: '', message: '' },
    instagram: { handle: '' },
    website: { url: '' },
    location: { address: 'Tijuca, Rio de Janeiro - RJ', mapsUrl: '' },
  },

  social: { title: 'Acompanhe', channels: ['instagram', 'whatsapp', 'location'] },

  footer: {
    demoNote: 'Modelo demonstrativo: nomes, valores, contatos, endereço e fotos são ilustrativos.',
  },
};
