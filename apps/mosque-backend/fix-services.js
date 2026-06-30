import fs from 'fs';
import path from 'path';

const servicesDir = 'e:/Dashboard/apps/mosque-backend/src/services';
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remove .returning()
  content = content.replace(/\.returning\(\)/g, '');

  // Fix PostgreSQL ::int and count(*)
  content = content.replace(/count\(\*\)::int/g, 'count(*)');

  // Fix PostgreSQL filter (where ...)
  content = content.replace(/count\(\*\)\s+filter\s*\(\s*where\s+(.*?)\s*\)(?:::int)?/gi, 'SUM(CASE WHEN $1 THEN 1 ELSE 0 END)');

  // Fix PostgreSQL ::numeric
  content = content.replace(/::numeric/gi, '');

  // Fix PostgreSQL to_char for YYYY-MM
  content = content.replace(/to_char\((.*?),\s*'YYYY-MM'\)/gi, "DATE_FORMAT($1, '%Y-%m')");

  // Fix PostgreSQL to_char for MM
  content = content.replace(/to_char\((.*?),\s*'MM'\)/gi, "DATE_FORMAT($1, '%m')");

  // Fix PostgreSQL extract(year from ...)
  content = content.replace(/extract\(year\s+from\s+(.*?)\)/gi, 'YEAR($1)');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log("Fixed PostgreSQL syntax in services!");
