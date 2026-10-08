import {subjects} from './validation.js';

const labels={firstName:'First name',surname:'Last name',lastName:'Last name',email:'Email',phone:'Phone',valuation:'Valuation type',propertyType:'Property type',purpose:'Valuation purpose',address:'Property address',area:'Property address or area',business:'Business name',profession:'Profession',otherPurpose:'Other requirements',notes:'Additional notes',message:'Message'};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export function enquiryEmail(kind,data,attachmentCount=0){
 const title=subjects[kind];
 if(!title)throw Error('Unknown enquiry type');
 const rows=Object.entries(labels).filter(([key])=>Object.hasOwn(data,key)).map(([key,label])=>[label,data[key]||'Not provided']);
 rows.push(['Attachments',String(attachmentCount)],['Consent','Provided']);
 const text=`Herriton Property Valuations\n${title}\n\n${rows.map(([label,value])=>`${label}: ${value}`).join('\n\n')}\n\nReply to this email to contact the client.`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#f2f4f6;font-family:Arial,Helvetica,sans-serif;color:#172538">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
 <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #dfe4e9;">
 <tr><td style="padding:30px 28px;background:#0a192f;border-bottom:4px solid #bd9b62;color:#fff;"><div style="font-size:27px;font-weight:bold;letter-spacing:3px;">HERRITON</div><div style="font-size:12px;letter-spacing:2px;margin-top:8px;color:#dbc5a1;">PROPERTY VALUATIONS</div></td></tr>
 <tr><td style="padding:28px 28px 18px;"><div style="font-size:11px;letter-spacing:2px;color:#806331;">NEW WEBSITE ENQUIRY</div><h1 style="font-size:23px;line-height:1.3;margin:12px 0;">${escape(title)}</h1><p style="font-size:14px;line-height:1.6;color:#526174;margin:0;">A client has submitted the following details through the Herriton website.</p></td></tr>
 <tr><td style="padding:0 28px 24px;"><table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">${rows.map(([label,value])=>`<tr><th scope="row" width="35%" align="left" valign="top" style="padding:13px 10px 13px 0;border-bottom:1px solid #e8ecf0;font-size:13px;font-weight:bold;">${escape(label)}</th><td valign="top" style="padding:13px 0;border-bottom:1px solid #e8ecf0;font-size:14px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word;">${escape(value).replace(/\r\n|\r|\n/g,'<br>')}</td></tr>`).join('')}</table></td></tr>
 <tr><td style="padding:20px 28px;background:#f8f6f1;font-size:14px;line-height:1.6;"><strong>Next step</strong><br>Reply to this email to contact the client. Their email address is set as the reply-to address.</td></tr>
 <tr><td style="padding:20px 28px;color:#697789;font-size:11px;line-height:1.6;">Herriton Property Valuations · Website enquiries<br>Client details are provided for responding to this enquiry.</td></tr>
 </table></td></tr></table></body></html>`;
 return {text,html};
}
