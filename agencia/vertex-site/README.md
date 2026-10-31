# Vertex Labs · Site da agência

Vitrine dos bio sites da Vertex Labs. **Uma página, dois jeitos:**

- **Celular (até 767 px):** abre como um bio site: símbolo, nome, @vertexlabs.io, botão "Quero meu bio site",
  Instagram e atalhos numerados (o primeiro com miniaturas dos modelos). O botão flutuante do WhatsApp só
  aparece depois que o botão principal sai da tela.
- **Tablet e computador:** site completo, com menu fixo e abertura com dois celulares rolando sites reais.

Seções (as mesmas nos dois jeitos, adaptadas): faixa de segmentos, **vitrine dos 13 modelos** (filtros por
segmento, print real dentro de uma moldura de celular, link para a demonstração no ar, card final "o próximo
pode ser o seu"), comparação lista de links × bio site, agenda online (Sistema de Agendamento), como funciona,
**clientes no ar** (Jailane Ferreira e Mantha Beauty Studio), o que vem junto, dúvidas, chamada final e rodapé.
No celular a vitrine vira carrossel deslizante.

**Identidade:** a mesma do post e do bio site da agência: concreto claro, preto, laranja chapado e o degradê
do símbolo, Archivo condensado em caixa-alta, Inter no texto, JetBrains Mono nos rótulos, linhas técnicas finas
com cruzinhas e cantos retos. Sem números ou depoimentos inventados: só fatos dos projetos.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # prints, segmentos, links e âncoras
npm run build     # gera /dist
```

## Onde editar

Todo o texto e as listas ficam em [`src/content.js`](src/content.js): agência e WhatsApp, modelos (número, nome,
segmento, marca de demonstração, frase, endereço), clientes, comparação, passos, o que vem junto, agenda e dúvidas.
Montagem das seções: [`src/render.js`](src/render.js). Estilo: [`src/styles/main.css`](src/styles/main.css).

### Novo modelo ou cliente na vitrine

1. Publique o modelo e acrescente-o em `modelos` (ou `clientes`) no `content.js`.
2. Tire o print de celular do site publicado (Edge headless, 500 px de largura, resolução 2x):
   ```powershell
   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --hide-scrollbars --force-device-scale-factor=2 --window-size=500,1082 --virtual-time-budget=12000 --screenshot=NN-nome.png https://biosite-NN-nome.vercel.app/
   ```
3. Redimensione e converta (na raiz do repositório):
   `scripts/imagens/recorta.ps1 NN-nome.png agencia/vertex-site/public/media/modelos/NN-nome.png 440` e
   `scripts/blender/webp.py` (com `QUALIDADE=80`); apague o PNG.
4. `npm run check`.

O card final da vitrine ("o próximo pode ser o seu") se ajusta sozinho ao número de modelos.

## Publicar na Vercel

Projeto `vertexlabs-site` · Root Directory `agencia/vertex-site` · Produção: https://vertexlabs-site-green.vercel.app
O item "01 Site da Vertex" do bio site da agência (`agencia/vertex-labs`) aponta para este endereço.
