/**
 * Modelo 01 — Studio Suelen Bezerra · Nail Designer
 *
 * Todo o conteúdo, links, imagens e ajustes de tema deste bio site vivem aqui.
 * Para criar um novo cliente, duplique a pasta `src/sites/studio-suelen-bezerra`,
 * edite este arquivo e aponte `src/sites/index.js` para a nova pasta.
 *
 * DESTINOS PENDENTES: campos vazios ('') são tratados como "não configurado".
 * Nesses casos o elemento continua visível, mas ao ser acionado mostra um aviso
 * em vez de abrir um link inventado.
 */

const unsplash = (id, alt) => ({
  thumb: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&h=800&q=72`,
  full: `https://images.unsplash.com/${id}?auto=format&fit=max&w=1600&q=80`,
  alt,
  credit: 'Imagem ilustrativa · Unsplash',
});

export default {
  id: 'studio-suelen-bezerra',
  lang: 'pt-BR',

  meta: {
    title: 'Studio Suelen Bezerra · Nail Designer',
    description:
      'Studio Suelen Bezerra — Nail Designer. Cuidando da sua beleza com delicadeza, atenção e procedimentos pensados para realçar sua autoestima.',
    themeColor: '#f5ede9',
    // Domínio final (ex.: 'https://studiosuelenbezerra.com.br'). Gera a URL canônica e o og:image absoluto.
    siteUrl: '',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500&family=Marcellus&display=swap',
    // Sobrescreve qualquer token de `src/styles/tokens.css` apenas para este cliente.
    tokens: {},
  },

  brand: {
    eyebrow: 'Studio',
    name: 'Suelen Bezerra',
    specialty: 'Nail Designer',
    legalName: 'Studio Suelen Bezerra Nail Designer',
    tagline:
      'Cuidando da sua beleza com delicadeza, atenção e procedimentos pensados para realçar sua autoestima.',
    // `letters` gera o monograma em SVG. Para usar um logotipo, informe `src` (e `alt`).
    monogram: { letters: ['S', 'B'], src: '' },
    portrait: {
      // Imagem demonstrativa: substitua pela fotografia real da profissional.
      src: '/media/suelen-portrait.webp',
      alt: 'Suelen Bezerra, nail designer, sorrindo em seu studio de ambiente claro e elegante',
      width: 744,
      height: 1296,
      position: '50% 18%',
    },
    decor: 'florals',
  },

  contact: {
    whatsapp: {
      number: '', // Ex.: '5511999999999' (DDI + DDD + número)
      message: 'Olá, Suelen! Vim pelo seu bio site e gostaria de tirar algumas dúvidas.',
    },
    booking: {
      url: '', // Opcional: link de um sistema de agenda. Vazio = agendamento pelo WhatsApp.
      message: 'Olá, Suelen! Gostaria de agendar uma avaliação no Studio.',
    },
    instagram: { handle: '' }, // Ex.: 'studiosuelenbezerra'
    website: { url: '' },
    location: {
      address: '', // Ex.: 'Rua Exemplo, 123 - Bairro, Cidade - UF'
      mapsUrl: '', // Opcional: link direto do Google Maps (tem prioridade sobre o endereço)
    },
  },

  heroLinks: ['instagram', 'whatsapp', 'location'],

  cards: [
    {
      id: 'agendamento',
      title: 'Agendamento',
      description: 'Agende sua avaliação e descubra o procedimento ideal para sua pele.',
      icon: 'calendar',
      action: { type: 'channel', channel: 'booking' },
    },
    {
      id: 'procedimentos',
      title: 'Procedimentos',
      description: 'Conheça os procedimentos aplicados no nosso studio.',
      icon: 'document',
      action: { type: 'section', target: 'procedimentos' },
    },
    {
      id: 'resultados',
      title: 'Resultados',
      description: 'Veja resultados, avaliações e conteúdos exclusivos.',
      icon: 'gallery',
      action: { type: 'section', target: 'resultados' },
    },
    {
      id: 'localizacao',
      title: 'Localização',
      description: 'Um ambiente acolhedor, sofisticado e pensado para você.',
      icon: 'pin',
      action: { type: 'channel', channel: 'location' },
    },
    {
      id: 'fale-conosco',
      title: 'Fale conosco',
      description: 'Tire suas dúvidas ou fale com nossa equipe pelo WhatsApp.',
      icon: 'whatsapp',
      action: { type: 'channel', channel: 'whatsapp' },
    },
  ],

  sections: [
    {
      type: 'procedures',
      id: 'procedimentos',
      eyebrow: 'Studio',
      title: 'Procedimentos',
      intro: 'Cada atendimento começa por uma avaliação para indicar o cuidado mais adequado para você.',
      demoNote: 'Lista demonstrativa — substitua pelos procedimentos reais do studio.',
      items: [
        { title: 'Alongamento em gel', description: 'Alongamento com acabamento natural, moldado ao formato das suas mãos.' },
        { title: 'Esmaltação em gel', description: 'Cor uniforme e brilho duradouro, com aplicação cuidadosa.' },
        { title: 'Blindagem', description: 'Camada de proteção aplicada sobre a unha natural.' },
        { title: 'Manutenção', description: 'Cuidado periódico para manter o alongamento bonito e equilibrado.' },
        { title: 'Nail art', description: 'Detalhes delicados e personalizados para complementar o seu estilo.' },
        { title: 'Spa das mãos', description: 'Um momento de cuidado e hidratação para as mãos.' },
      ],
      cta: { label: 'Agendar avaliação', action: { type: 'channel', channel: 'booking' } },
    },
    {
      type: 'gallery',
      id: 'resultados',
      eyebrow: 'Portfólio',
      title: 'Resultados',
      intro: 'Uma seleção de trabalhos para inspirar o seu próximo atendimento.',
      demoNote: 'Imagens ilustrativas — substitua pelas fotos reais dos trabalhos do studio.',
      items: [
        unsplash('photo-1610992015762-45dca7fa3a85', 'Mão com unhas em tom rosa claro sobre superfície clara'),
        unsplash('photo-1612887390768-fb02affea7a6', 'Unhas em rosa suave sobre tecido branco'),
        unsplash('photo-1762373349045-c2decd4ec3f3', 'Mão com francesinha segurando uma pequena flor'),
        unsplash('photo-1630843599725-32ead7671867', 'Unhas em branco leitoso com acabamento delicado'),
        unsplash('photo-1610992015732-2449b76344bc', 'Mão com unhas nude sobre tecido branco'),
        unsplash('photo-1607779097040-26e80aa78e66', 'Unhas em malva, branco e prata com brilho'),
      ],
      cta: { label: 'Ver mais no Instagram', action: { type: 'channel', channel: 'instagram' } },
    },
  ],

  footer: {
    title: 'Conecte-se',
    links: ['instagram', 'whatsapp', 'website'],
  },
};
