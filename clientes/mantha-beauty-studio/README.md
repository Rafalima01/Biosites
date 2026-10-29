# Mantha Beauty Studio · Samantha Carvalho

Bio site feito com o [Modelo 08 · Glam](../../modelos/08-glam). Sobrancelhas, cílios e lábios em Salvador.

- **Páginas:** início (`/`) e serviços (`/servicos/`). O card "Serviços e valores" do início abre a página de serviços,
  com as categorias em blocos que abrem e fecham.
- **Conteúdo:** `src/sites/mantha-beauty-studio/site.config.js` (serviços, valores, horários, card de serviços,
  página `/servicos/` em `pages.servicos` e botões de contato em `contactCard`).
- **Fotos:** `public/media/` (capa com fundo roxo estendido para o letreiro não cobrir o rosto, perfil e fundo).
  A foto de perfil (`samantha-perfil`) aparece ao lado do nome e no "Seguir" da galeria; é diferente da capa.
- **Agendamento:** o botão principal e o "Agendar" de cada serviço abrem o WhatsApp (71 99650-9097)
  com a mensagem pronta, incluindo o nome do serviço.
- **Galeria de inspirações:** 4 fotos de trabalhos (filtros Sobrancelhas e Cílios). Nada vem pré-selecionado: a faixa
  "inspirações escolhidas" só aparece depois que a cliente toca no + de alguma foto, e as escolhidas vão na mensagem do
  WhatsApp. Para mais fotos, preencha `inspo.tags` e `inspo.items` (mesmo formato do modelo) com as fotos em `public/media/`.

## Executar

```bash
npm install
npm run check
npm run build
```

## Publicar na Vercel

Projeto `biosite-mantha-beauty-studio` · Root Directory `clientes/mantha-beauty-studio` ·
Produção: https://biosite-mantha-beauty-studio.vercel.app

Enquanto esta pasta não estiver na `main`, o projeto não está ligado ao Git: publique pela CLI a partir da raiz do
repositório (`vercel deploy --prod --cwd .` com o projeto acima). Com domínio próprio, troque `meta.siteUrl`
(o link de compartilhamento usa a foto da capa).
