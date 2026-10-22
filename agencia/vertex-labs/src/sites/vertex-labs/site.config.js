/**
 * Bio site da agência Vertex Labs.
 *
 * Todo texto visível é bilíngue: `{ pt: '...', en: '...' }`. O português é
 * renderizado no HTML; o seletor PT/EN troca os textos no navegador.
 *
 * Ações dos botões:
 *   { type: 'dialog', target: 'orcamento' | 'sistema' }  abre uma janela
 *   { type: 'page', href: '/portfolio/' }                abre outra página do site
 *   { type: 'url', href: 'https://...' }                 link externo (vazio = "em breve", desativado)
 */

const PORTFOLIO_IMG = '/media/portfolio';

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
    email: { address: '' }, // Ex.: 'contato@vertexlabs.io' — o ícone aparece quando preenchido
    website: { url: '' },
    location: { address: '', mapsUrl: '' },
  },

  socials: ['instagram', 'whatsapp', 'email'],

  // Botão principal: abre a janela "Qual serviço você precisa?".
  cta: {
    title: { pt: 'Solicitar orçamento', en: 'Request a quote' },
    text: { pt: 'Bio sites, páginas de vendas, sites e vídeos em motion.', en: 'Bio sites, sales pages, websites and motion videos.' },
    action: { type: 'dialog', target: 'orcamento' },
  },

  // Janela de orçamento: cada opção abre o WhatsApp com a mensagem correspondente.
  quote: {
    eyebrow: { pt: 'Orçamento', en: 'Quote' },
    title: { pt: 'Qual serviço você precisa?', en: 'Which service do you need?' },
    text: { pt: 'Escolha uma opção e a gente já recebe sua mensagem no WhatsApp.', en: "Pick an option and we'll get your message on WhatsApp." },
    options: [
      {
        icon: 'salesPage',
        label: { pt: 'Página de vendas', en: 'Sales page' },
        message: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para uma página de vendas (landing page).', en: "Hi, Vertex Labs! I'd like a quote for a sales page (landing page)." },
      },
      {
        icon: 'globe',
        label: { pt: 'Site institucional', en: 'Company website' },
        message: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para um site institucional.', en: "Hi, Vertex Labs! I'd like a quote for a company website." },
      },
      {
        icon: 'layers',
        label: { pt: 'Bio site', en: 'Bio site' },
        message: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para um bio site.', en: "Hi, Vertex Labs! I'd like a quote for a bio site." },
      },
      {
        icon: 'film',
        label: { pt: 'Vídeo em motion', en: 'Motion video' },
        message: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para um vídeo em motion.', en: "Hi, Vertex Labs! I'd like a quote for a motion video." },
      },
      {
        icon: 'plus',
        label: { pt: 'Outro projeto', en: 'Other project' },
        message: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para outro projeto.', en: "Hi, Vertex Labs! I'd like a quote for another project." },
      },
    ],
  },

  // Lista numerada (01, 02, 03) abaixo do botão de orçamento.
  links: [
    {
      title: { pt: 'Site da Vertex', en: 'Vertex website' },
      text: { pt: 'Conheça a agência, os serviços e o processo.', en: 'Meet the agency, our services and process.' },
      action: { type: 'url', href: '' }, // Preencha com o site quando estiver no ar
    },
    {
      title: { pt: 'Portfólio completo', en: 'Full portfolio' },
      text: { pt: 'Projetos de bio sites, landing pages e sistemas.', en: 'Bio site, landing page and system projects.' },
      action: { type: 'page', href: '/portfolio/' },
    },
    {
      title: { pt: 'Sistema sob medida', en: 'Custom system' },
      text: { pt: 'Conte sua ideia e receba uma proposta.', en: 'Tell us your idea and get a proposal.' },
      action: { type: 'dialog', target: 'sistema' },
    },
  ],
  soonLabel: { pt: 'Em breve', en: 'Soon' },

  // Janela "Sistema sob medida": o resumo digitado vai para o WhatsApp.
  systemForm: {
    eyebrow: { pt: 'Sistema sob medida', en: 'Custom system' },
    title: { pt: 'Conte o que você precisa', en: 'Tell us what you need' },
    text: {
      pt: 'Escreva um resumo do sistema: o problema, quem vai usar e o que ele precisa fazer. A mensagem segue para o nosso WhatsApp.',
      en: 'Write a short summary of the system: the problem, who will use it and what it needs to do. The message goes to our WhatsApp.',
    },
    nameLabel: { pt: 'Seu nome (opcional)', en: 'Your name (optional)' },
    summaryLabel: { pt: 'Resumo do projeto', en: 'Project summary' },
    summaryPlaceholder: {
      pt: 'Ex.: Preciso de um painel para controlar pedidos e estoque da minha loja…',
      en: 'E.g.: I need a dashboard to manage my store orders and stock…',
    },
    submit: { pt: 'Enviar pelo WhatsApp', en: 'Send via WhatsApp' },
    error: { pt: 'Escreva um resumo com pelo menos 15 caracteres.', en: 'Please write a summary with at least 15 characters.' },
    intro: { pt: 'Olá, Vertex Labs! Gostaria de um orçamento para um sistema sob medida.', en: "Hi, Vertex Labs! I'd like a quote for a custom system." },
    nameLine: { pt: 'Nome', en: 'Name' },
    summaryLine: { pt: 'Resumo', en: 'Summary' },
  },

  // Portfólio. O resumo da página inicial mostra as categorias em abas;
  // a página /portfolio/ mostra tudo com filtros e descrição de cada projeto.
  portfolio: {
    title: { pt: 'Portfólio', en: 'Portfolio' },
    intro: { pt: 'Uma amostra dos projetos que já entregamos.', en: "A sample of the projects we've delivered." },
    seeAll: { pt: 'Ver completo', en: 'See all' },
    soon: {
      pt: 'Estamos preparando os primeiros cases desta categoria.',
      en: "We're preparing the first cases in this category.",
    },
    categories: [
      { id: 'bio-sites', label: { pt: 'Bio sites', en: 'Bio sites' } },
      { id: 'landing-pages', label: { pt: 'Landing pages', en: 'Landing pages' } },
      { id: 'sistemas', label: { pt: 'Sistemas', en: 'Systems' } },
    ],
    items: [
      {
        category: 'bio-sites',
        title: 'Essencial',
        year: '2026',
        segment: { pt: 'Nail designer', en: 'Nail designer' },
        image: `${PORTFOLIO_IMG}/01-essencial.webp`,
        description: {
          pt: 'Bio site de luxo discreto com monograma, cards de navegação, procedimentos e galeria com visualização ampliada.',
          en: 'Understated luxury bio site with monogram, navigation cards, services list and a zoomable gallery.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Galeria', en: 'Gallery' }],
      },
      {
        category: 'bio-sites',
        title: 'Autoridade',
        year: '2026',
        segment: { pt: 'Mentora de negócios', en: 'Business mentor' },
        image: `${PORTFOLIO_IMG}/02-autoridade.webp`,
        description: {
          pt: 'Bio site para especialista com prova social, cards com foto, serviços, depoimentos e chamada final.',
          en: 'Expert bio site with social proof, photo cards, services, testimonials and a closing call to action.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Depoimentos', en: 'Testimonials' }],
      },
      {
        category: 'bio-sites',
        title: 'Editorial',
        year: '2026',
        segment: { pt: 'Mentora de marketing', en: 'Marketing mentor' },
        image: `${PORTFOLIO_IMG}/03-editorial.webp`,
        description: {
          pt: 'Linguagem de revista em azul-marinho: capa com o nome sobre a foto, números, faixas editoriais e serviços.',
          en: 'Navy magazine-style layout: cover with the name over the photo, stats, editorial banners and services.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Editorial', en: 'Editorial' }],
      },
      {
        category: 'bio-sites',
        title: 'Compacto',
        year: '2026',
        segment: { pt: 'Designer de sobrancelhas', en: 'Brow designer' },
        image: `${PORTFOLIO_IMG}/04-compacto.webp`,
        description: {
          pt: 'Cartão de visita digital em uma tela, com painéis de serviços e sobre e barra de redes com WhatsApp em destaque.',
          en: 'One-screen digital business card with services and about panels and a social bar highlighting WhatsApp.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Cartão digital', en: 'Digital card' }],
      },
      {
        category: 'bio-sites',
        title: 'Premium',
        year: '2026',
        segment: { pt: 'Estrategista digital', en: 'Digital strategist' },
        image: `${PORTFOLIO_IMG}/05-premium.webp`,
        description: {
          pt: 'Vitrine de produtos digitais em dourado, com cards de vidro e imagens que saltam para fora.',
          en: 'Gold digital product showcase with glass cards and images that pop out of the frame.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Vitrine de produtos', en: 'Product showcase' }],
      },
      {
        category: 'bio-sites',
        title: 'Delivery',
        year: '2026',
        segment: { pt: 'Pizzaria', en: 'Pizzeria' },
        image: `${PORTFOLIO_IMG}/06-delivery.webp`,
        description: {
          pt: 'Bio site de delivery com carrossel de sabores, horário "aberto agora" em tempo real e botões por canal de pedido.',
          en: 'Delivery bio site with a flavor carousel, live "open now" hours and buttons for each ordering channel.',
        },
        tags: [{ pt: 'Bio site', en: 'Bio site' }, { pt: 'Delivery', en: 'Delivery' }],
      },
    ],
  },

  portfolioPage: {
    eyebrow: { pt: 'Portfólio', en: 'Portfolio' },
    title: { pt: 'O trabalho fala por nós.', en: 'Our work speaks for us.' },
    intro: {
      pt: 'Bio sites, landing pages e sistemas criados com estratégia e identidade própria. Filtre pelo que interessa a você.',
      en: 'Bio sites, landing pages and systems built with strategy and their own identity. Filter by what interests you.',
    },
    all: { pt: 'Todos', en: 'All' },
    back: { pt: 'Voltar', en: 'Back' },
    toTop: { pt: 'Voltar ao topo', en: 'Back to top' },
    quoteButton: { pt: 'Orçamento', en: 'Quote' },
    empty: { pt: 'Em breve, novos projetos nesta categoria.', en: 'New projects in this category coming soon.' },
  },

  footer: {
    tagline: { pt: 'Design e tecnologia para marcas que querem sair do comum.', en: 'Design and technology for brands that refuse to be ordinary.' },
  },
};
