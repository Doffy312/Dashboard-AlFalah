import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace numeric with decimal
  content = content.replace(/numeric\(/g, 'decimal(');
  content = content.replace(/import \{([^}]*)numeric([^}]*)\} from "drizzle-orm\/mysql-core";/g, 'import {$1decimal$2} from "drizzle-orm/mysql-core";');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed numeric -> decimal!");
