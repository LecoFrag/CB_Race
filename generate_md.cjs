const fs = require('fs');
const data = require('./src/data/race.json');

let md = `# Textos do Jogo - Nova Vitória Race\n\n`;
md += `> **Como usar:** Edite os textos abaixo como desejar. Quando terminar, você pode me devolver o arquivo ou simplesmente colar os trechos alterados no chat para que eu atualize o código.\n\n`;

data.race.segments.forEach(seg => {
    md += `## Posição / Segmento: ${seg.name} (${seg.location})\n`;
    md += `**Texto da Largada / Descrição:** ${seg.description}\n\n`;

    seg.paths.forEach(path => {
        md += `### Caminho ${path.id}: ${path.name}\n`;
        md += `- **Nível de Dificuldade (Passa com):** ${path.difficultyThreshold} ou mais no d10\n`;
        md += `- **Texto do Caminho:** ${path.narrative}\n\n`;
        md += `#### Respostas / Consequências:\n`;
        md += `- **Sucesso (Tirou ${path.outcomes.success.minRoll} ou mais):** ${path.outcomes.success.narrative}\n`;
        md += `- **Sucesso Parcial (Tirou ${path.outcomes.partial.minRoll} ou mais):** ${path.outcomes.partial.narrative}\n`;
        md += `- **Falha Crítica (Tirou ${path.outcomes.failure.minRoll} ou mais, abaixo do parcial):** ${path.outcomes.failure.narrative}\n\n`;
    });
    md += `---\n\n`;
});

fs.writeFileSync('Textos_Nova_Vitoria.md', md, 'utf-8');
console.log('Arquivo criado com sucesso!');
