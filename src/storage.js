const KEY='agency-os-studio-v1';
export function readWorkspace(fallback) {const raw=localStorage.getItem(KEY); return raw ? JSON.parse(raw) : fallback();}
export function saveWorkspace(data) {localStorage.setItem(KEY,JSON.stringify(data));}
function openAssets() {return new Promise((resolve,reject)=>{const r=indexedDB.open('agency-os-assets',1);r.onupgradeneeded=()=>r.result.createObjectStore('assets',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transact(mode,run) {const db=await openAssets();return new Promise((resolve,reject)=>{const tx=db.transaction('assets',mode);const req=run(tx.objectStore('assets'));let result;req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};});}
export const allAssets=()=>transact('readonly',s=>s.getAll());
export const putAsset=a=>transact('readwrite',s=>s.put(a));
export function download(name,text,type='text/markdown') {const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
export function safeUrl(url) {try {const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
