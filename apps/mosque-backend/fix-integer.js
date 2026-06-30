import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace integer( with int(
  content = content.replace(/integer\(/g, 'int(');
  
  // Replace integer in imports with int
  content = content.replace(/import \{([^}]*)integer([^}]*)\} from "drizzle-orm\/mysql-core";/g, 'import {$1int$2} from "drizzle-orm/mysql-core";');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed integer -> int!");
