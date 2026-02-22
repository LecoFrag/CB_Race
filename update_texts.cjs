const fs = require('fs');
const path = require('path');

const mdPath = 'c:\\Users\\leand\\Downloads\\Textos_Nova_Vitoria_v2.md';
const jsonPath = 'c:\\Antigravity\\CB - Race 3\\src\\data\\race.json';

const mdContent = fs.readFileSync(mdPath, 'utf8');
const raceData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let currentSegment = -1;
let currentPath = '';

const lines = mdContent.split('\n');
const outcomeMap = {
    'Falha Crítica': 'critical_failure',
    'Falha': 'failure',
    'Acerto': 'success',
    'Acerto Crítico': 'critical_success'
};

const parsedData = {};

for (let line of lines) {
    line = line.trim();

    let mSeg = line.match(/^## Segmento (\d+):/);
    if (mSeg) {
        currentSegment = parseInt(mSeg[1]) - 1; // 0-indexed
        parsedData[currentSegment] = {};
        continue;
    }

    let mPath = line.match(/^### Caminho ([A-C]):/);
    if (mPath) {
        currentPath = mPath[1];
        parsedData[currentSegment][currentPath] = { outcomes: {} };
        continue;
    }

    let mText = line.match(/^\*\*Texto do Caminho:\*\* (.*)$/);
    if (mText && currentSegment !== -1 && currentPath) {
        parsedData[currentSegment][currentPath].narrative = mText[1].trim();
        continue;
    }

    let mOut = line.match(/^- \*\*(Falha Crítica|Falha|Acerto|Acerto Crítico):\*\* (.*)$/);
    if (mOut && currentSegment !== -1 && currentPath) {
        const type = outcomeMap[mOut[1]];
        parsedData[currentSegment][currentPath].outcomes[type] = {
            narrative: mOut[2].trim()
        };
    }
}

// Update race.json
const segments = raceData.race.segments;
for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (parsedData[i]) {
        for (let p of seg.paths) {
            if (parsedData[i][p.id]) {
                p.narrative = parsedData[i][p.id].narrative;
                // replace outcomes entirely
                p.outcomes = parsedData[i][p.id].outcomes;
            }
        }
    }
}

fs.writeFileSync(jsonPath, JSON.stringify(raceData, null, 4), 'utf8');
console.log('Successfully updated race.json');
