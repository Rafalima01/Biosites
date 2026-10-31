/**
 * Modelo 13 · Imobiliária — demonstração: Rafael Monteiro · Corretor de Imóveis (marca fictícia)
 *
 * Maquete: nome, CRECI, contatos, endereço, imóveis, valores e fotos são ilustrativos. Para um corretor
 * real, copie esta pasta do modelo para `clientes/<cliente>` e edite o site.config.js dele.
 *
 * CRECI: a divulgação de corretor deve trazer o número do CRECI (aparece no topo, no rodapé e no catálogo).
 * DESTINOS PENDENTES: campos vazios ('') viram botões que avisam "destino ainda não configurado".
 * WHATSAPP: fictício (DDD 00). Troque pelo do corretor.
 */

/**
 * Foto do Unsplash recortada e convertida para webp pelo servidor de imagens, com `srcset`.
 * `crop`: 'faces' (foco no rosto), 'entropy' (parte mais detalhada) ou 'center'.
 */
const unsplash = (id, alt, { width, height, crop = 'entropy' }) => {
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
const casa = (id, alt) => unsplash(id, alt, { width: 640, height: 440 });

export default {
  id: 'rafael-monteiro',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Rafael Monteiro · Corretor de Imóveis',
    description: 'Consultoria imobiliária, catálogo de imóveis e visitas com Rafael Monteiro, corretor de imóveis. Fale pelo WhatsApp.',
    themeColor: '#1f5fae',
    siteUrl: 'https://biosite-13-imobiliaria.vercel.app',
    ogImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
    // Paleta azul, laranja e verde do modelo (src/styles/tokens.css). Para um corretor, sobrescreva aqui.
    tokens: {},
  },

  brand: {
    name: 'Rafael Monteiro',
    role: 'Corretor de Imóveis',
    creci: 'CRECI 00000-F',
  },

  // Topo: foto recortada do corretor, nome, CRECI, frase e botão do WhatsApp.
  intro: {
    photo: { src: '/media/corretor-casa.webp', alt: 'Rafael Monteiro, corretor de imóveis, segurando a maquete de uma casa', width: 560, height: 820 },
    title: 'Seu imóvel ideal começa aqui',
    text: 'Compra, venda e locação com atendimento próximo, do primeiro contato até a entrega das chaves.',
    button: 'Fale comigo',
    action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Rafael! Vim pelo seu site e gostaria de atendimento.' },
  },

  // Foto aérea clarinha ao fundo do card de visitas.
  visitsBackground: unsplash('photo-1765106893273-980e5bf89a7c', '', { width: 420, height: 300 }),

  // Os quatro cards do print, na ordem.
  cards: {
    consultoria: {
      title: ['Consultoria', 'Imobiliária'],
      text: 'Agende **consultoria imobiliária** para **investimentos** personalizados.',
      action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Rafael! Gostaria de agendar uma consultoria imobiliária.' },
    },
    catalogo: {
      title: ['Catálogos', 'de Imóveis'],
      text: 'Mais informações **via WhatsApp**',
      action: { type: 'page', href: '/imoveis/' },
    },
    contato: {
      title: ['Contato e', 'WhatsApp'],
      text: 'Entre em contato conosco ou envie uma mensagem pelo WhatsApp.',
      action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Rafael! Vim pelo seu site.' },
    },
    visitas: {
      // Quebra igual à do print ("Agenda / mentos / e visitas"); o leitor de tela lê o título inteiro.
      title: ['Agenda', 'mentos', 'e visitas'],
      label: 'Agendamentos e visitas',
      text: '**Agende sua visita** para conhecer os **imóveis disponíveis**.',
      action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Rafael! Gostaria de agendar uma visita a um imóvel.' },
    },
  },

  about: {
    id: 'sobre',
    kicker: 'Sobre mim',
    title: 'Prazer, eu sou o',
    titleAccent: 'Rafael',
    photo: unsplash('photo-1758519288445-5847dd89f313', 'Rafael Monteiro ao telefone, no escritório', { width: 600, height: 760, crop: 'faces' }),
    paragraphs: [
      'Sou corretor de imóveis há mais de 10 anos em São Paulo e ajudo famílias e investidores a comprar, vender e alugar com segurança.',
      'Cuido de cada etapa com você: da busca do imóvel certo à negociação, à documentação e à entrega das chaves.',
    ],
    topics: ['Compra', 'Venda', 'Locação', 'Lançamentos', 'Investimento', 'Financiamento'],
  },

  steps: {
    kicker: 'Como funciona',
    title: 'Do primeiro contato às chaves',
    items: [
      { n: '1', title: 'Conte o que procura', text: 'Pelo WhatsApp: bairro, tamanho, orçamento e prazo.' },
      { n: '2', title: 'Visite os imóveis', text: 'Eu seleciono as melhores opções e agendo as visitas com você.' },
      { n: '3', title: 'Negociação e documentos', text: 'Acompanho a proposta, o financiamento e o contrato até o fim.' },
    ],
  },

  local: {
    id: 'local',
    kicker: 'Atendimento',
    title: 'Escritório e visitas',
    address: 'Rua Exemplo, 000 · Moema, São Paulo - SP',
    online: 'Atendimento por WhatsApp e videochamada para quem está longe.',
  },

  schedule: [
    { day: 'Seg a Sex', time: '9h às 19h' },
    { day: 'Sábado', time: '9h às 14h' },
    { day: 'Domingo', time: 'Visitas agendadas' },
  ],

  cta: {
    title: 'Vamos encontrar seu imóvel?',
    text: 'Me conte o que você procura e eu separo as melhores opções.',
    label: 'Falar pelo WhatsApp',
    action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Rafael! Estou procurando um imóvel.' },
  },

  // Página /imoveis/ (catálogo): tocar no imóvel abre o WhatsApp com o código e o nome dele.
  properties: [
    { code: 'RM-101', title: 'Casa moderna com piscina', place: 'Alphaville, Barueri', deal: 'Venda', price: 'R$ 2.890.000', beds: 4, baths: 5, parking: 4, area: 420, photo: casa('photo-1580587771525-78b9dba3b914', 'Casa moderna branca com piscina') },
    { code: 'RM-102', title: 'Casa térrea com jardim', place: 'Granja Viana, Cotia', deal: 'Venda', price: 'R$ 1.150.000', beds: 3, baths: 3, parking: 2, area: 210, photo: casa('photo-1628133287836-40bd5453bed1', 'Casa branca com gramado e árvores') },
    { code: 'RM-103', title: 'Sobrado de alto padrão', place: 'Moema, São Paulo', deal: 'Venda', price: 'R$ 3.400.000', beds: 4, baths: 4, parking: 3, area: 380, photo: casa('photo-1613977257363-707ba9348227', 'Sobrado branco moderno com piscina') },
    { code: 'RM-104', title: 'Casa clássica com varanda', place: 'Campo Belo, São Paulo', deal: 'Locação', price: 'R$ 9.500/mês', beds: 3, baths: 2, parking: 2, area: 190, photo: casa('photo-1570129477492-45c003edd2be', 'Casa clássica branca com varanda') },
    { code: 'RM-105', title: 'Casa contemporânea', place: 'Brooklin, São Paulo', deal: 'Venda', price: 'R$ 1.980.000', beds: 3, baths: 4, parking: 2, area: 260, photo: casa('photo-1600596542815-ffad4c1539a9', 'Casa contemporânea branca sob céu azul') },
    { code: 'RM-106', title: 'Casa com área gourmet', place: 'Vila Mariana, São Paulo', deal: 'Locação', price: 'R$ 7.800/mês', beds: 3, baths: 3, parking: 2, area: 230, photo: casa('photo-1605276374104-dee2a0ed3cd6', 'Casa marrom e branca sob céu azul') },
  ],

  pages: {
    imoveis: {
      meta: {
        title: 'Imóveis · Rafael Monteiro',
        description: 'Casas e apartamentos à venda e para locação em São Paulo, com Rafael Monteiro, corretor de imóveis.',
      },
      title: 'Catálogo de',
      titleAccent: 'Imóveis',
      subtitle: 'Toque no imóvel para receber fotos, planta e mais informações pelo WhatsApp.',
      // {imovel} é trocado pelo código e nome do imóvel tocado.
      message: 'Olá, Rafael! Tenho interesse no imóvel {imovel}. Pode me mandar mais informações?',
    },
  },

  contact: {
    whatsapp: { number: WHATSAPP, message: 'Olá, Rafael! Vim pelo seu site.' },
    booking: { url: '', message: '' },
    instagram: { handle: '' },
    website: { url: '' },
    location: { address: 'Moema, São Paulo - SP', mapsUrl: '' },
  },

  social: { title: 'Acompanhe', channels: ['instagram', 'whatsapp', 'location'] },

  footer: {
    demoNote: 'Modelo demonstrativo: nome, CRECI, contatos, imóveis, valores e fotos são ilustrativos.',
    credits: '',
  },
};
