import React, {useState} from 'react';
import {UserRound,Quote,ArrowUpRight} from 'lucide-react';

// Illustrative copy only. Replace with permissioned, genuine client reviews before publishing.
export const recommendations = [
 {id:'homeowner',name:'Sample homeowner',location:'Sydney, NSW',service:'Residential valuation',photo:null,quote:'The process was straightforward, and the report explained the property assessment clearly. Having someone talk us through the details made our next steps easier.'},
 {id:'investor',name:'Sample property investor',location:'Parramatta, NSW',service:'Market assessment',photo:null,quote:'We appreciated the clear communication and the care taken to understand our property. The assessment gave us a useful starting point for our planning.'},
 {id:'adviser',name:'Sample professional adviser',location:'North Sydney, NSW',service:'Commercial valuation',photo:null,quote:'A considered approach from the first conversation. The scope was clearly explained, and the property information was presented in a way that was easy to follow.'}
];
function Avatar({name,photo}){
 const [failed,setFailed]=useState(false);
 return <span className="review-avatar">{photo&&!failed?<img src={photo} alt={`${name} profile`} loading="lazy" onError={()=>setFailed(true)}/>:<UserRound size={23} strokeWidth={1.6} aria-hidden="true"/>}</span>;
}
export default function Recommendations({go}){
 return <section className="section recommendations" aria-labelledby="recommendations-title"><div className="section-heading"><div><div className="eyebrow">CLIENT RECOMMENDATIONS</div><h2 id="recommendations-title">A little perspective.<br/><em>From the people we help.</em></h2></div>{go&&<a className="text-button" href="#clients" onClick={()=>go('clients')}>Meet our clients <ArrowUpRight size={17}/></a>}</div><p className="review-disclosure">Sample testimonials for this website preview. These are illustrative examples, not verified client reviews.</p><div className="recommendation-grid">{recommendations.map(review=><figure className="recommendation-card" key={review.id}><div className="review-card-top"><span className="review-service">{review.service}</span><Quote size={23} strokeWidth={1.5} aria-hidden="true"/></div><blockquote><p>{review.quote}</p></blockquote><figcaption><Avatar name={review.name} photo={review.photo}/><div><strong>{review.name}</strong><span>{review.location}</span></div><span className="review-sample">Sample</span></figcaption></figure>)}</div></section>;
}
