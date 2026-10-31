/**
 * Conteúdo do site da Vertex Labs. Tudo o que aparece na página sai daqui.
 * Novo modelo ou cliente: acrescente na lista, tire o print (README) e coloque em public/media/modelos/.
 */

const WHATSAPP = '5586976076820';
export const zap = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

export const agencia = {
  nome: 'Vertex Labs',
  handle: '@vertexlabs.io',
  instagram: 'https://www.instagram.com/vertexlabs.io/',
  slogan: 'Construímos o que ainda não existe.',
  bio: 'Bio sites sob medida para quem vende pelo Instagram.',
  site: 'https://vertexlabs-site-green.vercel.app',
  orcamento: zap('Olá, Vertex! Vim pelo site e quero um bio site para o meu negócio.'),
};

export const meta = {
  title: 'Vertex Labs · Bio sites que vendem pelo Instagram',
  description:
    'Bio sites sob medida para o link da sua bio: serviços, agenda, portfólio e WhatsApp num endereço só. Veja os 13 modelos e os clientes no ar.',
  ogImage: '/media/modelos/12-psicologia.webp',
};

/** Segmentos dos filtros da vitrine (a ordem aqui é a ordem dos botões). */
export const segmentos = ['Beleza', 'Especialistas', 'Saúde', 'Barbearia', 'Imóveis', 'Gastronomia', 'Hospedagem'];

/** Os modelos de demonstração (prints em public/media/modelos/<id>.webp). */
export const modelos = [
  { id: '01-essencial', n: '01', nome: 'Essencial', segmento: 'Beleza', marca: 'Studio Suelen Bezerra · nail designer', frase: 'Luxo discreto em creme e dourado: o essencial, bem feito.', url: 'https://biosite-01-essencial.vercel.app' },
  { id: '02-autoridade', n: '02', nome: 'Autoridade', segmento: 'Especialistas', marca: 'Agatha Rigazzi · mentora de negócios', frase: 'Para quem vende conhecimento: prova social já na primeira dobra.', url: 'https://biosite-02-autoridade.vercel.app' },
  { id: '03-editorial', n: '03', nome: 'Editorial', segmento: 'Especialistas', marca: 'Marina Albuquerque · mentora de marketing', frase: 'Linguagem de revista, com números que dão autoridade.', url: 'https://biosite-03-editorial.vercel.app' },
  { id: '04-compacto', n: '04', nome: 'Compacto', segmento: 'Beleza', marca: 'Bianca Moraes · designer de sobrancelhas', frase: 'Cartão de visita digital que cabe numa tela.', url: 'https://biosite-04-compacto.vercel.app' },
  { id: '05-premium', n: '05', nome: 'Premium', segmento: 'Especialistas', marca: 'Larissa Prado · estrategista digital', frase: 'Vitrine de produtos digitais com acabamento de luxo.', url: 'https://biosite-05-premium.vercel.app' },
  { id: '06-delivery', n: '06', nome: 'Delivery', segmento: 'Gastronomia', marca: 'Brasa & Massa Pizza', frase: 'Cardápio, "aberto agora" em tempo real e pedido por canal.', url: 'https://biosite-06-delivery.vercel.app' },
  { id: '07-hospedagem', n: '07', nome: 'Hospedagem', segmento: 'Hospedagem', marca: 'Maré Mansa · casas de temporada', frase: 'Reserva direta pelo WhatsApp, sem taxa de plataforma.', url: 'https://biosite-07-hospedagem.vercel.app' },
  { id: '08-glam', n: '08', nome: 'Glam', segmento: 'Beleza', marca: 'Rosé Nail Studio', frase: 'Cara de app: a cliente escolhe as inspirações e manda no WhatsApp.', url: 'https://biosite-08-glam.vercel.app' },
  { id: '09-delicado', n: '09', nome: 'Delicado', segmento: 'Beleza', marca: 'Studio Lívia Beauty', frase: 'Rosa claro com assinatura e agenda online com sinal no Pix.', url: 'https://biosite-09-delicado.vercel.app', agenda: true },
  { id: '10-barbearia', n: '10', nome: 'Barbearia', segmento: 'Barbearia', marca: 'Ferraz Barber Club', frase: 'Cobre e grafite, com o calendário 3D marcando o dia de hoje.', url: 'https://biosite-10-barbearia.vercel.app' },
  { id: '11-barbearia-agenda', n: '11', nome: 'Barbearia com agenda', segmento: 'Barbearia', marca: 'Ferraz Barber Club', frase: 'O modelo 10 com horários livres e agendamento direto no painel.', url: 'https://biosite-11-barbearia-agenda.vercel.app', agenda: true },
  { id: '12-psicologia', n: '12', nome: 'Psicologia', segmento: 'Saúde', marca: 'Helena Duarte · psicóloga', frase: 'Acolhedor, com CRP visível e sem preços, como pede o CFP.', url: 'https://biosite-12-psicologia.vercel.app' },
  { id: '13-imobiliaria', n: '13', nome: 'Imobiliária', segmento: 'Imóveis', marca: 'Rafael Monteiro · corretor de imóveis', frase: 'Consultoria, catálogo de imóveis e visitas pelo WhatsApp.', url: 'https://biosite-13-imobiliaria.vercel.app' },
];

/** Clientes reais, no ar. */
export const clientes = [
  { id: 'jailane-ferreira', nome: 'Jailane Ferreira', papel: 'Nail designer e mentora · Salvador', texto: 'Studio em Itapuã e mentoria para nail designers, com agendamento e página da mentoria.', url: 'https://biosite-jailane-ferreira.vercel.app' },
  { id: 'mantha-beauty-studio', nome: 'Mantha Beauty Studio', papel: 'Sobrancelhas, cílios e lábios', texto: 'Serviços com valores, trabalhos e agendamento, na identidade do studio.', url: 'https://biosite-mantha-beauty-studio.vercel.app' },
];

/** Comparação: lista de links comum x bio site. */
export const comparacao = [
  ['A cara do seu negócio', 'Fundo branco e botões iguais aos de todo mundo', 'Cores, fotos e fontes da sua marca'],
  ['Serviços e valores', 'Um link para cada coisa, fora do perfil', 'Página própria, organizada por categoria'],
  ['WhatsApp', 'Abre a conversa em branco', 'Abre com a mensagem pronta e o serviço escolhido'],
  ['Agendamento', 'Depende de outra plataforma', 'Opcional: horários livres e sinal no Pix'],
  ['Quando alguém compartilha', 'Aparece o nome da ferramenta', 'Aparece a sua foto, o seu nome e a sua frase'],
];

export const passos = [
  { n: '01', titulo: 'A conversa', texto: 'Você conta pelo WhatsApp o que vende, para quem e o que precisa no link da bio.' },
  { n: '02', titulo: 'O modelo', texto: 'Escolhemos juntos o ponto de partida entre os modelos, ou criamos do zero a partir de uma referência.' },
  { n: '03', titulo: 'A sua marca', texto: 'Montamos com as suas fotos, cores, serviços e textos. Você acompanha e pede ajustes.' },
  { n: '04', titulo: 'No ar', texto: 'Publicamos com o seu endereço e você coloca o link na bio do Instagram.' },
];

export const incluso = [
  'Funciona no celular, no tablet e no computador',
  'Botões que abrem o WhatsApp com a mensagem pronta',
  'Serviços e valores organizados numa página só',
  'Mapa, endereço e horários',
  'Sua foto e sua frase quando o link é compartilhado',
  'Carrega rápido, mesmo no 4G',
  'Endereço próprio, com o seu domínio se quiser',
  'Agenda online com sinal no Pix (opcional)',
];

export const agenda = {
  titulo: 'Quer ir além dos links? A agenda vem junto.',
  texto: 'Para studios e barbearias: a cliente vê os horários livres, escolhe o serviço e segura o horário com o sinal no Pix. Você acompanha tudo no painel pelo celular.',
  itens: ['Horários livres pelo seu expediente', 'Sinal no Pix para segurar o horário', 'Painel no celular: agenda do dia, encaixes e bloqueios'],
  demo: 'https://biosite-11-barbearia-agenda.vercel.app',
};

export const duvidas = [
  ['Preciso ter um site antes?', 'Não. O bio site é o seu endereço na internet: a gente cria e publica, e você só coloca o link na bio.'],
  ['Funciona com o Instagram?', 'Foi feito para ele. Quem toca no link da bio cai numa página com a sua cara, pronta para chamar no WhatsApp ou agendar.'],
  ['Posso usar o meu domínio?', 'Pode. Publicamos num endereço nosso e, se você tiver um domínio (seunome.com.br), ligamos nele.'],
  ['E se eu quiser mudar algo depois?', 'É só chamar. Trocar fotos, serviços, valores e horários faz parte do acompanhamento.'],
  ['Quanto custa?', 'Depende do modelo e de ter ou não a agenda online. Chame no WhatsApp: mandamos o orçamento com tudo o que está incluso.'],
];
