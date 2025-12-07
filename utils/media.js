import fs from 'fs';
import path from 'path';
export function ensureTmp() {
  const tmp = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  return tmp;
}
