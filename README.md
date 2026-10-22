# Biblioteca de Bio Sites Premium

Modelos de bio sites personalizados da agência. Cada modelo é um projeto independente, com
nome próprio e pasta separada em `modelos/`, e é publicado na Vercel como um projeto separado
(apontando o **Root Directory** para a pasta do modelo).

## Modelos

| # | Nome | Pasta | Demonstração | Descrição |
| --- | --- | --- | --- | --- |
| 01 | **Essencial** | [`modelos/01-essencial`](modelos/01-essencial) | Studio Suelen Bezerra · Nail Designer | Modelo inicial e mais simples: foto + monograma, 5 cards de navegação, procedimentos, galeria e rodapé. Luxo discreto em creme, nude e dourado. |

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

1. **Add New → Project** e importe este repositório.
2. **Root Directory**: a pasta do modelo (ex.: `modelos/01-essencial`).
3. **Deploy** e, em **Settings → Domains**, adicione o domínio do cliente.

Detalhes no README de cada modelo.
