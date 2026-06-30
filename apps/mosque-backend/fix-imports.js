import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if it imports from mysql-core
  if (content.includes('drizzle-orm/mysql-core')) {
    // If it uses varchar but doesn't import it, add it
    if (content.includes('varchar(') && !content.includes('varchar,')) {
       // We can just inject varchar into the import statement
       content = content.replace(/import \{([\s\S]*?)\} from "drizzle-orm\/mysql-core";/, 'import { varchar,$1} from "drizzle-orm/mysql-core";');
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed imports!");
