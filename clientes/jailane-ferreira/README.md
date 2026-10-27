# Modelo 02 · Autoridade

Modelo para especialistas que vendem conhecimento (mentoras, educadoras, consultoras), com foco em
posicionamento e prova social. Demonstração: **Agatha Rigazzi — Mentora de negócios**.

**Composição:** foto de destaque com número de alunas sobreposto e botão de comunidade, nome em
duas linhas (negrito + light), cards horizontais com foto alternando bege e chocolate, painel
"Quem é", serviços numerados, depoimentos (carrossel no celular, grade no desktop), chamada final
"Ficou com alguma dúvida?" sobre foto e rodapé. Paleta creme, bege e chocolate com tipografia Poppins.

Mesma base técnica do Modelo 01: página pré-renderizada a partir da config, JavaScript mínimo.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run check     # valida config, renderização e geração de links
npm run build     # gera /dist
npm run preview   # serve o /dist localmente
```

## Estrutura

```
src/
  sites/agatha-rigazzi/site.config.js   Conteúdo, fotos, links, seções e tema do cliente
  sites/index.js                        Escolhe o site ativo
  components/                           Hero, Features, Sections (Sobre, Serviços,
                                        Depoimentos, Chamada final), Footer, Picture, icons
  lib/links.js                          WhatsApp, Instagram, Maps, site e destinos pendentes
  behaviors/                            Entrada animada, rolagem suave, aviso de pendência
  styles/tokens.css                     Cores, tipografia, raios, sombras e movimento
  styles/components/                    Estilos por bloco
scripts/check-site.mjs                  Verificação automatizada
docs/referencia.webp                    Referência visual do modelo
```

## Personalizar

Tudo fica em `src/sites/agatha-rigazzi/site.config.js`:

| O quê | Onde |
| --- | --- |
| Nome, função e frase | `brand` |
| Foto principal, número de alunas e botão de comunidade | `hero` |
| Cards (título, texto, foto, cor, ação) | `features` (`tone: 'light'` ou `'dark'`) |
| Texto "Quem é" | `about` |
| Serviços | `services` |
| Depoimentos | `testimonials` |
| Chamada final | `finalCta` |
| WhatsApp, agenda, Instagram, site | `contact` |
| Domínio, título e imagem de compartilhamento | `meta` |
| Cores e fontes | `theme.fontsHref` e `theme.tokens` (sobrescrevem `tokens.css`) |

Fotos: use o helper `unsplash(id, alt, { ratio })` para imagens de banco ou, para fotos do cliente,
coloque o arquivo em `public/media/` e informe `{ src: '/media/foto.webp', alt, width, height }`.

**Destinos vazios** viram botões que avisam "destino ainda não configurado", em vez de links
inventados. Ações disponíveis:

```js
{ type: 'channel', channel: 'whatsapp' | 'booking' | 'instagram' | 'location' | 'website', message?: '...' }
{ type: 'section', target: 'id-da-secao' }
{ type: 'url', href: 'https://...', label: 'Nome do destino' }
```

**Modo demonstrativo:** com `demo: true`, o rodapé avisa que nomes, números, depoimentos e fotos
são ilustrativos. Só desligue depois de trocar tudo por dados reais e autorizados.

## Publicar na Vercel

Projeto `biosite-02-autoridade` · Produção: https://biosite-02-autoridade.vercel.app

1. **Add New → Project** e importe o repositório da biblioteca.
2. **Root Directory**: `modelos/02-autoridade` (o `vercel.json` define build, saída e cabeçalhos).
3. **Deploy** e, em **Settings → Domains**, adicione o domínio do cliente.
4. Preencha `meta.siteUrl` com o domínio final e faça um novo push.

## Conteúdo demonstrativo a substituir

- Fotos: banco de imagens Unsplash (mesma modelo em 3 fotos, reaproveitadas em recortes diferentes).
- "+5.000 alunas no Brasil" e os três depoimentos: ilustrativos.
- Textos de serviços, "Quem é" e cards: redigidos para a demonstração.
- Links de WhatsApp, agenda, comunidade, cursos, Instagram e site: vazios.
