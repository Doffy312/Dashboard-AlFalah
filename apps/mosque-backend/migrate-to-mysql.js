import fs from 'fs';
import path from 'path';

const schemaDir = 'e:/Dashboard/apps/mosque-backend/src/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace imports
  content = content.replace(/drizzle-orm\/pg-core/g, 'drizzle-orm/mysql-core');
  
  // Replace pgTable with mysqlTable
  content = content.replace(/pgTable/g, 'mysqlTable');
  
  // Replace text("id") with varchar("id", { length: 255 })
  // because mysql doesn't allow text for primary keys/unique
  content = content.replace(/text\((["'])id(["'])\)/g, 'varchar($1id$2, { length: 255 })');
  
  // Replace text("email") with varchar("email", { length: 255 })
  content = content.replace(/text\((["'])email(["'])\)/g, 'varchar($1email$2, { length: 255 })');
  
  // Replace text("token") with varchar("token", { length: 255 })
  content = content.replace(/text\((["'])token(["'])\)/g, 'varchar($1token$2, { length: 255 })');

  // Replace text(...) for references to id
  content = content.replace(/text\((["'])user_id(["'])\)/g, 'varchar($1user_id$2, { length: 255 })');
  content = content.replace(/text\((["'])account_id(["'])\)/g, 'varchar($1account_id$2, { length: 255 })');
  content = content.replace(/text\((["'])provider_id(["'])\)/g, 'varchar($1provider_id$2, { length: 255 })');
  content = content.replace(/text\((["'])identifier(["'])\)/g, 'varchar($1identifier$2, { length: 255 })');
  content = content.replace(/text\((["'])created_by(["'])\)/g, 'varchar($1created_by$2, { length: 255 })');
  
  // Replace uuid("id") with varchar("id", { length: 36 })
  content = content.replace(/uuid\((["'])id(["'])\)/g, 'varchar($1id$2, { length: 36 })');

  // Replace .defaultRandom() with .$defaultFn(() => crypto.randomUUID())
  content = content.replace(/\.defaultRandom\(\)/g, '.$defaultFn(() => crypto.randomUUID())');

  // Ensure crypto is imported if we added randomUUID
  if (content.includes('crypto.randomUUID()') && !content.includes("import crypto from 'crypto'")) {
    content = "import crypto from 'crypto';\n" + content;
  }

  // Replace decimal for mysql if needed, but numeric/decimal usually works.
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Converted schema files!");
