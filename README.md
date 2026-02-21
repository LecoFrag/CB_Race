# CB - Race 3: Nova Vitória Race 🏎️💨

Este é o projeto base para o aplicativo web interativo "Nova Vitória Race", uma corrida de rua clandestina desenvolvida para uma campanha de Cyberpunk Red.

O aplicativo centraliza o gerenciamento da corrida através de um mapa em tempo real, status dos corredores (vida, velocidade, estresse) e um painel de controle narrativo para o Mestre (DM).

---

## 🚀 Como Rodar o Projeto na Sua Máquina

Este projeto foi construído usando **React** e **Vite**. Diferente de sites HTML simples antigos, você **não pode** apenas dar um duplo clique no arquivo `index.html` para abrir o jogo, pois o navegador vai bloquear os scripts de segurança modernos (erro de CORS).

Você precisa de um "servidor local" para rodar o código. Siga os passos abaixo:

### Pré-requisitos

Certifique-se de que você tem o **Node.js** instalado no seu computador.
Você pode baixar e instalar a versão mais recente [aqui](https://nodejs.org/).

---

### Passo a passo para Iniciar o Servidor Local

1. **Abra o Terminal (ou Prompt de Comando/PowerShell)**
   - No VS Code, você pode abrir o terminal integrado apertando `` Ctrl + ` `` (Crase) ou indo no menu superior `Terminal > Novo Terminal`.
   - Certifique-se de que o terminal está aberto dentro da pasta raiz do projeto (`C:\Antigravity\CB - Race 3`).

2. **Instale as as dependências (Apenas na primeira vez)**
   - Caso você tenha apagado a pasta `node_modules` ou baixado o projeto do GitHub pela primeira vez em um novo computador, você precisa baixar as "peças" do projeto novamente.
   - Digite o comando abaixo e aperte **Enter**:

     ```bash
     npm install
     ```

   - Aguarde a barra de progresso terminar.

3. **Inicie o Servidor de Desenvolvimento (Para testar e jogar)**
   - Para ligar o motor do Vite e rodar o seu código, digite o seguinte comando e aperte **Enter**:

     ```bash
     npm run dev
     ```

   - O terminal vai carregar um texto verde parecido com este:

     ```
       VITE v5.x.x  ready in 450 ms

       ➜  Local:   http://localhost:5173/
     ```

4. **Abra o Jogo no Navegador!**
   - Segure a tecla **Ctrl** (ou Cmd no Mac) e **clique no link** `http://localhost:5173/` que apareceu no seu terminal.
   - Ou apenas copie e cole esse endereço no seu navegador (Chrome, Edge, Firefox, etc.).

---

### 🛑 Como Parar o Servidor

Quando terminar de trabalhar ou jogar, volte ao terminal onde o servidor está rodando e aperte:
**`Ctrl + C`** (Pode apertar duas vezes se ele perguntar se deseja "Terminar o arquivo em lotes").

---

### 📦 Como Gerar a Versão Final (Para Hospedagem)

Quando o jogo estiver 100% pronto e você quiser gerar a pasta `dist` (A pasta minúscula com os arquivos reais que vão para o ar no GitHub Pages, Vercel ou outra hospedagem), rode o comando:

```bash
npm run build
```

O Vite vai compilar o seu código e criar a pasta mágica `dist` no seu diretório para você fazer o upload.
