import React, {useEffect, useRef, useState} from 'react';
import {MessageCircle, X, Send, ArrowUpRight} from 'lucide-react';
import {pathFor} from './seo';
import './chatbot.css';

const faqs = [
 {question:'What services do you offer?', match:/service|offer|residential|commercial|retail|industrial|land|specialt/i, answer:'Herriton offers residential, commercial, retail, land and development, industrial and specialised property valuations. The scope is tailored to your property and the purpose of the report.', page:'specialties', link:'Explore our services'},
 {question:'Which areas do you cover?', match:/area|cover|location|sydney|nsw|suburb|where/i, answer:'We serve Sydney and New South Wales, including the CBD, Inner West, Eastern Suburbs, North Shore, Western Suburbs and Central Coast. Share your property address so the team can confirm availability.', page:'locations', link:'View service areas'},
 {question:'How much does a valuation cost?', match:/cost|price|fee|quote|much|free/i, answer:'Fees depend on the property and the agreed scope. You can request a free quote with your property details and valuation purpose. The team will discuss the fee before you proceed.', page:'quote', link:'Request a free quote'},
 {question:'How long does a valuation take?', match:/how long|time|turnaround|urgent|deadline|days|weeks/i, answer:'Timing depends on the scope, property access and availability. Include your deadline in your enquiry so the team can discuss inspection and report delivery arrangements.', page:'contact', link:'Discuss your timing'},
 {question:'What information should I provide?', match:/document|provide|prepare|information|details|need|bring/i, answer:'Have your contact details, property address, property type and reason for the valuation ready. Include your intended use of the report and any deadline. Available plans, tenancy information and supporting property documents can help.', page:'order', link:'Start a valuation request'},
 {question:'How do I request a valuation?', match:/request|book|order|start|appointment|inspection|process/i, answer:'Start with the valuation request form. Share your property details and purpose, then the team can discuss scope, fees and property access arrangements before proceeding.', page:'order', link:'Request a valuation'},
 {question:'What is a market assessment?', match:/market|assessment|report|value|worth/i, answer:'A market assessment is an independent assessment at a nominated valuation date. It considers the property’s location, condition and features alongside relevant market evidence. The report explains the assessment and agreed scope.', page:'market', link:'About market assessments'},
 {question:'How can I contact the team?', match:/contact|human|person|team|email|phone|call|speak|help/i, answer:'Use the contact form to send your question to the Herriton team. For a property enquiry, include the address, intended use of the report and any timing requirements.', page:'contact', link:'Contact Herriton'},
 {question:'Can I become a referral partner?', match:/partner|referral|refer|broker|solicitor|accountant/i, answer:'Solicitors, accountants, brokers and property professionals can register their interest through the referral partner form. The team can discuss introductions, scope and communication arrangements.', page:'partners', link:'Referral partnerships'},
];
const welcome={role:'bot',text:'Hi! I’m the Herriton FAQ assistant. Ask about our valuation services, quotes or how to get started.'};
function replyTo(text){
 if(/^(hi|hello|hey|thanks|thank you)[!.\s]*$/i.test(text.trim()))return {text:'Hello! How can I help with your property valuation? Choose a question below or type your own.'};
 const faq=faqs.find(item=>item.match.test(text));
 return faq?{text:faq.answer,page:faq.page,link:faq.link}:{text:'I can help with common questions about Herriton’s services, areas, quotes and valuation process. For your specific property or a question I cannot answer, please contact the team.',page:'contact',link:'Ask the team'};
}
export default function Chatbot(){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState([welcome]),[input,setInput]=useState('');
 const launcher=useRef(null),field=useRef(null),log=useRef(null);
 useEffect(()=>{if(open)field.current?.focus()},[open]);
 useEffect(()=>{if(open&&log.current)log.current.scrollTop=log.current.scrollHeight},[messages,open]);
 function close(){setOpen(false);launcher.current?.focus()}
 function ask(text){const question=text.trim();if(!question)return;setMessages(previous=>[...previous,{role:'user',text:question},{role:'bot',...replyTo(question)}]);setInput('');field.current?.focus()}
 return <div className="herriton-chat">
  {open&&<section className="chat-panel" id="herriton-chat-panel" role="dialog" aria-label="Herriton FAQ assistant" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close()}}}>
   <div className="chat-heading"><span className="chat-avatar"><MessageCircle size={22}/></span><div><h2>Herriton assistant</h2><span>Quick answers about property valuations</span></div><button type="button" className="chat-close" aria-label="Close chat" onClick={close}><X size={20}/></button></div>
   <div className="chat-messages" ref={log} role="log" aria-live="polite" aria-relevant="additions" aria-label="Chat messages">{messages.map((message,index)=><div className={`chat-message ${message.role}`} key={index}><span className="chat-speaker">{message.role==='bot'?'Herriton':'You'}</span><p>{message.text}</p>{message.page&&<a href={pathFor(message.page)}>{message.link}<ArrowUpRight size={14}/></a>}</div>)}</div>
   <div className="chat-suggestions" aria-label="Common questions">{faqs.slice(0,6).map(faq=><button type="button" key={faq.question} onClick={()=>ask(faq.question)}>{faq.question}</button>)}</div>
   <form className="chat-compose" onSubmit={e=>{e.preventDefault();ask(input)}}><input ref={field} aria-label="Your question" placeholder="Type your question…" value={input} onChange={e=>setInput(e.target.value)} maxLength={500}/><button type="submit" aria-label="Send question" disabled={!input.trim()}><Send size={19}/></button></form>
   <p className="chat-note">Automated FAQ answers · For specific enquiries, <a href={pathFor('contact')}>contact our team</a>.</p>
  </section>}
  <button type="button" ref={launcher} className="chat-launcher" aria-label={open?'Close chat':'Open chat'} aria-expanded={open} aria-controls="herriton-chat-panel" onClick={()=>open?close():setOpen(true)}>{open?<X size={25}/>:<MessageCircle size={27}/>}</button>
 </div>;
}
