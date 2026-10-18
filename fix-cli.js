import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, 'node_modules', 'expo', 'bin', 'cli.js');

const correctCode = `#!/usr/bin/env node
'use strict';

const { createExpoCli } = require('../build/cli');

async function run() {
  process.argv[1] = require.resolve('../build/cli');
  await createExpoCli().run();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
`;

fs.writeFileSync(cliPath, correctCode, 'utf8');
console.log('✅ Fixed expo/bin/cli.js');
