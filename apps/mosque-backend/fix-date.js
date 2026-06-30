import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace date("...") with date("...", { mode: 'string' })
  content = content.replace(/date\((["'])([^"']+)(["'])\)(?!\s*,\s*\{)/g, 'date($1$2$3, { mode: "string" })');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed date mode!");
