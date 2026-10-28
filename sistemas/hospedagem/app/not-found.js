export default function NotFound() {
  return (
    <main className="receipt" style={{ paddingTop: 80, textAlign: 'center' }}>
      <h1 className="section__title">Página não encontrada</h1>
      <p className="section__lead">Confira o link ou volte ao início.</p>
      <a className="btn btn--primary" href="/" style={{ marginTop: 20 }}>Ir para o site</a>
    </main>
  );
}
