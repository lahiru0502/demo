import 'dotenv/config';
import {createApp} from './app.js';
const server=createApp().listen(Number(process.env.PORT||3001),process.env.HOST||'127.0.0.1',()=>console.log('Herriton backend running.'));
server.requestTimeout=30000;server.headersTimeout=15000;
