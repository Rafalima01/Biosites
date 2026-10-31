# Modelo 13 · Imobiliária

Bio site para corretores de imóveis e imobiliárias: cards azul, laranja, cinza e claro com fotos recortadas
que saem pela borda, ícones 3D brilhantes e catálogo de imóveis.
Demonstração: **Rafael Monteiro · Corretor de Imóveis · CRECI 00000-F**, São Paulo (marca fictícia).
**Sem sistema de agendamento:** consultoria, contato e visitas abrem o WhatsApp com a mensagem pronta.

**Composição:** topo branco com faixa colorida, foto do corretor num círculo com anel laranja e azul,
nome, CRECI, frase e botão verde do WhatsApp. Depois, os quatro cards do print:

- **Consultoria Imobiliária** (azul): corretor recortado segurando uma casinha, saindo pelo topo, e coração 3D.
- **Catálogos de Imóveis** (painel laranja + azul): casa sobre ilha de grama em 3D e escudo 3D; abre `/imoveis/`.
- **Contato e WhatsApp** (cinza): corretor ao telefone saindo pelo topo, dois selos 3D do WhatsApp e o ícone ao lado do título.
- **Agendamentos e visitas** (claro): casa branca recortada, chave 3D, foto aérea clarinha ao fundo e título em verde.

Em seguida: sobre o corretor (foto, texto e especialidades), como funciona (três passos), escritório e visitas
(endereço, mapa e horários), chamada final e rodapé com o CRECI.
Página **`/imoveis/`**: catálogo com foto, venda ou locação, bairro, quartos, banheiros, vagas, área e valor;
tocar no imóvel abre o WhatsApp com o código e o nome dele.

Os cards usam medidas em `cqw` (proporcionais à largura do card), então mantêm as proporções do print em
qualquer tela. No celular é uma coluna só; no desktop, cards à esquerda e seções à direita.

**Imagens:**

- Corretores e casa branca: fotos grátis do [Pexels](https://www.pexels.com/photo/7578878/) e do Unsplash,
  recortadas por um removedor de fundo automático (rodando no computador) e limpas com
  [`scripts/imagens/limpa-alfa.ps1`](../../scripts/imagens/limpa-alfa.ps1).
- Casa na ilha de grama: [`scripts/blender/casa_ilha.py`](../../scripts/blender/casa_ilha.py) (feita do zero).
- Escudo e selo do WhatsApp: [`scripts/blender/icone3d.py`](../../scripts/blender/icone3d.py).
- Coração azul e chave: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT); a chave fica prateada por filtro no CSS.
- Catálogo e foto aérea: Unsplash, entregues em webp pelo servidor deles, com `srcset`.

Fonte: Poppins.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, CRECI, catálogo, renderização das duas páginas e links
npm run build     # gera /dist (início e /imoveis/)
npm run preview   # serve o /dist localmente
```

## Personalizar

Tudo fica em `src/sites/rafael-monteiro/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, profissão e CRECI | `brand` |
| Topo (foto recortada, frase, botão) | `intro` |
| Os quatro cards (título em linhas, texto, ação) | `cards.consultoria`, `cards.catalogo`, `cards.contato`, `cards.visitas` |
| Foto aérea do card de visitas | `visitsBackground` |
| Sobre o corretor e especialidades | `about` |
| Como funciona | `steps` |
| Escritório e visitas | `local` |
| Horários | `schedule` |
| Chamada final | `cta` |
| Imóveis do catálogo e mensagem do WhatsApp | `properties` e `pages.imoveis` (`{imovel}` na mensagem = código + nome) |
| WhatsApp, Instagram, mapa | `contact` e `social` (rodapé) |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `src/styles/tokens.css`) |

Para trocar o corretor das fotos: recorte a foto dele (removedor de fundo automático, Canva ou remove.bg),
passe por `scripts/imagens/recorta.ps1` e `scripts/blender/webp.py` e substitua os arquivos em `public/media/`.

**Destinos vazios** viram botões que avisam "destino ainda não configurado" (na maquete, o Instagram).

**Maquete:** WhatsApp fictício (DDD 00), CRECI 00000-F, imóveis e valores ilustrativos, nota de demonstração
no rodapé enquanto `demo: true`. Para um corretor real, copie a pasta para `clientes/<cliente>`, troque os
dados, as fotos e os imóveis e desligue `demo`.

## Publicar na Vercel

Projeto `biosite-13-imobiliaria` (ainda não criado) · Root Directory `modelos/13-imobiliaria`.

Publique só quando a pasta mudar, a partir da raiz do repositório (depois do `git push`):
`node scripts/publicar.mjs biosite-13-imobiliaria`.
