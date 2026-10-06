import {pages} from '../src/seo.js';
import { test, expect } from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.route('**/api/form-config',route=>route.fulfill({json:{available:true,siteKey:null,attachmentsEnabled:true}}));
 await page.route('**/api/enquiries',route=>route.fulfill({json:{ok:true}}));
});


test('all company pages support navigation and direct reloads', async ({ page }) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  for(const [route,label,title] of [['clients','Our Clients','Different journeys.'],['specialties','Our Specialties','The right expertise.'],['insights','Insight','A fresh perspective'],['locations','Our Locations','Local understanding.'],['contact','Contact Us','Good conversations.'],['partners','Referral Partner','Better connections.'],['about','About Us','Property is personal.']]){
    if(await page.getByRole('button',{name:'Toggle navigation'}).isVisible()) await page.getByRole('button',{name:'Toggle navigation'}).click();
    if(['Our Clients','Referral Partner','About Us'].includes(label)) await page.getByRole('button',{name:'About us',exact:true}).click();
    if(label==='Our Specialties') await page.getByRole('button',{name:'Property valuations',exact:true}).click();
    await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();
    await expect(page.locator('h1')).toContainText(title);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(title);
    await expect(page).toHaveURL(new RegExp(`${pages[route].path}$`));
  }
  expect(errors).toEqual([]);
});
test('location search, insight reading and sample forms work', async ({ page }) => {
  await page.goto('/#locations', { waitUntil: 'domcontentloaded' });
  await page.getByRole('searchbox').fill('Inner');
  await expect(page.locator('.location-card')).toHaveCount(1);
  await page.getByRole('button',{name:'Inner West',exact:true}).click();
  await expect(page.getByLabel('Property address or area')).toHaveValue('Inner West');
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.getByText('No matching areas.')).toBeVisible();
  await page.goto('/#insights', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button',{name:'Understanding valuations',exact:true}).click();
  await expect(page.locator('.journal-card')).toHaveCount(1);
  await page.locator('.journal-card').click();
  await expect(page.getByRole('heading',{name:'Read it as a whole'})).toBeVisible();
  await page.getByRole('button',{name:'Back to all insights'}).click();
  await expect(page.locator('.journal-card')).toHaveCount(3);
  for(const route of ['contact','partners']){
    await page.goto(`/#${route}`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('First name').fill('Alex');
    await page.getByLabel('Last name').fill('Silva');
    await page.getByLabel('Email',{exact:false}).fill('alex@example.com');
    if(route==='partners')await page.getByLabel('Business name').fill('Sample Advisory');
    await page.locator('textarea').fill('Please discuss the property brief.');
    await page.getByRole('checkbox').check();
    await page.locator('form button[type="submit"], form button.full').click();
    await expect(page.getByRole('status')).toContainText('Your enquiry has been sent to our team.');
  }
});
test('mobile menu reaches every new page without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  for(const label of ['Our Clients','Our Specialties','Insight','Our Locations','Contact Us','Referral Partner','About Us']){
    await page.getByRole('button',{name:'Toggle navigation'}).click();
    if(['Our Clients','Referral Partner','About Us'].includes(label)) await page.getByRole('button',{name:'About us',exact:true}).click();
    if(label==='Our Specialties') await page.getByRole('button',{name:'Property valuations',exact:true}).click();
    await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();
    await expect(page.locator('.company-hero .eyebrow')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.screenshot({path:'reference/about-mobile-preview.png',fullPage:true});
});
