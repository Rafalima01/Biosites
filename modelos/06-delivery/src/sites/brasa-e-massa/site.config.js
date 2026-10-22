/**
 * Modelo 06 · Delivery — demonstração: Brasa & Massa Pizza (marca fictícia)
 *
 * Todo o conteúdo, links, imagens, horários e ajustes de tema deste bio site
 * vivem aqui. Para criar um novo cliente com este modelo, duplique esta pasta,
 * edite este arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * O botão continua visível, mas ao ser acionado mostra um aviso em vez de abrir
 * um link inventado.
 *
 * CONTEÚDO DEMONSTRATIVO: `demo: true` exibe um aviso no rodapé de que marca,
 * horários e fotos são ilustrativos. Desligue apenas com dados reais.
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

export default {
  id: 'brasa-e-massa',
  lang: 'pt-BR',
  demo: true,

  meta: {
    title: 'Brasa & Massa Pizza · Delivery Jardins',
    description:
      'Brasa & Massa Pizza — pizza artesanal, borda alta e forno a lenha, entregue quente na sua casa. Peça pelo app, pelo cardápio digital ou pelo WhatsApp.',
    themeColor: '#1a1512',
    // Domínio final (ex.: 'https://brasaemassa.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: 'https://images.unsplash.com/photo-1682264788192-9abdec90c425?auto=format&fit=crop&w=1200&h=630&q=78',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&family=Barlow:wght@400;500;600&family=Cinzel:wght@700;800&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    name: 'Brasa & Massa Pizza',
    subtitle: 'Delivery · Jardins',
    description: 'Pizza artesanal, borda alta e forno a lenha, entregue quente na sua casa.',
    unit: 'Unidade Jardins',
    legalName: 'Brasa & Massa Pizzaria',
    // Selo circular gerado em SVG. Para usar o logotipo do cliente, informe `logo.src` (e `logo.alt`).
    logo: { src: '', top: 'Brasa & Massa', middle: 'Pizza', band: 'Delivery' },
  },

  // Horário de funcionamento: o selo mostra "Aberto agora" / "Fechado agora" no fuso indicado.
  // `days`: 0 = domingo … 6 = sábado. Horário de fechamento menor que o de abertura = passa da meia-noite.
  hours: {
    label: 'Delivery todos os dias',
    days: [0, 1, 2, 3, 4, 5, 6],
    open: '18:00',
    close: '23:45',
    timeZone: 'America/Sao_Paulo',
  },

  // Carrossel de sabores no topo.
  slides: [
    { title: 'Margherita de búfala', tag: 'Tradicional', image: unsplash('photo-1682264788192-9abdec90c425', 'Pizza margherita com muçarela de búfala e manjericão') },
    { title: 'Pepperoni crocante', tag: 'Especial', image: unsplash('photo-1669895616443-5d21d5acc6e0', 'Pizza de pepperoni com tomates frescos') },
    { title: 'Calabresa com cebola roxa', tag: 'Tradicional', image: unsplash('photo-1655673654158-9f7285b7d1ea', 'Pizza de calabresa com cebola roxa sobre tábua') },
    { title: 'Frango com cogumelos', tag: 'Especial', image: unsplash('photo-1717883235373-ef10b2a745a3', 'Pizza de frango com cogumelos sobre tábua de madeira') },
    { title: 'Chocolate com caramelo', tag: 'Doce', image: unsplash('photo-1708649783218-b2b9a8781724', 'Pizza doce de chocolate com fios de caramelo') },
  ],

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá! Vim pelo site e gostaria de fazer um pedido.',
    },
    booking: { url: '', message: '' },
    instagram: { handle: '' }, // Ex.: 'brasaemassa'
    website: { url: '' },
    location: {
      address: '', // Ex.: 'Rua Exemplo, 123 - Jardins, São Paulo - SP'
      mapsUrl: '',
    },
  },

  // Botões de pedido. `tone`: 'red' | 'yellow' | 'dark' | 'green'.
  // Em `text`, use {address} ou {whatsapp} para mostrar os dados de `contact` automaticamente.
  links: [
    {
      id: 'app-delivery',
      tone: 'red',
      icon: 'bag',
      eyebrow: 'Peça no iFood',
      title: 'Faça seu pedido',
      action: { type: 'url', href: '', label: 'iFood' },
    },
    {
      id: 'cardapio',
      tone: 'yellow',
      icon: 'menu',
      eyebrow: 'Peça no cardápio digital',
      title: 'Faça seu pedido',
      text: 'Pedido direto com a pizzaria, rápido e sem complicação.',
      action: { type: 'url', href: '', label: 'Cardápio digital' },
    },
    {
      id: 'endereco',
      tone: 'dark',
      icon: 'pin',
      eyebrow: 'Nosso endereço',
      title: 'Como chegar',
      text: '{address}',
      hint: 'Toque para abrir no Google Maps',
      action: { type: 'channel', channel: 'location' },
    },
    {
      id: 'whatsapp',
      tone: 'green',
      icon: 'whatsapp',
      eyebrow: 'WhatsApp',
      title: 'Fale com a gente',
      text: '{whatsapp}Dúvidas, encomendas e eventos.',
      action: { type: 'channel', channel: 'whatsapp' },
    },
  ],

  footer: {
    links: ['instagram', 'whatsapp', 'website'],
    demoNote: 'Modelo demonstrativo: marca fictícia; horários, sabores e fotos são ilustrativos.',
  },
};
