const base = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/,'');
const paths=['/','/robots.txt','/sitemap.xml'];
let failed=0;
for (const p of paths) {
  try {
    const r=await fetch(base+p,{redirect:'follow'});
    console.log(`${r.ok?'PASS':'FAIL'} ${p} ${r.status}`);
    if(!r.ok) failed++;
  } catch(e) { console.log(`FAIL ${p} ${e.message}`); failed++; }
}
process.exit(failed?1:0);
