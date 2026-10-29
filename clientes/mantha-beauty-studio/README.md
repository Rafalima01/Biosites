# Mantha Beauty Studio · Samantha Carvalho

Bio site feito com o [Modelo 08 · Glam](../../modelos/08-glam). Sobrancelhas, cílios e lábios em Salvador.

- **Conteúdo:** `src/sites/mantha-beauty-studio/site.config.js` (serviços, valores, horários, links).
- **Fotos:** `public/media/` (capa com fundo roxo estendido para o letreiro não cobrir o rosto, rosto e fundo).
- **Agendamento:** o botão principal e o "Agendar" de cada serviço abrem o WhatsApp (71 99650-9097)
  com a mensagem pronta, incluindo o nome do serviço.
- **Galeria de inspirações:** 4 fotos de trabalhos (filtros Sobrancelhas e Cílios); as escolhidas vão na mensagem do WhatsApp. Para mais fotos, preencha
  `inspo.tags` e `inspo.items` (mesmo formato do modelo) com as fotos em `public/media/`.

## Executar

```bash
npm install
npm run check
npm run build
```

## Publicar na Vercel

Projeto `biosite-mantha-beauty-studio` · Root Directory `clientes/mantha-beauty-studio`.
Depois de publicar, preencha `meta.siteUrl` com o endereço final (o link de compartilhamento usa a foto da capa).
