import {useEffect} from 'react';
import {metadata} from './seo';
export default function Seo({page}){useEffect(()=>{
 const base=document.querySelector('meta[name="site-url"]')?.content||'';const data=metadata(page,base);document.title=data.title;document.documentElement.lang='en-AU';
 const set=(selector,attribute,value)=>{let el=document.head.querySelector(selector);if(!el){const match=selector.match(/^meta\[(name|property)="([^"]+)"\]$/);if(!match)return;el=document.createElement('meta');el.setAttribute(match[1],match[2]);document.head.append(el)}el.setAttribute(attribute,value)};
 set('meta[name="description"]','content',data.description);set('meta[property="og:title"]','content',data.title);set('meta[property="og:description"]','content',data.description);set('meta[name="twitter:title"]','content',data.title);set('meta[name="twitter:description"]','content',data.description);
 let canonical=document.querySelector('link[rel="canonical"]');if(data.url){if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}canonical.href=data.url;set('meta[property="og:url"]','content',data.url)}else canonical?.remove();
 set('meta[property="og:type"]','content',page.startsWith('insight-')?'article':'website');set('meta[property="og:locale"]','content','en_AU');const canIndex=document.querySelector('meta[name="site-indexable"]')?.content==='true';set('meta[name="robots"]','content',canIndex&&page!=='not-found'?'index,follow,max-image-preview:large':'noindex,follow');
 const schema=document.getElementById('structured-data');if(schema)schema.textContent=JSON.stringify(data.schema||{});
},[page]);return null}
