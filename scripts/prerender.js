import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pages,metadata} from '../src/seo.js';
import {render} from '../.seo-build/render.js';
const value=process.env.SITE_URL||'';let siteUrl='';
if(value){const parsed=new URL(value);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash)throw Error('SITE_URL must be your HTTPS origin only.');siteUrl=parsed.origin;}
const indexable=process.env.SEO_INDEXING==='true'&&!!siteUrl;
const templatePath='dist/.seo-template';let raw;try{raw=await fs.readFile(templatePath,'utf8')}catch{raw=await fs.readFile('dist/index.html','utf8');await fs.writeFile(templatePath,raw)}const template=raw.replace(/<meta name="robots"[^>]*>/,'');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const id of [...Object.keys(pages),'not-found']){
 const data=metadata(id,siteUrl);const robots=indexable&&id!=='not-found'?'index,follow,max-image-preview:large':'noindex,follow';
 let head=`<meta name="site-indexable" content="${indexable}"><meta name="site-url" content="${escape(siteUrl)}"><meta name="robots" content="${robots}"><meta property="og:locale" content="en_AU"><meta property="og:type" content="${id.startsWith('insight-')?'article':'website'}"><meta property="og:site_name" content="Herriton Property Valuations"><meta property="og:title" content="${escape(data.title)}"><meta property="og:description" content="${escape(data.description)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(data.title)}"><meta name="twitter:description" content="${escape(data.description)}">`;
 if(data.url){head+=`<link rel="canonical" href="${escape(data.url)}"><meta property="og:url" content="${escape(data.url)}"><meta property="og:image" content="${siteUrl}/images/sydney-1280.webp"><meta property="og:image:alt" content="Sydney Harbour, New South Wales"><meta name="twitter:image" content="${siteUrl}/images/sydney-1280.webp">`;}
 head+=`<script id="structured-data" type="application/ld+json">${JSON.stringify(data.schema||{}).replaceAll('<','\\u003c')}</script>`;
 const html=template.replace(/<title>.*?<\/title>/s,`<title>${escape(data.title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(data.description)}">`).replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root" data-page="${id}">${render(id)}</div>`);
 const target=id==='not-found'?'dist/404.html':path.join('dist',data.path,'index.html');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,html);
}
await fs.writeFile('dist/robots.txt',indexable?`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
if(siteUrl)await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(pages).map(p=>`<url><loc>${escape(siteUrl+p.path)}</loc></url>`).join('')}</urlset>`);
if(!siteUrl)await fs.rm('dist/sitemap.xml',{force:true});
await fs.writeFile('dist/seo-manifest.json',JSON.stringify({siteUrl,indexable}));
console.log(`Pre-rendered ${Object.keys(pages).length} pages plus 404. Public indexing: ${indexable?'enabled':'disabled until SITE_URL and SEO_INDEXING=true are set'}.`);
