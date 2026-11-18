const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const tables = [
  'users', 'staff', 'agents', 'categories', 'lotteries', 
  'tickets', 'deposits', 'withdrawals', 'settings', 
  'transactions', 'agentLedger', 'agentChats'
];

tables.forEach(t => {
  const regex1 = new RegExp(`(FROM|INTO|UPDATE|TABLE|JOIN|EXISTS|DESCRIBE)\\s+\`?(${t})\`?`, 'gi');
  code = code.replace(regex1, (match, op, tableName) => `${op} lottery_${tableName}`);
});

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Successfully updated server.ts table names to lottery_ prefix.');
