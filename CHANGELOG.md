# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado
- Versão mobile: barra de ações fixa no rodapé (agendar, ligar e rota), menu
  hambúrguer com trava de rolagem e foco, carrossel de arrastar na galeria e
  ajustes de toque/safe areas do iPhone
- Suporte a `theme-color` e `viewport-fit=cover` para o navegador mobile
- Publicação no Cloudflare Pages por integração com o GitHub, com Node 22
  fixado (`.nvmrc` e `NODE_VERSION`), em paralelo à Vercel
- Mapa apontando para o endereço completo (número, bairro e cidade), com zoom
  de rua, e link "Ver rota no Google Maps" no card de endereço
- Crédito discreto do desenvolvedor no rodapé (`CREDITS`, em `src/config.ts`)
- Patas caninas decorativas no hero e no rodapé (`SHOW_PAW_DECOR`, em
  `src/config.ts`)

### Corrigido
- Enquadramento das fotos: o recorte centralizado cortava o alto da cabeça dos
  pets — presilha dourada e orelhas do primeiro cão da galeria, flor preta do
  terceiro e presilhas do golden na seção Sobre. As fotos passaram a ser
  ancoradas no topo (`object-top`)
- Link do Versionamento Semântico no topo do arquivo estava malformado

## [1.0.0] - 2026-09-15

### Adicionado
- Fotos da demonstração no hero, na seção Sobre e na galeria (WebP otimizado, ~176 KB)
- README, guia de contribuição (Gitflow + Gitmoji) e template de PR
- Pipeline de CI com verificação de tipos e build

### Corrigido
- Link do WhatsApp inválido (o número continha espaços e quebrava a URL wa.me)
- Textos alternativos das imagens, que descreviam fotos inexistentes no projeto
- Título da página padronizado com a marca ChicPets

### Alterado
- `phoneDisplay` deixou de ser placeholder e exibe o número real
