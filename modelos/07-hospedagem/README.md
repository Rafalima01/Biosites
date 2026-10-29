# Modelo 07 · Hospedagem

Site de **reserva direta** para quem aluga casas por temporada (Airbnb, Booking, Instagram): o
hóspede vê as casas, os pacotes e a agenda com preços, monta a reserva e envia tudo pronto pelo
WhatsApp do anfitrião, **sem taxa de plataforma**. Um site por cliente, não um marketplace.
Demonstração: **Maré Mansa · Casas de temporada** (marca fictícia, Imbassaí e Praia do Forte, BA).

**Composição:** barra fixa com "Reservar", destaque com foto, selo "sem taxa de plataforma" e
números, busca que leva à agenda, abas fixas (Casas, Pacotes, Agenda, Dúvidas), cards de casas com
janela de detalhes (fotos, comodidades e valores), "Por que reservar direto?", pacotes de datas
especiais com valor fechado, **agenda interativa** (preço por dia, ocupado, fim de semana/temporada,
pacote), resumo com total estimado e economia, depoimentos, perguntas frequentes, contato e barra
inferior de reserva no celular. Areia, azul-oceano e coral com Fraunces + Manrope.

Mesma base técnica dos outros modelos: página pré-renderizada a partir da config, JavaScript mínimo
(a agenda é montada no navegador, pois depende da data de hoje).

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, regras da agenda/preço, renderização e links
npm run build     # gera /dist
```

## Personalizar

Tudo fica em `src/sites/mare-mansa/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, região | `brand` |
| Foto, título, selo e números do topo | `hero` |
| Casas: fotos, capacidade, comodidades, diária, fim de semana, limpeza, mínimo de noites | `houses` |
| Datas ocupadas de cada casa (`[check-in, check-out]`, 'AAAA-MM-DD') | `houses[].bookings` |
| Alta temporada (acréscimo percentual por período) | `seasons` |
| Pacotes com valor fechado (bloqueiam essas noites na agenda) | `packages` |
| Taxa de plataforma usada no cálculo da economia (0 esconde) | `platformFee` |
| Vantagens, depoimentos, perguntas | `perks`, `testimonials`, `faq` |
| WhatsApp, Instagram, perfil no Airbnb, endereço | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

**Reserva:** o botão abre o WhatsApp com casa, datas, noites, hóspedes e valor estimado. Sem número
configurado e com `demo: true`, mostra a mensagem que seria enviada.

**Agenda:** hoje é atualizada editando `bookings` e publicando. Próximo passo natural: sincronizar
pelo link iCal que Airbnb e Booking fornecem para cada anúncio (função na Vercel), para a agenda
atualizar sozinha.

## Publicar na Vercel

Projeto `biosite-07-hospedagem` · Produção: https://biosite-07-hospedagem.vercel.app
