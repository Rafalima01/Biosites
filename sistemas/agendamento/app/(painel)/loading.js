// Aparece na hora do toque enquanto a próxima página busca os dados (o menu continua na tela).
export default function Carregando() {
  return (
    <div className="carregando" role="status" aria-label="Carregando">
      <div className="esqueleto esqueleto--titulo" />
      <div className="esqueleto-grade">
        <div className="esqueleto esqueleto--cartao" />
        <div className="esqueleto esqueleto--cartao" />
        <div className="esqueleto esqueleto--cartao" />
        <div className="esqueleto esqueleto--cartao" />
      </div>
      <div className="esqueleto esqueleto--bloco" />
    </div>
  );
}
