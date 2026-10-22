/**
 * Bio site da agência Vertex Labs.
 *
 * Todo texto visível é bilíngue: `{ pt: '...', en: '...' }`. O português é
 * renderizado no HTML; o seletor PT/EN troca os textos no navegador.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado"
 * (o botão avisa em vez de abrir um link inventado).
 */

const MODELS = 'https://biosite-';

export default {
  id: 'vertex-labs',
  defaultLang: 'pt',
  defaultTheme: 'dark',

  meta: {
    title: { pt: 'Vertex Labs · Bio sites, landing pages e sistemas', en: 'Vertex Labs · Bio sites, landing pages and systems' },
    description: {
      pt: 'Vertex Labs — estratégia, design e tecnologia para tirar ideias do papel: bio sites, landing pages e sistemas sob medida.',
      en: 'Vertex Labs — strategy, design and technology to bring ideas to life: custom bio sites, landing pages and systems.',
    },
    themeColor: '#0a0a0b',
    // Domínio final (ex.: 'https://vertexlabs.io'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
    ogImage: '/media/vertex-mark-1200.png',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap',
  },

  brand: {
    name: 'Vertex Labs',
    handle: '@vertexlabs.io',
    mark: { src: '/media/vertex-mark.svg', alt: 'Símbolo da Vertex Labs' },
    status: { pt: 'Disponível para novos projetos', en: 'Available for new projects' },
    role: { pt: 'Agência digital', en: 'Digital agency' },
    // Slogan em duas partes: a segunda aparece em laranja, como nos posts da marca.
    slogan: {
      lead: { pt: 'Construímos o que', en: 'We build what' },
      accent: { pt: 'ainda não existe.', en: "doesn't exist yet." },
    },
    bio: {
      pt: 'Estratégia, design e tecnologia para tirar ideias do papel: bio sites, landing pages e sistemas sob medida.',
      en: 'Strategy, design and technology to bring ideas to life: custom bio sites, landing pages and systems.',
    },
    legalName: 'Vertex Labs',
  },

  contact: {
    whatsapp: {
      number: '5586976076820',
      message: 'Olá, Vertex Labs! Vim pelo bio site e quero conversar sobre um projeto.',
    },
    booking: { url: '', message: '' },
    instagram: { handle: 'vertexlabs.io' },
    email: { address: '' }, // Ex.: 'contato@vertexlabs.io'
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  socials: ['instagram', 'whatsapp', 'email'],

  // Chamada principal. `message` pré-preenche o WhatsApp em cada idioma.
  cta: {
    title: { pt: 'Solicitar orçamento', en: 'Request a quote' },
    text: { pt: 'Bio sites, landing pages e sistemas sob medida.', en: 'Custom bio sites, landing pages and systems.' },
    message: {
      pt: 'Olá, Vertex Labs! Quero solicitar um orçamento.',
      en: "Hi, Vertex Labs! I'd like to request a quote.",
    },
  },

  services: {
    title: { pt: 'O que fazemos', en: 'What we do' },
    items: [
      {
        icon: 'layers',
        title: { pt: 'Bio sites', en: 'Bio sites' },
        text: { pt: 'Páginas de links com identidade própria, feitas para converter visitas do Instagram.', en: 'Link-in-bio pages with their own identity, built to convert Instagram visits.' },
        message: { pt: 'Olá, Vertex Labs! Quero um orçamento de bio site.', en: "Hi, Vertex Labs! I'd like a quote for a bio site." },
      },
      {
        icon: 'monitor',
        title: { pt: 'Landing pages', en: 'Landing pages' },
        text: { pt: 'Páginas de venda e captação com design estratégico e carregamento rápido.', en: 'Sales and lead pages with strategic design and fast loading.' },
        message: { pt: 'Olá, Vertex Labs! Quero um orçamento de landing page.', en: "Hi, Vertex Labs! I'd like a quote for a landing page." },
      },
      {
        icon: 'code',
        title: { pt: 'Sistemas sob medida', en: 'Custom systems' },
        text: { pt: 'Painéis, automações e ferramentas web pensadas para o seu processo.', en: 'Dashboards, automations and web tools built around your process.' },
        message: { pt: 'Olá, Vertex Labs! Quero conversar sobre um sistema sob medida.', en: "Hi, Vertex Labs! I'd like to talk about a custom system." },
      },
    ],
  },

  // Portfólio por categoria. Categorias sem itens aparecem como "em breve".
  portfolio: {
    title: { pt: 'Portfólio', en: 'Portfolio' },
    intro: { pt: 'Projetos reais, publicados e funcionando.', en: 'Real projects, live and working.' },
    soon: {
      pt: 'Estamos preparando os primeiros cases desta categoria.',
      en: "We're preparing the first cases in this category.",
    },
    visit: { pt: 'Ver ao vivo', en: 'View live' },
    categories: [
      {
        id: 'bio-sites',
        label: { pt: 'Bio sites', en: 'Bio sites' },
        items: [
          { title: 'Essencial', segment: { pt: 'Nail designer', en: 'Nail designer' }, image: '/media/portfolio/01-essencial.webp', href: `${MODELS}01-essencial.vercel.app` },
          { title: 'Autoridade', segment: { pt: 'Mentora de negócios', en: 'Business mentor' }, image: '/media/portfolio/02-autoridade.webp', href: `${MODELS}02-autoridade.vercel.app` },
          { title: 'Editorial', segment: { pt: 'Mentora de marketing', en: 'Marketing mentor' }, image: '/media/portfolio/03-editorial.webp', href: `${MODELS}03-editorial.vercel.app` },
          { title: 'Compacto', segment: { pt: 'Designer de sobrancelhas', en: 'Brow designer' }, image: '/media/portfolio/04-compacto.webp', href: `${MODELS}04-compacto.vercel.app` },
          { title: 'Premium', segment: { pt: 'Estrategista digital', en: 'Digital strategist' }, image: '/media/portfolio/05-premium.webp', href: `${MODELS}05-premium.vercel.app` },
          { title: 'Delivery', segment: { pt: 'Pizzaria', en: 'Pizzeria' }, image: '/media/portfolio/06-delivery.webp', href: `${MODELS}06-delivery.vercel.app` },
        ],
      },
      { id: 'landing-pages', label: { pt: 'Landing pages', en: 'Landing pages' }, items: [] },
      { id: 'sistemas', label: { pt: 'Sistemas', en: 'Systems' }, items: [] },
    ],
  },

  footer: {
    tagline: { pt: 'Design e tecnologia para marcas que querem sair do comum.', en: 'Design and technology for brands that refuse to be ordinary.' },
  },
};
