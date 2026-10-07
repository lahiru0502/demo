import {test, expect} from '@playwright/test';
import {pages} from '../src/seo.js';

test('chat stays fixed and retains its conversation across page navigation', async ({page}) => {
 await page.goto('/');
 const launcher=page.getByRole('button',{name:'Open chat',exact:true});
 const before=await launcher.boundingBox();
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 const after=await launcher.boundingBox();
 expect(after.x).toBe(before.x);expect(after.y).toBe(before.y);
 await launcher.click();
 const chat=page.getByRole('dialog',{name:'Herriton FAQ assistant'});
 await chat.getByRole('button',{name:'How much does a valuation cost?'}).click();
 await expect(chat.getByRole('log')).toContainText('Fees depend on the property');
 await chat.getByRole('link',{name:'Request a free quote',exact:true}).click();
 await expect(page).toHaveURL(/\/free-quote\/?$/);
 await expect(chat).toBeVisible();
 await expect(chat.getByRole('log')).toContainText('Fees depend on the property');
 await chat.getByRole('textbox',{name:'Your question'}).fill('unrecognised question');
 await chat.getByRole('button',{name:'Send question'}).click();
 await expect(chat.getByRole('log')).toContainText('For your specific property');
 await page.keyboard.press('Escape');
 await expect(chat).not.toBeVisible();
 await expect(page.getByRole('button',{name:'Open chat',exact:true})).toBeFocused();
});

test('chat is available on every page and fits mobile screens', async ({page}) => {
 await page.setViewportSize({width:390,height:844});
 for(const route of [...Object.values(pages).map(item=>item.path), '/missing-page']){
  await page.goto(route);
  await page.getByRole('button',{name:'Open chat',exact:true}).click();
  const chat=page.getByRole('dialog',{name:'Herriton FAQ assistant'});
  await expect(chat).toBeVisible();
  const box=await chat.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);expect(box.y).toBeGreaterThanOrEqual(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
