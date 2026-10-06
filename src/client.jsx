import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import App from './main';
import {currentPage} from './seo';
const root=document.getElementById('root');
const app=<App initialPage={root.dataset.page||currentPage()}/>;
if(root.hasChildNodes())hydrateRoot(root,app);else createRoot(root).render(app);
