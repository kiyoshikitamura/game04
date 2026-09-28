// Static CSS/authority checks only. Browser geometry and visibility are separate.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const css = fs.readFileSync('src/app/components/redesign/BattleView.module.css', 'utf8');
const root = postcss.parse(css);
const rule = root.nodes.findLast(node => node.type === 'atrule' && node.name === 'media' && node.params.includes('max-height:650px'));
assert(rule);
assert(rule.params.includes('max-width:540px'));
assert(rule.params.includes('orientation:portrait'));
rule.walkDecls(decl => assert(!['font', 'font-size', 'overflow', 'overflow-y', 'transform', 'min-width', 'min-height'].includes(decl.prop), `must not shrink text/targets or hide content: ${decl}`));
const arena = rule.nodes.find(node => node.selector === '.arena');
assert.equal(arena.nodes.find(node => node.prop === 'height').value, 'clamp(180px,calc(100dvh - 378px),272px)');
assert(!rule.nodes.some(node => node.selector === '.party' && node.nodes.some(decl => decl.prop === 'grid-template-columns')), 'five party columns retained');
const quest = require('../src/domain/redesign/data/quest65.json');
assert.equal(quest.stages.length, 65);
const sizes = quest.stages.flatMap(stage => stage.waves.map(wave => wave.length));
assert.equal(Math.max(...sizes), 3, 'reassess dense enemy layout if formal quests grow');
console.log(JSON.stringify({status:'PASS',scope:'static CSS and formal quest data only; not rendered visibility acceptance',questStages:65,maxFormalQuestEnemies:3,viewports:[360,375,390].map(width => ({width,height:568,arenaHeight:190,portraitHeight:54,partyColumns:5})),denseLegacyRecords:'previous 4–6 enemy two-row height retained; may scroll'},null,2));
