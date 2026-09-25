const fs=require('fs');
function diff(expected,actual,pointer='',out=[]){
 if(Object.is(expected,actual))return out;
 if(expected===null||actual===null||typeof expected!=='object'||typeof actual!=='object'||Array.isArray(expected)!==Array.isArray(actual)){out.push({path:pointer,expected,actual,kind:actual===undefined?'missing':expected===undefined?'added':'changed'});return out;}
 const keys=new Set([...Object.keys(expected),...Object.keys(actual)]);
 for(const k of [...keys].sort())diff(expected[k],actual[k],pointer+'/'+k.replaceAll('~','~0').replaceAll('/','~1'),out);
 return out;
}
module.exports={diff};
if(require.main===module){const [a,b]=process.argv.slice(2);if(!a||!b)throw Error('Usage: node compare.cjs EXPECTED.json ACTUAL.json');const differences=diff(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(b)));console.log(JSON.stringify({status:differences.length?'STOP':'MATCH',differences},null,2));process.exitCode=differences.length?1:0;}
