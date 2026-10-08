import {pages} from '../src/seo.js';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import nodemailer from 'nodemailer';
import {fileTypeFromBuffer} from 'file-type';
import path from 'node:path';
import {schemas,subjects} from './validation.js';
import {enquiryEmail} from './email-template.js';
import {scanAttachment} from './scan.js';
const email=/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
export function configuration(env=process.env){
 const production=env.NODE_ENV==='production';const origins=(env.APP_ORIGINS||'http://localhost:5173').split(',').map(v=>v.trim());
 if(origins.some(v=>{try{const u=new URL(v);return u.origin!==v||(production&&u.protocol!=='https:')}catch{return true}}))throw Error('APP_ORIGINS must contain exact origins (HTTPS in production).');
 const smtpReady=!!(env.SMTP_HOST&&email.test(env.MAIL_FROM||'')&&email.test(env.MAIL_TO||'')&&env.SMTP_USER&&env.SMTP_PASS);
 const port=Number(env.SMTP_PORT||587);if(![465,587].includes(port))throw Error('SMTP_PORT must be 465 or 587.');
 if(production&&(!smtpReady||!env.TURNSTILE_SECRET_KEY||!env.TURNSTILE_SITE_KEY))throw Error('Production requires SMTP and Turnstile settings.');
 return {production,origins,smtpReady,port,env};
}
export function createApp({config=configuration(),sendMail,verifyCaptcha,scan=scanAttachment,rateLimitMax=10}={}){
 const {production,origins,smtpReady,port,env}=config;const app=express();app.disable('x-powered-by');
 // Explicit proxy IPs only. Never blindly trust forwarded headers.
 if(env.TRUST_PROXY_IPS)app.set('trust proxy',env.TRUST_PROXY_IPS.split(',').map(v=>v.trim()));
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'",'https://challenges.cloudflare.com'],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:','https://images.unsplash.com'],frameSrc:['https://challenges.cloudflare.com'],connectSrc:["'self'",'https://challenges.cloudflare.com'],objectSrc:["'none'"],formAction:["'self'"],upgradeInsecureRequests:production?[]:null}},strictTransportSecurity:production?undefined:false}));
 app.use('/api',(_,res,next)=>{res.set('Cache-Control','no-store');next();});
 app.use('/api',rateLimit({windowMs:15*60*1000,limit:120,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many requests. Please try again later.'}}));
 app.get('/api/form-config',(_,res)=>res.json({available:smtpReady,siteKey:env.TURNSTILE_SITE_KEY||null,attachmentsEnabled:!!env.CLAMAV_HOST}));
 const limit=rateLimit({windowMs:15*60*1000,limit:rateLimitMax,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many submissions. Please wait 15 minutes.'}});
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:2,fields:3,fieldSize:16000,parts:5},fileFilter:(req,file,cb)=>{if(!['.pdf','.jpg','.jpeg','.png'].includes(path.extname(file.originalname).toLowerCase())){const error=new Error('Unsupported attachment');error.code='FILE_TYPE';return cb(error);}cb(null,true)}});
 let transport;
 if(!sendMail&&smtpReady){transport=nodemailer.createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true});sendMail=message=>transport.sendMail(message);}
 const captcha=verifyCaptcha||(async token=>{if(!env.TURNSTILE_SECRET_KEY)return !production;const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(10000)});if(!r.ok)return false;const data=await r.json();return data.success===true&&data.action==='enquiry'&&origins.some(origin=>new URL(origin).hostname===data.hostname);});
 let activeUploads=0;
 const capacity=(req,res,next)=>{if(activeUploads>=4)return res.status(503).json({error:'The service is busy. Please try again shortly.'});activeUploads++;let released=false;const release=()=>{if(!released){released=true;activeUploads--;}};res.once('finish',release);res.once('close',release);next();};
 app.post('/api/enquiries',limit,(req,res,next)=>{if(!origins.includes(req.get('Origin'))||req.get('X-Herriton-Form')!=='1')return res.status(403).json({error:'Please submit using the website form.'});if(!smtpReady)return res.status(503).json({error:'Email enquiries are not configured yet. Please try again later.'});next();},capacity,upload.array('attachments',2),async(req,res,next)=>{
  try{
   if(!['kind','payload','captchaToken'].every(k=>typeof req.body?.[k]==='string')||req.body.captchaToken.length>2048)return res.status(400).json({error:'Invalid submission.'});
   const {kind,payload,captchaToken}=req.body; if(!Object.hasOwn(schemas,kind))return res.status(400).json({error:'Unknown enquiry type.'});
   let input;try{input=JSON.parse(payload)}catch{return res.status(400).json({error:'Invalid submission.'})}
   const result=schemas[kind].safeParse(input);if(!result.success)return res.status(400).json({error:'Check all required details and consent before submitting.'});
   if(!await captcha(captchaToken))return res.status(400).json({error:'Security verification expired or failed. Please try again.'});
   const files=req.files||[];if(files.length&&!env.CLAMAV_HOST)return res.status(503).json({error:'Attachments are currently unavailable. Submit without attachments.'});
   if(files.length&&!['valuation','quote'].includes(kind))return res.status(400).json({error:'This form does not accept attachments.'});
   const attachments=[];
   for(const file of files){const detected=await fileTypeFromBuffer(file.buffer);const ext=path.extname(file.originalname).toLowerCase();const matches={'application/pdf':['.pdf'],'image/jpeg':['.jpg','.jpeg'],'image/png':['.png']};if(!detected||!matches[detected.mime]?.includes(ext))return res.status(400).json({error:'Attachments must be genuine PDF, JPG or PNG files.'});
    try{await scan(file.buffer,{host:env.CLAMAV_HOST,port:Number(env.CLAMAV_PORT||3310)})}catch{return res.status(422).json({error:'An attachment could not pass security scanning. Remove it and try again.'})}
    attachments.push({filename:file.originalname.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(-100),content:file.buffer,contentType:detected.mime,contentDisposition:'attachment'});
   }
   const d=result.data;const content=enquiryEmail(kind,d,attachments.length);
   const info=await sendMail({from:{name:'Herriton Website',address:env.MAIL_FROM},to:env.MAIL_TO,replyTo:d.email,subject:`Herriton — ${subjects[kind]}`,...content,attachments,disableFileAccess:true,disableUrlAccess:true});
   if(!info?.accepted?.some(a=>String(a).toLowerCase()===env.MAIL_TO.toLowerCase()))throw Error('Recipient not accepted');
   res.json({ok:true});
  }catch(error){next(error)}
 });
 app.use('/api',(_,res)=>res.status(404).json({error:'Not found.'}));
 app.use((req,res,next)=>{const route=Object.values(pages).find(p=>p.path!=='/'&&p.path.slice(0,-1)===req.path);if(route)return res.redirect(301,route.path);if(req.path==='/index.html')return res.redirect(301,'/');next();});
 app.use(express.static(path.resolve('dist'),{dotfiles:'deny',index:'index.html',setHeaders:(res,file)=>{if(file.includes(path.sep+'assets'+path.sep))res.set('Cache-Control','public, max-age=31536000, immutable');}}));
 app.use((req,res,next)=>{if(req.method!=='GET'&&req.method!=='HEAD')return next();res.status(404).set('X-Robots-Tag','noindex').sendFile(path.resolve('dist/404.html'),error=>{if(error&&!res.headersSent)res.status(404).type('text').send('Page not found.');});});
 app.use((error,req,res,next)=>{if(res.headersSent)return next(error);if(error.code==='FILE_TYPE')return res.status(400).json({error:'Use PDF, JPG or PNG attachments only.'});if(error instanceof multer.MulterError)return res.status(413).json({error:'Use at most 2 files, each no larger than 5 MB.'});console.error('Enquiry processing failed:',error.code||'INTERNAL');res.status(502).json({error:'Your enquiry could not be sent. Please try again later.'});});
 return app;
}
