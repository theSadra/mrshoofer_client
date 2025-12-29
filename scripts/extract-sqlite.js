const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.argv[2];
if (!dbPath || !fs.existsSync(dbPath)) {
  console.error('❌ Please provide a valid path to the SQLite database file');
  console.error('Usage: node extract-sqlite.js <path-to-db-file>');
  process.exit(1);
}

console.log(`🔍 Opening database: ${dbPath}\n`);

try {
  const db = sqlite3(dbPath, { readonly: true });
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  console.log(`📊 Found ${tables.length} tables:\n`);
  tables.forEach(t => console.log(`  - ${t.name}`));
  
  const exportData = {
    exportDate: new Date().toISOString(),
    sourceFile: dbPath,
    tables: {}
  };
  
  console.log('\n📦 Extracting data...\n');
  
  tables.forEach(table => {
    try {
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      exportData.tables[table.name] = rows;
      console.log(`  ${table.name}: ${rows.length} rows`);
    } catch (err) {
      console.log(`  ${table.name}: Error - ${err.message}`);
    }
  });
  
  db.close();
  
  // Save to JSON
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(__dirname, '..', 'backups', `sqlite-export-${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2), 'utf8');
  
  console.log(`\n✅ Data exported successfully!`);
  console.log(`📁 Location: ${outputFile}`);
  console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB\n`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
