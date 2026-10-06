import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/form-config',route=>route.fulfill({json:{available:true,siteKey:null,attachmentsEnabled:true}}));});
test('readable layouts across phone, tablet, desktop and enlarged text',async({page})=>{
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['home','order','quote','market','clients','specialties','insights','locations','contact','partners','about']){
   await page.goto('/#'+route);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}px`).toBe(true);
   const small=await page.locator('main p,main label,main button,footer a').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width>0&&parseFloat(getComputedStyle(n).fontSize)<16).map(n=>n.textContent));
   expect(small,`small text on ${route} at ${width}px`).toEqual([]);
  }
  await page.goto('/');
  const menu=page.getByRole('button',{name:'Toggle navigation'});
  if(await menu.isVisible()){await menu.click();await page.getByRole('navigation').getByRole('button',{name:'Property valuations',exact:true}).click();await page.getByRole('navigation').getByRole('link',{name:'Market Assessment',exact:true}).click();await expect(page.locator('h1')).toContainText('A clear view');}
 }
 for(const route of ['home','order','contact']){
  await page.setViewportSize({width:768,height:1000});await page.goto('/#'+route);
  await page.addStyleTag({content:'p,label,button,a,small{font-size:200% !important}'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`enlarged text on ${route}`).toBe(true);
 }
});
