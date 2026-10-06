export const pages={
 'insight-prepare':{path:'/insights/preparing-for-a-property-valuation/',title:'Preparing for a Property Valuation | Herriton',description:'A practical checklist for a Sydney or NSW property valuation: define your purpose, gather property details and prepare useful questions for your valuer.'},
 'insight-report':{path:'/insights/understanding-a-valuation-report/',title:'Understanding a Property Valuation Report | Herriton',description:'Understand the purpose, property information, market evidence and assumptions in a property valuation report. Read Herriton\'s practical guide.'},
 'insight-brief':{path:'/insights/commercial-property-valuation-brief/',title:'Preparing a Commercial Property Valuation Brief | Herriton',description:'Prepare a clearer commercial property valuation brief with property use, tenancy details, available documents and your intended report purpose.'},
 home:{path:'/',title:'Property Valuations Sydney & NSW | Herriton',description:'Explore residential and commercial property valuations in Sydney and New South Wales. Discuss your property, report purpose and assessment requirements with Herriton.'},
 market:{path:'/property-valuations/market-assessment/',title:'Market Assessment Valuations Sydney | Herriton',description:'Understand your Sydney property with a market assessment valuation. Explore the evidence, report scope and information needed to request a tailored quote.'},
 specialties:{path:'/property-valuations/',title:'Residential & Commercial Property Valuations | Herriton',description:'Explore residential, commercial, retail, industrial and land valuation services in Sydney and NSW. Find a starting point for your property assessment.'},
 clients:{path:'/our-clients/',title:'Property Valuations for Owners & Advisers | Herriton',description:'Property valuation enquiries for homeowners, buyers, investors, businesses, legal professionals and advisers across Sydney and New South Wales.'},
 about:{path:'/about/',title:'About Herriton Property Valuations | Sydney & NSW',description:'Discover Herriton\'s approach to property valuations: independent perspective, local understanding and straightforward communication about your property.'},
 insights:{path:'/insights/',title:'Property Valuation Guides & Insights | Herriton',description:'Read practical property valuation guides. Prepare for an assessment, understand valuation reports and put together a clearer commercial property brief.'},
 locations:{path:'/locations/',title:'Sydney & NSW Property Valuation Service Areas | Herriton',description:'Explore property valuation enquiries across Sydney and NSW, including the Inner West, North Shore, Parramatta region and Central Coast. Confirm availability.'},
 contact:{path:'/contact/',title:'Contact Herriton | Property Valuation Enquiries Sydney',description:'Contact Herriton about a Sydney or NSW property valuation. Share your property address, report purpose and timing requirements to discuss the next step.'},
 partners:{path:'/referral-partners/',title:'Property Valuation Referral Partners | Herriton',description:'Explore property valuation introductions for solicitors, accountants, brokers and property professionals. Discuss requirements and referral arrangements.'},
 order:{path:'/request-a-valuation/',title:'Request a Property Valuation Sydney & NSW | Herriton',description:'Request a property valuation with Herriton. Share your contact details, property type, address and valuation purpose so your requirements can be discussed.'},
 quote:{path:'/free-quote/',title:'Request a Free Property Valuation Quote | Herriton',description:'Request a free quote for a Sydney or NSW property valuation. Tell Herriton about your property and the purpose of the assessment.'}
};
export const pathFor=id=>id==='approach'?'/#approach':pages[id]?.path||'/';
export function currentPage(){const legacy=location.hash.slice(1);if(pages[legacy])return legacy;const pathname=location.pathname.replace(/\/$/,'')||'/';return Object.keys(pages).find(id=>(pages[id].path.replace(/\/$/,'')||'/')===pathname)||'not-found'}
export function metadata(id,siteUrl=''){
 const page=pages[id]||{path:'/404.html',title:'Page Not Found | Herriton',description:'This page could not be found. Explore Herriton property valuation services or contact the team.'};
 const url=siteUrl&&pages[id]?siteUrl+page.path:'';
 const schema=siteUrl&&pages[id]?{'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':siteUrl+'/#organisation',name:'Herriton Property Valuations',url:siteUrl+'/',logo:siteUrl+'/brand/logo.png'},
 {'@type':'WebSite','@id':siteUrl+'/#website',url:siteUrl+'/',name:'Herriton Property Valuations',inLanguage:'en-AU',publisher:{'@id':siteUrl+'/#organisation'}},
 {'@type':'WebPage','@id':url+'#webpage',url,name:page.title,description:page.description,inLanguage:'en-AU',isPartOf:{'@id':siteUrl+'/#website'}},
 ...(id!=='home'?[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl+'/'},{'@type':'ListItem',position:2,name:page.title.split(' | ')[0],item:url}]}]:[]),
 ...(id.startsWith('insight-')?[{'@type':'Article',headline:page.title.split(' | ')[0],description:page.description,inLanguage:'en-AU',mainEntityOfPage:{'@id':url+'#webpage'},publisher:{'@id':siteUrl+'/#organisation'}}]:[]),
 ...(['market','specialties'].includes(id)?[{'@type':'Service',name:id==='market'?'Market assessment property valuation':'Property valuation services',serviceType:'Property valuation',provider:{'@id':siteUrl+'/#organisation'},areaServed:[{'@type':'City',name:'Sydney'},{'@type':'State',name:'New South Wales'}],url}]:[])
 ]}:null;
 return {...page,url,schema};
}
