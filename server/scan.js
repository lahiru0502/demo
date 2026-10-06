import net from 'node:net';
// ClamAV INSTREAM protocol: buffers are never executed or written to disk.
export function scanAttachment(buffer, {host,port=3310}) {
 return new Promise((resolve,reject)=>{
  const socket=net.createConnection({host,port});let result='';let settled=false;
  const finish=(error)=>{if(settled)return;settled=true;socket.destroy();error?reject(error):resolve();};
  socket.setTimeout(15000,()=>finish(new Error('Scanner timeout')));
  socket.on('error',()=>finish(new Error('Scanner unavailable')));
  socket.on('data',chunk=>{result+=chunk.toString();if(result.length>1024)return finish(new Error('Invalid scanner response'));if(result.includes('\0')||result.includes('\n'))finish(result.trim().replace(/\0/g,'')==='stream: OK'?null:new Error('Attachment rejected'));});
  socket.on('end',()=>{if(!settled)finish(new Error('Incomplete scanner response'));});
  socket.on('connect',()=>{socket.write('zINSTREAM\0');for(let offset=0;offset<buffer.length;offset+=65536){const chunk=buffer.subarray(offset,offset+65536);const size=Buffer.alloc(4);size.writeUInt32BE(chunk.length);socket.write(size);socket.write(chunk);}socket.write(Buffer.alloc(4));});
 });
}
