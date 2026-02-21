---
description: Assistente Especialista em GitHub e Versionamento (Deploy e Backup)
---

# GitHub Deployment Expert (Especialista em Versionamento e Hospedagem)

Esta *skill/workflow* define o comportamento do Antigravity ao lidar com o repositório do projeto no GitHub, garantindo que o código esteja sempre versionado corretamente (`main`) e publicado para acesso do jogador (`gh-pages` ou Vercel/Netlify).

## 🎯 Objetivo Principal

O Agente Especialista em GitHub deve assumir total responsabilidade por organizar o versionamento de maneira profissional, realizar os commits, empurrar o código para a nuvem e garantir que o link do jogo (produção) esteja sempre atualizado e disponível para o usuário final, com o mínimo de atrito.

## 📋 Regras de Ouro (Boas Práticas)

1. **Nunca misture Código de Desenvolvimento com Produção**:
   - A branch `main` (ou `master`) deve conter apenas o código-fonte (arquivos `.jsx`, `.js`, `package.json`, etc).
   - Pastas pesadas (`node_modules`) ou de compilação final (`dist`) DEVEM estar listadas no `.gitignore`.
2. **Mensagens de Commit Semânticas e Claras**:
   - Sempre documentar o que foi feito no commit em português claro (ex: `git commit -m "feat: Adicionado painel do mestre"`).
3. **Fluxo de Atualização em Duas Vias**:
   - Via 1 (Backup): `git add .`, `git commit -m "..."`, e `git push origin main`.
   - Via 2 (Deploy): Executar scripts automatizados (ex: `npm run deploy` via `gh-pages` ou plataformas serverless).

## 🛠️ Cenários de Ação do Agente

O agente deve ser capaz de reconhecer o status atual do projeto e agir adequadamente em cada cenário:

### Cenário A: Projeto Novo (Ainda não está no GitHub)

1. Rodar `git init` na pasta raiz.
2. Criar ou validar o arquivo `.gitignore` (garantindo ausência de `node_modules` e `dist`).
3. Fazer o commit inicial (`git add .` e `git commit -m "Initial commit"`).
4. Solicitar a URL do repositório remoto criado pelo usuário e rodar `git remote add origin <URL>`.
5. Fazer o envio do código-fonte `git push -u origin main`.

### Cenário B: Atualizando o Link do Jogo (Deploy via gh-pages)

*Acionado quando o usuário diz "Suba as alterações para o link" ou "Atualize a versão jogável".*

1. Validar se o `vite.config.js` possui o `base: '/NOME_DO_REPO/'` correto.
2. Validar se o `package.json` possui as rotinas `predeploy` (build) e `deploy` (gh-pages) e a chave `homepage`.
3. Executar o comando: `npm run deploy`.
4. Informar o usuário assim que o terminal confirmar a publicação e fornecer o link (ex: `https://[USER].github.io/[REPO_NAME]`).

### Cenário C: Salvando Progresso do Código (Backup)

*Acionado quando o usuário diz "Salve o código no github" ou ao fim de grandes implementações.*

1. Rodar `git status` para verificar o que mudou.
2. Rodar `git add .` para adicionar as mudanças.
3. Criar uma mensagem de commit detalhada com base no que o agente próprio construiu nas etapas anteriores (ex: `git commit -m "fix: Correção do bug na tela do Mestre"`).
4. Executar `git push` para sincronizar as mudanças de desenvolvimento.

## 🚀 Como Executar

Sempre que ativada, a skill deve em primeiro lugar analisar o `package.json` e a branch atual (`git status`) para decidir qual dos cenários acima aplicar, garantindo a saúde e a organização total do repositório.
