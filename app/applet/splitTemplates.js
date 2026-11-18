const fs = require('fs');
const path = require('path');

const filePath = '/app/applet/src/js/bundledTabs.ts';
const outputDir = '/app/applet/src/state_suite/templates';

const content = fs.readFileSync(filePath, 'utf8');

// Simple regex to find "key": "value" pairs
// Note: This is fragile if values contain escaped quotes, but we'll try.
// Since these are HTML templates, they usually use \" for quotes.
const regex = /"([a-z0-9-]+)":\s*"([\s\S]*?)(?<!\\)"/g;

let match;
const keys = [];

while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    let value = match[2];
    
    // Unescape the string
    value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    
    const fileName = `${key}.ts`;
    const fileContent = `export const template = \`${value.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;\n`;
    
    fs.writeFileSync(path.join(outputDir, fileName), fileContent);
    keys.push(key);
    console.log(`Extracted ${key}`);
}

// Generate an index file
const indexContent = keys.map(k => `import { template as ${k.replace(/-/g, '_')} } from './${k}.js';`).join('\n') + 
    `\n\nexport const bundledTabs = {\n` + 
    keys.map(k => `  "${k}": ${k.replace(/-/g, '_')}`).join(',\n') + 
    `\n};\n`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
console.log('Done!');
