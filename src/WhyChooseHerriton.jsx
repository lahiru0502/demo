import {pathFor} from './seo';
import React from 'react';
import {ShieldCheck,MessagesSquare,ClipboardCheck,ArrowUpRight} from 'lucide-react';
const benefits=[
 {id:'independent',Icon:ShieldCheck,title:'Independent perspective',description:'Start with an assessment shaped around your property, its characteristics and relevant market evidence.',detail:'Evidence-led property insight'},
 {id:'communication',Icon:MessagesSquare,title:'Clear communication',description:'Discuss your purpose, ask questions and understand the agreed scope before taking the next step.',detail:'A straightforward conversation'},
 {id:'tailored',Icon:ClipboardCheck,title:'A scope that fits',description:'Share your property type, intended use of the report and timing requirements so the assessment can fit your brief.',detail:'Your property. Your requirements.'}
];
export default function WhyChooseHerriton({go}){
 return <section className="section why-herriton" aria-labelledby="why-herriton-title"><div className="section-heading"><div><div className="eyebrow">WHY CHOOSE HERRITON</div><h2 id="why-herriton-title">Considered advice.<br/><em>A clearer way forward.</em></h2></div>{go&&<a className="text-button" href={pathFor('about')} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)go('about')}}>Explore our approach <ArrowUpRight size={17}/></a>}</div><div className="benefit-grid">{benefits.map(({id,Icon,title,description,detail})=><article className="benefit-card" key={id}><span className="benefit-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true"/></span><h3>{title}</h3><p>{description}</p><span className="benefit-detail">{detail}</span></article>)}</div></section>;
}
