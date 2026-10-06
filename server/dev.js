import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['--watch','server/index.js'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0'],{stdio:'inherit'})];
let stopping=false;const stop=()=>{if(stopping)return;stopping=true;children.forEach(child=>child.kill());};
process.on('SIGINT',stop);process.on('SIGTERM',stop);children.forEach(child=>{child.on('exit',code=>{stop();process.exitCode=code||0});child.on('error',()=>{stop();process.exitCode=1})});
