import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import request from 'supertest';
import {pages} from '../src/seo.js';
import {createApp,configuration} from '../server/app.js';
const generate=env=>execFileSync(process.execPath,['scripts/prerender.js'],{env:{...process.env,...env},stdio:'pipe'});
test('Vercel production uses Herriton while preview and explicit blocking stay safe',async()=>{
 try{
  generate({VERCEL_ENV:'production',SITE_URL:'',SEO_INDEXING:undefined});
  const manifest=JSON.parse(await fs.readFile('dist/seo-manifest.json','utf8'));
  assert.deepEqual(manifest,{siteUrl:'https://herriton.com.au',indexable:true});
  assert.ok((await fs.readFile('dist/index.html','utf8')).includes('rel="canonical" href="https://herriton.com.au/"'));
  generate({VERCEL_ENV:'production',SITE_URL:'',SEO_INDEXING:'false'});
  assert.equal(JSON.parse(await fs.readFile('dist/seo-manifest.json','utf8')).indexable,false);
  generate({VERCEL_ENV:'preview',SITE_URL:'',SEO_INDEXING:undefined});
  assert.deepEqual(JSON.parse(await fs.readFile('dist/seo-manifest.json','utf8')),{siteUrl:'',indexable:false});
 }finally{generate({VERCEL_ENV:'',SITE_URL:'',SEO_INDEXING:'false'});}
});
test('every route serves readable HTML without JavaScript, unique metadata and real links',async()=>{const app=createApp({config:configuration({})});const titles=new Set();for(const [id,p] of Object.entries(pages)){const r=await request(app).get(p.path);assert.equal(r.status,200,id);assert.ok(r.text.includes('lang="en-AU"'));assert.ok(r.text.includes('<h1'),id);assert.ok(r.text.includes('id="main-content"'));assert.ok(r.text.includes('href="/contact/"'));assert.ok(!r.text.includes('href="#contact"'));const title=r.text.match(/<title>([^<]+)<\/title>/)[1];assert.ok(!titles.has(title),id);titles.add(title);assert.ok(r.text.includes('name="description"'));}assert.equal((await request(app).get('/about')).status,301);const missing=await request(app).get('/does-not-exist/');assert.equal(missing.status,404);assert.equal(missing.headers['x-robots-tag'],'noindex');assert.ok(missing.text.includes('Page not found'));});
test('real domain builds canonical, sitemap, schema and social metadata; preview remains non-indexable',async()=>{try{generate({SITE_URL:'https://seo-test.example',SEO_INDEXING:'true'});const sitemap=await fs.readFile('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,Object.keys(pages).length);assert.ok((await fs.readFile('dist/robots.txt','utf8')).includes('Sitemap: https://seo-test.example/sitemap.xml'));for(const [id,page] of Object.entries(pages)){const html=await fs.readFile('dist'+(page.path==='/'?'/index.html':page.path+'index.html'),'utf8');assert.ok(html.includes(`rel="canonical" href="https://seo-test.example${page.path}"`));assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(html.includes('content="index,follow,max-image-preview:large"'));const schema=JSON.parse(html.match(/id="structured-data" type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.ok(schema['@graph'].some(n=>n['@type']==='Organization'));assert.ok(!JSON.stringify(schema).includes('aggregateRating'));assert.ok(!JSON.stringify(schema).includes('streetAddress'));assert.ok(html.includes('og:locale'));}}finally{generate({SITE_URL:'',SEO_INDEXING:'false'});}const html=await fs.readFile('dist/index.html','utf8');assert.ok(html.includes('noindex,follow'));assert.ok(!html.includes('rel="canonical"'));assert.equal(await fs.readFile('dist/robots.txt','utf8'),'User-agent: *\nDisallow: /\n');await assert.rejects(fs.access('dist/sitemap.xml'));});
