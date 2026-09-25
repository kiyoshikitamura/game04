const fs=require('fs'),assert=require('assert/strict');const {root}=require('./runtime.cjs'),{diff}=require('./compare.cjs');
const dir=process.argv[2];if(!dir)throw Error('Usage: node verify-snapshot.cjs EVIDENCE_DIRECTORY');const base=root+'/docs/verification/master-audit-20260925';const expected=JSON.parse(fs.readFileSync(base+'/approved-values.json'));const actual=JSON.parse(fs.readFileSync(dir+'/runtime.json'));const db=JSON.parse(fs.readFileSync(dir+'/database.json'));const meta=JSON.parse(fs.readFileSync(dir+'/metadata.json'));let differences=[];
for(const [key,value]of Object.entries(expected.runtime))differences.push(...diff(value,actual[key],'/runtime/'+key));
for(const [key,value]of Object.entries(expected.database))differences.push(...diff(value,db[key],'/database/'+key));
for(const key of ['sourceSha','apiVersion','apiSha256','databaseProject','capturedAt'])if(!meta[key])differences.push({path:'/metadata/'+key,kind:'missing'});
const unresolvedAuthorityIssues=JSON.parse(fs.readFileSync(base+'/unresolved-authority.json'));
const missingIntegration=expected.requiredIntegration.filter(k=>meta.integration?.[k]!==true);
if(meta.sourceSha!==meta.verifiedSourceSha)missingIntegration.push('same source SHA verified');
console.log(JSON.stringify({status:differences.length||missingIntegration.length||unresolvedAuthorityIssues.length?'STOP':'MATCH',differenceCount:differences.length,differences,missingIntegration,unresolvedAuthorityIssues},null,2));process.exitCode=differences.length||missingIntegration.length||unresolvedAuthorityIssues.length?1:0;
