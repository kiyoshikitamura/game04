const assert = require('node:assert/strict');
const fs = require('node:fs');

for (const path of ['src/utils/redesignApi.ts', 'src/utils/redesignRestoreObservation.ts']) {
  const source = fs.readFileSync(path, 'utf8');
  assert.match(source, /import \{ FunctionRegion \} from '@supabase\/supabase-js';/, `${path}: official FunctionRegion import missing`);
  assert.match(source, /supabase\.functions\.invoke\('game04-redesign-api',[\s\S]*?region: FunctionRegion\.EuCentral1,[\s\S]*?\}\);/, `${path}: GAME04 API is not pinned to the database region`);
  assert.doesNotMatch(source, /forceFunctionRegion|['"]x-region['"]/, `${path}: use the official SDK region option instead of a partial custom header/query implementation`);
}

const edgeSource = fs.readFileSync('supabase/functions/game04-redesign-api/source.ts', 'utf8');
assert.match(edgeSource, /'Access-Control-Allow-Headers':\s*'[^']*\bx-region\b[^']*'/, 'Edge CORS must allow the x-region header sent by the official SDK region option');

console.log('PASS GAME04 redesign API uses official Supabase eu-central-1 regional invocation and allows its x-region CORS header.');
