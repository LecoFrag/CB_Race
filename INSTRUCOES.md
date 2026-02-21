# Nova Vitória Race — Guia de Funcionalidades e Mecânicas

Este documento detalha o escopo de como o jogo foi criado, detalhando suas regras, sistemas matemáticos, lógica de inteligência artificial de rivais e o stack tecnológico utilizado no seu desenvolvimento.

---

## 💻 1. Tecnologias Utilizadas (Tech Stack)

A aplicação foi projetada como um Web App focado no Frontend para garantir máxima portabilidade e leveza (rodando diretamente no navegador), com arquitetura em componentes interativos e visuais ricos.

- **React e Vite**: Framework base do Frontend que permite construção modular utilizando `App.jsx`, separando a lógica de estados do render dos painéis (`SceneView.jsx`, `RivalPanel.jsx`, etc). O vite lida com o build rápido.
- **TailwindCSS**: Utilizado exaustivamente para os temas Cyberpunk. Estilização baseada em utilitários diretamente nas classes do código, controlando os brilhos pesados (sombras de neon), bordas laranjas/vermelhas intermitentes e gradientes para dar a atmosfera noturna apropriada.
- **Framer Motion**: Principal motor para animações da interface. Utilizado para o pulso das notificações de "Dano", o rolamento de tela inicial da história, rolagens aleatórias animadas do dado (onde você insere um dado, rodam vários números aleatórios antes de parar na resposta real), transições de fade-in de cenário e animações nas barras de vida.
- **Zustand (`useRaceStore.js`)**: Responsável por todo o **Global State Management**. Ao invés de passar propriedades infinitas entre componentes (prop-drilling), guardamos tudo em uma "loja" central. O Zustand dita a ordem, gerencia as "fases" da rodada e armazena o savegame base na memória enquanto o jogador jogar.
- **Lucide-React**: Biblioteca responsável pela iconografia SVG moderna do app (ícones nos painéis, corações, espadachins nas opções de história).

---

## 🛣️ 2. Estrutura de Pistas (Segmentos e Caminhos)

A corrida se desenrola em um trajeto sequencial dividido em **Segmentos**. Cada Segmento representa um cenário físico diferente de Nova Vitória, onde todos os adversários devem tomar decisões.

### A Dinâmica dos Segmentos

- A corrida consiste em **6 Segmentos principais** que vão desde a "Largada na Zona Industrial" até a "Reta Final na Avenida da Independência".
- Ao entrar em um novo segmento, você lerá a descrição global do ambiente. Em seguida, a UI lhe apresenta exatamente **3 Caminhos Possíveis** (A, B ou C).

### Escolha de Caminhos

Cada caminho representa uma abordagem narrativa e tática para cruzar a área, moldados da seguinte forma:

1. **Abordagem Segura (Dificuldade Baixa - Verde):** Uma escolha mais longa, como por exemplo passar pela marginal do canal. Costuma exigir um rolamento de dados baixo (Ex: tirar 3+ no d10). O risco de falha é pequeno, mas a recompensa costuma ser nula, servindo apenas para você manter a sua posição e evitar danos da pista principal.
2. **Abordagem Equilibrada (Dificuldade Média - Amarelo):** O caminho padrão e mais disputado da corrida. Exige um rolamento mediano (Ex: 5+) e embates corpo a corpo descritivos contra os rivais. Uma vitória garante um ganho de 1 posição confiável.
3. **Abordagem Agressiva/Oculta (Dificuldade Alta - Vermelho):** Caminhos muito curtos, porém insanos — como passar por telhados, túneis inundados ou cortar shoppings. Exigem rolamentos na casa dos 7 ou 8+. Sucessos nessas rotas farão o jogador "pular" vários rivais instantaneamente, rendendo até ganhos de +3 posições de uma vez. Mas cobram um pênalti pesado (de tempo e dano enorme) em caso de falha crítica.

---

## 🎲 3. Mecânica de Posições (O Sistema de Ranking)

O maior objetivo de uma corrida é cruzar a linha de chegada entre as melhores posições possíveis. A sua posição começa dependendo da história e é atualizada em cada nova escolha que você fizer pelas seguintes regras:

### Como o Jogador se move

O jogador rola o um teste de dado **(1d10)** associado à dificuldade do caminho escolhido:

- **Sucesso Crítico:** Você cumpre totalmente a narrativa do caminho e a recompensa (no `race.json`) pode incluir um avançar dinâmico massivo de posições (ex: ir de 6º lugar para 4º).
- **Sucesso Parcial:** Geralmente te joga para frente apenas uma casa ou simplesmente mantêm em posição neutra enquanto cobra dano de escudo pelo atrito.
- **Falha Crítica:** A perda brusca de tempo ou a capotagem do cenário empurra o seu carro ativamente para trás, fazendo você rebaixar drasticamente no Ranking (de 4º lugar indo para 6º).

### Como a IA dos Rivais (Corredores) se move

Nos bastidores do Javascript de `useRaceStore.js` (no momento em que você clica em "Próximo Segmento"), a inteligência artificial analisa cada um dos 7 competidores ativos da corrida e emula um dado `D10` passivamente no código para eles também.

- Se o rival tira **7, 8, 9 ou 10** (Sucesso): Seu tempo de pista é diminuido no código e ele avança lugares, forçando os outros para trás.
- Se o rival tira **4, 5 ou 6** (Neutro): O valor dele não é alterado, mantendo a média.
- Se o rival tira **1, 2 ou 3** (Falha): Sofre tempo extra, rebaixando no ranking perante todo resto do pelotão e sofrendo danos de acidentes aleatórios (-1 a -15 de dano adicional na armadura).

### Ordenação Fluída (Antirrepeticões)

Cada alteração matemática de posições dos jogadores (positiva ou negativa) cai numa esteira de _re-ranking_ algorítmica. Onde a ordem de chegada final teórica do player vira uma variável em Float (números quebrados) gerando micro vantagens baseadas no tempo entre todos para que a UI garanta que só exista 1 jogador cravado em absolutamente cada lugar das posições 1 ao 8 (desempatando as pontuações e recalculando constantemente a cada cena).

---

## 💥 3. Estilos dos Rivais (Arquétipos de Ameaça)

Se você olhar no painel direito, cada um dos seus concorrentes carrega uma logo pequena atrelada a uma cor, nomeando a persona ou o **Estilo** de corrida deles. Na base atual do código, isso desencadeia reações visuais diferentes:

- **Agressivo (Vermelho - Flame):** Personagens como "Ferro Bruto".
  A mecânica foca em bater. Quando eles se aproximam e empatam perto de você no quadro de posições (diferença de 1 lugar de distância), o painel piscará em **vermelho alertando** informando que há risco físico tangível e eles se convertem numa "**Ameaça**".
- **Sabotador (Cinza - Wrench):** Personagens como "A Sombra" que buscam invadir os seus sistemas ou colocar obstáculos no caminho de trás. Assim como os agressivos, ativam o radar de ameaça e piscam luzes na interface do jogador caso estejam colados na sua posição.
- **Técnico (Azul - CPU):** Pilotos focados em seguir a linha ideal. Não ativam alertas vermelhos caso estejam correndo do seu lado, tendem a não procurar brigas ativamente e focar em seu próprio teste de corrida, usando recursos visando só não derrapar.
- **Imprevisível (Roxo - Shuffle):** Pilotos do mais absoluto caos mecânico capazes das mais variadas loucuras descritivas para atravessar obstáculos malucos que apareçam nas escolhas na tela do piloto.

_(Lembrete: Enquanto o painel lateral os classifica visualmente de acordo, algumas das habilidades de combate pesado citadas nas descrições de personagem são "hooks" prontos para futuros patches de regras complexas que os NPCs poderão invocar em eventos especiais contra você durante os Segmentos de narrativa)._

_(Lembrete: Enquanto o painel lateral os classifica visualmente de acordo, algumas das habilidades de combate pesado citadas nas descrições de personagem são "hooks" prontos para futuros patches de regras complexas que os NPCs poderão invocar em eventos especiais contra você durante os Segmentos de narrativa)._

---

## ❤️ 5. Barra de Dano e Destruição

Durante as falhas, as narrativas vão te impor "dano". Esse dano será imediatamente refletido na sua HUD do jogador.
A barra de danos que fica verde (no começo) passará eventualmente à laranja, vermelha e por fim a tons de alerta piscantes severos simulando o desgaste da lata, pneu, motor e suspensão se suas decisões de condução os levarem para falhas seguidas no trajeto pela favela ou nas fábricas da zona sul.
Um carro rival que chegue a acumular dano absoluto será considerado capotado/destruído e sairá de cena (seja por um rolamento péssimo no bastidor durante a transição do segmento, seja via painel do Mestre num Evento).

## 🔋 6. Ativação de Nitro

A sua tela de UI te permite injetar Nitro ativamente antes de realizar o rolar os dados para passar de cada CENA.
Se você injetar Nitro, estará pedindo à maquina pra usar uma de suas `3 Cápsulas` base da partida para somar forçosamente `+3 Pontos Fixos Modificadores` nos dados gerados pelo painel na hora do momento crítico para garantir que a sua jogada escape de um parcial, e vire um Sucesso imediato da próxima descrição narrativa selecionada. Use com parcimônia em momentos em que ficar com a Falha poderia gerar posições fatais.
