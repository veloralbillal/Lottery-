const fs = require('fs');
const path = require('path');
const lucide = require('lucide');

function toPascal(str) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

const dir = 'src/dashboard_tabs';
const files = fs.readdirSync(dir);

files.forEach(f => {
  const full = path.join(dir, f);
  if (fs.statSync(full).isDirectory()) return;
  const content = fs.readFileSync(full, 'utf8');

  // Find fa- icons
  const faMatches = [...content.matchAll(/class=["'][^"']*\b(fa-[a-z0-9-]+|fa-solid|fa-regular|fa-brands)\b[^"']*["']/g)];
  
  // Find invalid lucide icons
  const lucideMatches = [...content.matchAll(/data-lucide=["']([^"']+)["']/g)];
  const invalid = [];
  lucideMatches.forEach(m => {
    const iconName = m[1].trim();
    if (!iconName.includes('${') && !lucide.icons[toPascal(iconName)]) {
      invalid.push(iconName);
    }
  });

  if (faMatches.length > 0 || invalid.length > 0) {
    console.log('=== ' + f + ' ===');
    if (invalid.length > 0) console.log('  Invalid lucide icons:', invalid);
    if (faMatches.length > 0) {
      console.log('  FA icon matches (' + faMatches.length + '):');
      faMatches.forEach(m => console.log('    ' + m[0]));
    }
  }
});
