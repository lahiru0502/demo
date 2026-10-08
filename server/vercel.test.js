import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createVercelHandler} from '../api/index.js';

test('Vercel handler fails closed with JSON when mail settings are missing',async()=>{
 const response=await request(createVercelHandler({})).get('/api/form-config');
 assert.equal(response.status,503);
 assert.match(response.headers['content-type'],/application\/json/);
 assert.equal(response.headers['cache-control'],'no-store');
 assert.ok(!response.body.available);
});

test('Vercel handler serves form config and preserves enquiry origin checks',async()=>{
 const handler=createVercelHandler({APP_ORIGINS:'https://herriton.com.au',SMTP_HOST:'smtp.example',SMTP_USER:'user',SMTP_PASS:'secret-password',MAIL_FROM:'forms@herriton.com.au',MAIL_TO:'lahiru.xtream@gmail.com',TURNSTILE_SITE_KEY:'public-key',TURNSTILE_SECRET_KEY:'secret-key'});
 const response=await request(handler).get('/api/form-config');
 assert.equal(response.status,200);
 assert.deepEqual(response.body,{available:true,siteKey:'public-key',attachmentsEnabled:false});
 assert.ok(!response.text.includes('secret'));
 assert.equal((await request(handler).post('/api/enquiries').set('Origin','https://attacker.example')).status,403);
 assert.equal((await request(handler).get('/api/missing')).status,404);
});
