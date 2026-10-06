import React from 'react';
import {renderToString} from 'react-dom/server';
import App from './main';
export const render=page=>renderToString(<App initialPage={page}/>);
