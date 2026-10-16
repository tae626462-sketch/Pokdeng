// ตัวช่วยให้แอพเปิดเร็วและเปิดได้แม้เน็ตหลุด (โหมดบอท)
const CACHE='pokdeng-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pokdeng-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // หน้าเว็บ: เอาของใหม่จากเน็ตก่อน ถ้าไม่มีเน็ตใช้ของที่เก็บไว้
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  // ไฟล์ของแอพ ฟอนต์ และไลบรารีออนไลน์: ใช้ของที่เก็บไว้ แล้วอัปเดตเบื้องหลัง
  const ok=u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com|unpkg\.com|cdn\.jsdelivr\.net/.test(u.host);
  if(!ok)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  })));
});
