# 🐾 ChicPets — Landing Page

Landing page institucional do **ChicPets**, petshop e estética animal em
Junqueirópolis - SP. Página única (one-page), responsiva, com foco em
conversão pelo WhatsApp.

[![CI](https://github.com/omurilomota/petshop-Chic/actions/workflows/ci.yml/badge.svg)](https://github.com/omurilomota/petshop-Chic/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

## 📋 Sobre o projeto

Site de uma página só com as seções: início, serviços, galeria, sobre,
contato e localização.

Todo o conteúdo do negócio fica centralizado em
[`src/config.ts`](src/config.ts) — telefone, WhatsApp, endereço, horários e
fotos. Trocar dados da loja não exige mexer nos componentes.

O mesmo arquivo guarda os ajustes finos do site:

| Constante | Para que serve |
| --- | --- |
| `BUSINESS.mapsQuery` | Endereço usado no mapa embutido e no link de rota (aceita `"latitude, longitude"` se o pino cair errado) |
| `CREDITS` | Crédito discreto no rodapé (deixe `url` vazio para exibir só o nome) |
| `SHOW_PAW_DECOR` | Liga/desliga as patas caninas decorativas |

### Serviços divulgados

- 🛁 Banho
- ✂️ Tosa
- 🩺 Consulta veterinária
- 🚗 Taxi dog

## 🚀 Como rodar

Pré-requisitos: Node.js 20.19+ ou 22.12+ e npm.

```bash
npm install
npm run dev
```

Acesse http://localhost:5173.

## 📜 Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Verificação de tipos com o TypeScript |

## 🧱 Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS v4** (tema definido em `src/index.css`)
- **vite-plugin-singlefile** — o build gera um **único `dist/index.html`**,
  com CSS, JS e imagens embutidos

## 📁 Estrutura

```
src/
├── components/    # Seções da página (Header, Hero, Services, Gallery...)
├── pictures/      # Fotos da loja (PNG originais + WebP otimizados)
├── utils/         # Utilitários
├── config.ts      # Dados do negócio, links e imagens
├── index.css      # Tema do Tailwind
└── main.tsx       # Entrada da aplicação
```

## 🖼️ Imagens

As fotos reais da loja ficam em `src/pictures/`. Os PNGs originais são
mantidos como fonte e os `.webp` são os arquivos usados pela aplicação
(~176 KB no total, contra ~2,8 MB dos PNGs).

Para regenerar os WebP depois de trocar/adicionar fotos:

```bash
for f in src/pictures/*.png; do
  b=$(basename "$f" .png)
  ffmpeg -i "$f" -c:v libwebp -quality 82 -compression_level 6 "src/pictures/$b.webp"
done
```

> Requer o `ffmpeg` instalado na máquina.

## 🌐 Deploy

O build gera um arquivo único, fácil de hospedar em qualquer serviço
estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages, Hostinger...).

```bash
npm run build
# publique o conteúdo da pasta dist/
```

### ☁️ Cloudflare Pages

O site também é publicado no **Cloudflare Pages** por integração com o GitHub —
cada push na `main` gera um deploy de produção.

O painel da Cloudflare foi unificado em **Workers & Pages → Create**, e nesse
fluxo a configuração de build **não fica na tela**: quem manda é o
[`wrangler.jsonc`](wrangler.jsonc) na raiz do repositório. É por isso que os
campos *Framework preset* / *Build output directory* não aparecem — os campos de
*Advanced settings* (path, API token, variables) são de deploy e ambiente.

O `wrangler.jsonc` já aponta a saída do Vite:

```jsonc
{
  "name": "petshop-chic",
  "pages_build_output_dir": "./dist",
  "compatibility_date": "2026-09-15"
}
```

Passos no painel (uma vez só):

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Autorize o GitHub e selecione o repositório `omurilomota/petshop-Chic`.
3. Confirme o comando de build como `npm run build` (a saída `dist` é lida do
   `wrangler.jsonc`).
4. Em **Settings → Environment variables**, defina `NODE_VERSION=22` (o Vite 7
   exige Node 20.19+ ou 22.12+; o `.nvmrc` na raiz também fixa a versão 22).

> Se em vez da aba **Pages** o fluxo oferecer um **Worker com assets estáticos**,
> troque a chave `pages_build_output_dir` por
> `"assets": { "directory": "./dist" }` — o restante do build é o mesmo.

Não é preciso `_redirects` nem fallback de SPA: o site é uma página única com
navegação por âncoras, e o build já embute tudo em `dist/index.html`.

> A Vercel continua no ar em paralelo; os dois hosts coexistem.

### ▲ Vercel

O site está no ar temporariamente em
**<https://petshop-chic.vercel.app>** (projeto `petshop-chic`, na conta do
desenvolvedor).

```bash
vercel link            # só na primeira vez: vincula a pasta ao projeto
vercel deploy          # deploy de preview (URL temporária, só para testes)
vercel deploy --prod   # publica em petshop-chic.vercel.app
```

O `vercel link` gera uma pasta `.vercel/` e um `.env.local` locais — os dois
já estão no `.gitignore`.

## 🌱 Fluxo de trabalho

Este projeto usa **Gitflow** para branches e **Gitmoji** para commits.
Detalhes em [CONTRIBUTING.md](CONTRIBUTING.md).

- `main` — código em produção (apenas releases)
- `develop` — integração contínua
- `feature/*` · `release/*` · `hotfix/*`

## 📄 Licença

Projeto privado do ChicPets. © Todos os direitos reservados.

## 📬 Contato

- WhatsApp: (18) 99826-5409
- Instagram: [@patinhachic.junq](https://instagram.com/patinhachic.junq)
- Endereço: Rua Belo Horizonte, 1066 - Centro, Junqueirópolis - SP
