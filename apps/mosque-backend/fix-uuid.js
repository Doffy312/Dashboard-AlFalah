import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace uuid("...") with varchar("...", { length: 36 })
  content = content.replace(/uuid\((["'])([^"']+)(["'])\)/g, 'varchar($1$2$3, { length: 36 })');
  
  // Remove uuid from imports
  content = content.replace(/uuid,\s*/g, '');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed uuid -> varchar!");
