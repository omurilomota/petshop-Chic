# 🤝 Guia de contribuição

## 🌿 Modelo de branches (Gitflow)

| Branch | Origem | Destino | Uso |
| --- | --- | --- | --- |
| `main` | — | — | Código em produção. Só recebe `release/*` e `hotfix/*`, sempre com tag |
| `develop` | `main` | — | Branch de integração contínua |
| `feature/<nome>` | `develop` | `develop` | Novas funcionalidades e melhorias |
| `release/<versao>` | `develop` | `main` | Preparação de release (versão, docs, ajustes finais) |
| `hotfix/<nome>` | `main` | `main` e `develop` | Correção urgente em produção |

### Fluxo de uma feature

```bash
git switch develop
git pull
git switch -c feature/minha-feature
# ... commits ...
git switch develop
git merge --no-ff feature/minha-feature
git branch -d feature/minha-feature
```

### Fluxo de uma release

```bash
git switch -c release/1.1.0 develop
# ... bump de versão, changelog, ajustes ...
git switch main
git merge --no-ff release/1.1.0
git tag -a v1.1.0 -m "v1.1.0"
git switch develop
git merge --no-ff main          # back-merge
git branch -d release/1.1.0
```

### Fluxo de um hotfix

```bash
git switch -c hotfix/corrige-formulario main
# ... commit ...
git switch main
git merge --no-ff hotfix/corrige-formulario
git tag -a v1.1.1 -m "v1.1.1"
git switch develop
git merge --no-ff main          # back-merge
git branch -d hotfix/corrige-formulario
```

## 💬 Mensagens de commit (Gitmoji)

Formato:

```
<emoji> <tipo>: <descrição no imperativo, em português>
```

Corpo opcional explicando **o que** mudou e **por que**.

### Emojis mais usados neste projeto

| Emoji | Código | Quando usar |
| --- | --- | --- |
| ✨ | `:sparkles:` | Nova funcionalidade |
| 🐛 | `:bug:` | Correção de bug |
| ♻️ | `:recycle:` | Refatoração |
| 🎨 | `:art:` | Formatação/estrutura de código |
| 🍱 | `:bento:` | Adição/atualização de assets |
| ⚡️ | `:zap:` | Melhoria de performance |
| 📝 | `:memo:` | Documentação |
| 🔧 | `:wrench:` | Configuração |
| 👷 | `:construction_worker:` | CI/CD |
| 🔍️ | `:mag:` | SEO |
| ♿️ | `:wheelchair:` | Acessibilidade |
| 🔀 | `:twisted_rightwards_arrows:` | Merge de branches |
| 🎉 | `:tada:` | Início do projeto |
| 🚑️ | `:ambulance:` | Hotfix crítico |
| 🔖 | `:bookmark:` | Release/version tag |

### Exemplos

```
✨ feat: adiciona agendamento online de banho e tosa
🐛 fix: corrige link do WhatsApp que estava inválido
🍱 assets: adiciona fotos reais da loja em WebP otimizado
♿️ a11y: corrige textos alternativos do hero e da seção Sobre
🔀 merge: integra feature/minha-feature no develop
```

## ✅ Antes de abrir um Pull Request

1. Rode a verificação de tipos: `npm run typecheck`
2. Rode o build: `npm run build`
3. Teste visualmente com `npm run dev`
4. Garanta que os commits seguem o padrão acima

O template de PR em `.github/pull_request_template.md` traz o checklist.
