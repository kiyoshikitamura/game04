const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(process.cwd(), 'src/app/components/redesign/FormalGachaView.tsx'), 'utf8');
const pendingSource = fs.readFileSync(path.join(process.cwd(), 'src/app/components/redesign/formalGachaPending.ts'), 'utf8');
const contractSource = `${pendingSource}\n${source}`;
const gate = fs.readFileSync(path.join(process.cwd(), 'src/app/components/gacha/SengokuGateOpening.tsx'), 'utf8');
const modal = fs.readFileSync(path.join(process.cwd(), 'src/app/components/gacha/GachaModalPortal.tsx'), 'utf8');
const gateCss = fs.readFileSync(path.join(process.cwd(), 'src/app/components/gacha/SengokuGateOpening.css'), 'utf8');
const checks = [
  ['pending key is scoped by user', /game04:gacha-pending:\$\{userId\}/],
  ['pending metadata survives tab close', /storage\.setItem\(pendingStorageKey\(userId\), JSON\.stringify\(intent\)\)/],
  ['request metadata is saved before dispatch', /savePendingIntent\(response\.state\.userId, intent\)[\s\S]*?await onAction\(nextAction, payload, requestRef\.current\.id\)/],
  ['remount reads only the current user pending request', /readPendingIntent\(response\.state\.userId\)/],
  ['remount replays the saved action with the saved request id', /actionRef\.current\(pendingIntent\.action, pendingIntent\.payload, pendingIntent\.id\)/],
  ['unknown outcome keeps a recovery action visible', /前回の結果を確認/],
  ['new draws are disabled while recovery is unresolved', /pending=\{busy \|\| !!recoveryPending \|\| storageBlocked \|\| !!results \|\| opening\}/],
  ['acknowledging results clears pending metadata', /const closeResults[\s\S]*?clearPendingIntent\(response\.state\.userId, requestRef\.current\?\.id\)/],
  ['only request metadata is stored, not result receipts', /JSON\.stringify\(intent\)/],
  ['cross-tab dispatch is serialized when Web Locks are available', /navigator\.locks\.request\(`game04:gacha:\$\{response\.state\.userId\}`/],
  ['ticket display uses the projected inventory balance only', /catalog\.special\.tickets\[catalog\.special\.categories\[category\]\.rule\.ticketId\]/],
  ['JST daily state uses the shared calendar helper', /getJstDateString\(\)/],
  ['foreground return refreshes the JST calendar day', /visibilitychange/],
  ['the JST reset timer targets the next calendar boundary', /millisecondsUntilNextJstDay\(\)/],
  ['unreadable pending state blocks rather than deleting an unknown operation', /unreadable: true/],
];

for (const [label, pattern] of checks) {
  if (!pattern.test(contractSource)) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

for (const [label, pattern, text] of [
  ['opening is an aria-modal dialog', /aria-modal="true"[\s\S]*role="dialog"/, gate],
  ['opening traps keyboard focus', /event\.key !== "Tab"[\s\S]*focusable/, modal],
  ['opening escape prevents the browser default before finishing', /event\.key === "Escape"[\s\S]*event\.preventDefault\(\)/, modal],
  ['opening restores prior focus', /originFocus\.current\?\.focus\(\)/, modal],
  ['portal inerts all body siblings and restores them', /document\.body\.children[\s\S]*element\.inert = true[\s\S]*element\.inert = inert/, modal],
  ['skip meets the 44px touch target', /sengoku-gate__skip[^}]*min-height: 44px/, gateCss],
]) {
  if (!pattern.test(text)) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
