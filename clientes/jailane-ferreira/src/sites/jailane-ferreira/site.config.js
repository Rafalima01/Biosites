/**
 * Bio site · Jailane Ferreira — nail designer e mentora (Modelo 02 · Autoridade)
 *
 * Dados enviados pela cliente: nome, WhatsApp, Instagram, endereço do studio e serviços com
 * valores e duração (da página dela no Booksy).
 * Ainda pendente: link da mentoria (fica em branco por enquanto) e domínio próprio.
 * Campos vazios ('') viram botões que avisam "destino ainda não configurado".
 * Depoimentos ficam desligados (testimonials: null) até termos relatos reais, com autorização.
 */

/** Foto da cliente em `public/media/<nome>-400.webp` e `-800.webp`. */
const foto = (nome, alt, ratio) => ({
  src: `/media/${nome}-800.webp`,
  srcset: `/media/${nome}-400.webp 400w, /media/${nome}-800.webp 800w`,
  alt,
  width: 800,
  height: Math.round(800 / ratio),
});

const COM_CUTILAGEM = 'Com cutilagem e esmaltação';

export default {
  id: 'jailane-ferreira',
  lang: 'pt-BR',
  demo: false,

  meta: {
    title: 'Jailane Ferreira · Nail designer e mentora',
    description:
      'Jailane Ferreira Academy Nails: nail design em Itapuã, Salvador, e mentoria para nail designers. Confira os serviços e agende pelo WhatsApp.',
    themeColor: '#efe8e1',
    siteUrl: '', // PENDENTE: domínio próprio (ex.: 'https://jailaneferreira.com.br')
    ogImage: '/media/capa-800.webp',
  },

  theme: {
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap',
    tokens: {},
  },

  brand: {
    firstName: 'Jailane',
    lastName: 'Ferreira',
    role: 'Nail designer e mentora',
    tagline: 'Nail design no studio em Itapuã, Salvador, e mentoria para nail designers.',
    legalName: 'Jailane Ferreira Academy Nails',
  },

  contact: {
    whatsapp: {
      number: '5571984466471',
      message: 'Olá, Jailane! Vim pelo seu bio site e fiquei com uma dúvida.',
    },
    booking: {
      url: '', // Opcional: link do Booksy. Vazio = agendamento pelo WhatsApp.
      message: 'Olá, Jailane! Gostaria de agendar um horário.',
    },
    instagram: { handle: 'studiojailaneferreira' },
    website: { url: '' },
    location: {
      address: 'Rua 7 de Setembro de Itapuã, 64, Centro Empresarial Alpha Center, Sala 12, Salvador - BA, 41610-071',
      mapsUrl: '',
    },
  },

  hero: {
    photo: foto('capa', 'Jailane Ferreira sorrindo, de blusa de cetim dourada e braços cruzados', 4 / 5),
    proof: null, // Sem números até a cliente informar (ex.: alunas formadas).
    cta: { label: 'Agende seu horário', action: { type: 'channel', channel: 'booking' } },
  },

  features: [
    {
      id: 'agendamento',
      title: 'Agendamento',
      description: 'Reserve seu horário de atendimento direto pelo WhatsApp.',
      cta: 'Agendar',
      tone: 'light',
      photo: foto('telefone', 'Jailane Ferreira sorrindo ao telefone, de camisa branca', 5 / 6),
      action: { type: 'channel', channel: 'booking' },
    },
    {
      id: 'mentoria',
      title: 'Mentoria',
      description: 'Para nail designers que querem evoluir na profissão e no negócio.',
      cta: 'Saiba mais',
      tone: 'dark',
      photo: foto('apontando', 'Jailane Ferreira sorrindo e apontando para cima', 5 / 6),
      action: { type: 'page', href: '/mentoria/', label: 'Mentoria' },
    },
    {
      id: 'servicos',
      title: 'Serviços e valores',
      description: 'Confira os atendimentos, a duração e os valores.',
      cta: 'Ver valores',
      tone: 'light',
      photo: foto('unhas', 'Jailane Ferreira de olhos fechados, com as mãos e as unhas em destaque', 5 / 6),
      action: { type: 'page', href: '/servicos/', label: 'Serviços e valores' },
    },
  ],

  about: {
    id: 'sobre',
    // Textos do post de apresentação dela no Instagram.
    titleLead: 'Quem é',
    title: 'Jailane Ferreira',
    paragraphs: ['Nail designer e mentora, à frente do Jailane Ferreira Academy Nails, em Itapuã, Salvador.'],
    purpose: {
      label: 'Meu propósito',
      text: 'Transformar vidas e fortalecer a autoestima de cada cliente através das unhas.',
    },
    factsTitle: 'Curiosidades sobre mim',
    facts: [
      { icon: 'estrela', text: 'Desde criança, eu sabia que seria manicure e, desde 2018, vivo esse sonho com amor.' },
      { icon: 'coracao', text: 'Tenho 22 anos, sou noiva, mãe do Zeus e estou à espera do meu pequeno Lorenzo.' },
      { icon: 'escudo', text: 'Sou leal a quem amo, valorizo meu espaço e minha liberdade.' },
      { icon: 'mapa', text: 'Amo conhecer novos lugares e estar com minha família e amigos.' },
    ],
  },

  services: {
    id: 'servicos',
    eyebrow: 'Serviços e valores',
    title: 'Meus serviços',
    intro: 'Toque no serviço para agendar online.',
    // Foto do topo da página /servicos/ (capa com degradê).
    pagePhoto: foto('capa', 'Jailane Ferreira sorrindo, de blusa de cetim dourada e braços cruzados', 4 / 5),
    // A Booksy não tem link por serviço: todos abrem a mesma página, onde a cliente escolhe o serviço e o horário.
    bookingUrl: 'https://booksy.com/pt-br/instant-experiences/widget/278150',
    bookingMessage: 'Olá, Jailane! Quero agendar: {servico}.',
    groups: [
      {
        title: 'Alongamento',
        items: [
          { title: 'Molde F1 aplicação natural', photo: '/media/servicos/molde-f1.webp', price: 'R$ 120', duration: '1h45', note: `${COM_CUTILAGEM} · decorada R$ 150` },
          { title: 'Gel na tip aplicação lisa', photo: '/media/servicos/gel-na-tip.webp', price: 'R$ 130', duration: '1h55', note: COM_CUTILAGEM },
          { title: 'Fibra de vidro aplicação lisa', photo: '/media/servicos/fibra-de-vidro.webp', price: 'R$ 160', duration: '2h30', note: `${COM_CUTILAGEM} · decorada R$ 190` },
          { title: 'Postiça realista', photo: '/media/servicos/postica-realista.webp', price: 'a partir de R$ 70', duration: '55min', note: 'Com cutilagem' },
        ],
      },
      {
        title: 'Manutenção',
        items: [
          { title: 'Molde F1 manutenção natural', price: 'R$ 100', duration: '1h', note: `${COM_CUTILAGEM} · decorada R$ 130` },
          { title: 'Gel na tip manutenção lisa', price: 'R$ 110', duration: '1h50', note: `${COM_CUTILAGEM} · decorada R$ 140` },
          { title: 'Fibra de vidro manutenção lisa', price: 'R$ 140', duration: '1h50', note: `${COM_CUTILAGEM} · decorada R$ 170` },
        ],
      },
      {
        title: 'Banho de gel e esmaltação',
        items: [
          { title: 'Banho de gel', photo: '/media/servicos/banho-de-gel.webp', price: 'R$ 90', duration: '1h', note: `${COM_CUTILAGEM} · sem manutenção · decorado R$ 120` },
          { title: 'Esmaltação em gel (unha natural)', price: 'R$ 30', duration: '30min' },
        ],
      },
      {
        title: 'Pés',
        items: [
          { title: 'Pedicure', price: 'R$ 30', duration: '30min' },
          { title: 'Esmaltação em gel no pé', price: 'R$ 50', duration: '55min' },
          { title: 'Alongamento pedicure', price: 'R$ 110', duration: '1h30' },
          { title: 'Spa com ervas medicinais', price: 'R$ 60', duration: '45min' },
        ],
      },
      {
        title: 'Combos',
        items: [
          { title: 'Pé e mão', photo: '/media/servicos/pe-e-mao.webp', price: 'R$ 45', duration: '45min' },
          { title: 'Postiça realista + pedicure', price: 'R$ 85', duration: '55min' },
          { title: 'Molde F1 + pedicure', price: 'R$ 125', duration: '1h30' },
        ],
      },
    ],
    cta: { label: 'Agendar pelo WhatsApp', action: { type: 'channel', channel: 'booking' } },
  },

  // Páginas internas: /servicos/ (lista acima) e /mentoria/.
  pages: {
    servicos: {
      meta: {
        title: 'Serviços e valores · Jailane Ferreira',
        description: 'Alongamento, manutenção, banho de gel, pés e combos: serviços, duração e valores. Agende pelo WhatsApp.',
      },
    },
    mentoria: {
      meta: {
        title: 'Mentoria · Jailane Ferreira',
        description: 'Mentoria para nail designers com Jailane Ferreira.',
      },
      photo: foto('apontando', 'Jailane Ferreira sorrindo e apontando para cima', 5 / 6),
      eyebrow: 'Mentoria',
      title: 'Mentoria para nail designers',
      // PENDENTE: textos da mentoria (para quem é, como funciona, o que inclui). Vazio = aviso "em breve".
      paragraphs: [],
      emBreve: 'Informações sobre a mentoria em breve',
      cta: {
        label: 'Quero saber da mentoria',
        action: { type: 'channel', channel: 'whatsapp', message: 'Olá, Jailane! Quero saber mais sobre a mentoria.' },
      },
    },
  },

  place: {
    id: 'endereco',
    title: 'Onde me encontrar',
    lines: ['Centro Empresarial Alpha Center · Sala 12', 'Rua 7 de Setembro de Itapuã, 64', 'Salvador · BA · CEP 41610-071'],
    cta: 'Abrir no mapa',
  },

  testimonials: null,

  finalCta: {
    photo: foto('bracos-abertos', 'Jailane Ferreira de corpo inteiro, sorrindo, com os braços abertos', 4 / 5),
    titleLead: 'Ficou com',
    titleItalic: 'alguma dúvida?',
    text: 'Me chame no WhatsApp e eu te ajudo a escolher o melhor serviço.',
    cta: { label: 'Fale comigo', action: { type: 'channel', channel: 'whatsapp' } },
  },

  footer: {
    links: ['instagram', 'whatsapp', 'location'],
    demoNote: '',
  },
};
