import fs from 'fs';
import path from 'path';
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?)$/.test(e.name))files.push(p);}}
walk('src/components/game'); walk('src/game');
const out=new Set();
for(const f of files){
  if(/locales|i18n|Translator|routeTree|LangToggle/.test(f))continue;
  const src=fs.readFileSync(f,'utf8');
  for(const m of src.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)){
    const s=m[2];
    if(!/[A-Za-z]{3}/.test(s))continue;
    if(s.length<3)continue;
    out.add(s);
  }
  for(const m of src.matchAll(/>\s*([A-Z0-9▸▶◄·][^<>{}\n]{2,140}?)\s*</g)){
    const s=m[1].trim();
    if(/[A-Za-z]{3}/.test(s)) out.add(s);
  }
}
const bad=/^[a-z0-9_.-]+$|^[a-zA-Z]+$|text-|bg-|border-|shadow|scrollbar|pixel-|absolute|relative|^grid|^flex|^w-|^h-|gap-|font-|tracking|opacity|gradient|inset|rounded|translate|animate|hover:|md:|rgba|px|#[0-9a-f]{3}|https?:|^\d/;
const arr=[...out].filter(s=>!bad.test(s));
fs.writeFileSync('.lovable/i18n/strings.json',JSON.stringify(arr,null,1));
const n=6, per=Math.ceil(arr.length/n);
for(let i=0;i<n;i++) fs.writeFileSync(`.lovable/i18n/chunk${i}.json`, JSON.stringify(arr.slice(i*per,(i+1)*per),null,1));
console.log(arr.length);
