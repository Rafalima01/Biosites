# Biblioteca de Bio Sites Premium

Modelos de bio sites personalizados da agência. Cada modelo é um projeto independente, com
nome próprio e pasta separada em `modelos/`, e é publicado na Vercel como um projeto separado
(apontando o **Root Directory** para a pasta do modelo).

## Modelos

| # | Nome | Pasta | Demonstração | Descrição |
| --- | --- | --- | --- | --- |
| 01 | **Essencial** | [`modelos/01-essencial`](modelos/01-essencial) | Studio Suelen Bezerra · Nail Designer | Modelo inicial e mais simples: foto + monograma, 5 cards de navegação, procedimentos, galeria e rodapé. Luxo discreto em creme, nude e dourado. |
| 02 | **Autoridade** | [`modelos/02-autoridade`](modelos/02-autoridade) | Agatha Rigazzi · Mentora de negócios | Para especialistas que vendem conhecimento: prova social sobre a foto, cards com foto alternando bege/chocolate, "Quem é", serviços, depoimentos e chamada final. Creme, bege e chocolate com Poppins. |

## Convenções

- Novo modelo → nova pasta `modelos/NN-nome` (número sequencial + nome curto em minúsculas, sem acentos).
- Cada modelo tem seu próprio `package.json`, `vercel.json` e `README.md`, e pode ter layout e
  identidade próprios; não é obrigatório reaproveitar os cinco cards do Essencial.
- Conteúdo de cada cliente fica em `src/sites/<cliente>/site.config.js` dentro do modelo.
- Registre o novo modelo na tabela acima.

## Rodar um modelo

```bash
cd modelos/01-essencial
npm install
npm run dev
```

## Publicar na Vercel

Cada modelo é um projeto Vercel ligado a este repositório (branch `main`), com **Root Directory**
apontando para a pasta do modelo. Todo push na `main` publica automaticamente; o `ignoreCommand`
do `vercel.json` pula o build quando o push não altera a pasta daquele modelo.

| Modelo | Projeto Vercel | Produção |
| --- | --- | --- |
| 01 · Essencial | `biosite-01-essencial` | https://biosite-01-essencial.vercel.app |
| 02 · Autoridade | `biosite-02-autoridade` | https://biosite-02-autoridade.vercel.app |

Novo modelo: **Add New → Project**, importe este repositório, defina o **Root Directory**
(`modelos/NN-nome`), faça o deploy e adicione o domínio do cliente em **Settings → Domains**.

Publicação manual pela CLI: rode a partir da **raiz do repositório** (o Root Directory já aponta
para a pasta do modelo), por exemplo `vercel deploy --prod --cwd .` após `vercel link --project biosite-02-autoridade`.
