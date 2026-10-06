import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import './header.css';

export default function Header({ page, go, order }) {
  const [mobile, setMobile] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const header = useRef(null);
  useEffect(() => { setMobile(false); setDropdown(null); }, [page]);
  useEffect(() => {
    const outside = e => { if (!header.current?.contains(e.target)) { setDropdown(null); setMobile(false); } };
    const escape = e => { if (e.key === 'Escape') { header.current?.querySelector(`[data-group="${dropdown}"]`)?.focus(); setDropdown(null); setMobile(false); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [dropdown]);
  const navigate = id => { setMobile(false); setDropdown(null); go(id); };
  const link = (id, label) => <a key={id} href={`#${id}`} className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}>{label}</a>;
  const group = (id, label, links) => <div className="nav-group" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(current => current === id ? null : current); }}>
    <button data-group={id} className={links.some(([route]) => route === page) ? 'nav-trigger active' : 'nav-trigger'} aria-expanded={dropdown === id} aria-controls={`nav-${id}`} onClick={() => setDropdown(dropdown === id ? null : id)}>{label}<ChevronDown size={13}/></button>
    {dropdown === id && <div className="nav-dropdown" id={`nav-${id}`}>{links.map(([route, text]) => link(route, text))}</div>}
  </div>;
  return <header className="site-header" ref={header}>
    <a href="#home" className="brand" onClick={() => navigate('home')}><img className="brand-logo" src="/brand/logo-white.png" alt="Herriton Property Valuations"/></a>
    <nav id="primary-navigation" aria-label="Main navigation" className={mobile ? 'primary-nav open' : 'primary-nav'}>
      {link('home', 'Home')}
      {group('services', 'Property valuations', [['market', 'Market Assessment'], ['specialties', 'Our Specialties']])}
      {group('company', 'About us', [['about', 'About Us'], ['clients', 'Our Clients'], ['partners', 'Referral Partner'], ['approach', 'Our approach']])}
      {link('insights', 'Insight')}
      {link('locations', 'Our Locations')}
      {link('contact', 'Contact Us')}
    </nav>
    <button className="button nav-cta" onClick={() => { setMobile(false); setDropdown(null); order(); }}>Request a valuation <ArrowUpRight size={16}/></button>
    <button className="menu-button" aria-label="Toggle navigation" aria-controls="primary-navigation" aria-expanded={mobile} onClick={() => { setMobile(!mobile); setDropdown(null); }}>{mobile ? <X/> : <Menu/>}</button>
  </header>;
}
