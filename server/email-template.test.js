import test from 'node:test';
import assert from 'node:assert/strict';
import {enquiryEmail} from './email-template.js';
test('client content is escaped in HTML and remains readable in plain text',()=>{
 const message='<img src=x onerror=alert(1)>\nA & B "quoted"';
 const content=enquiryEmail('contact',{firstName:'Alex',lastName:'Silva',email:'alex@example.com',message,phone:'',website:'private-honeypot'},0);
 assert.ok(!content.html.includes('<img'));
 assert.ok(content.html.includes('&lt;img src=x onerror=alert(1)&gt;<br>A &amp; B &quot;quoted&quot;'));
 assert.ok(content.text.includes(message));
 assert.ok(content.html.includes('Not provided'));
 assert.ok(!content.html.includes('private-honeypot'));
});
test('valuation emails include optional requirements and attachment counts',()=>{
 const content=enquiryEmail('valuation',{firstName:'Alex',surname:'Silva',address:'12 Sample Street',otherPurpose:'Special assessment',notes:'Line one\nLine two'},2);
 for(const value of ['Property valuation request','Last name','12 Sample Street','Other requirements','Special assessment','Attachments'])assert.ok(content.html.includes(value));
 assert.ok(content.text.includes('Attachments: 2'));
 assert.throws(()=>enquiryEmail('invalid',{}));
});
