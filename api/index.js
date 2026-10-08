import {createApp,configuration} from '../server/app.js';

// Keep the existing validation, CAPTCHA and mail handling on Vercel too.
// Initialisation is deferred so missing hosting settings return JSON, not a
// crashed function or a static HTML page.
export function createVercelHandler(env=process.env){
 let app;
 return (req,res)=>{
  if(!app){
   try{app=createApp({config:configuration({...env,NODE_ENV:'production'})});}
   catch{
    res.statusCode=503;
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.end(JSON.stringify({error:'Enquiries are unavailable at the moment. Please try again later.'}));
   }
  }
  return app(req,res);
 };
}

export default createVercelHandler();
