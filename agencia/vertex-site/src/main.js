// Filtros da vitrine: mostra só os modelos do segmento escolhido.
const filtros = document.querySelectorAll('.filtro');
const modelos = document.querySelectorAll('.modelo');
filtros.forEach((botao) =>
  botao.addEventListener('click', () => {
    const alvo = botao.dataset.filtro;
    filtros.forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
    modelos.forEach((m) => {
      m.hidden = alvo !== '*' && m.dataset.segmento !== alvo;
    });
    document.querySelector('.modelos')?.scrollTo({ left: 0, behavior: 'smooth' });
  }),
);

// Botão flutuante do WhatsApp (celular): só aparece depois que o botão principal do perfil sai da tela
const flutuante = document.querySelector('.flutuante');
const principal = document.querySelector('.perfil__acoes');
if (flutuante && principal && 'IntersectionObserver' in window) {
  flutuante.classList.add('escondido');
  new IntersectionObserver(([e]) => flutuante.classList.toggle('escondido', e.isIntersecting)).observe(principal);
}

// Ano do rodapé
document.querySelectorAll('[data-ano]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});
