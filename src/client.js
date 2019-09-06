import App from './components/App';
import React from 'react';
import { hydrate } from 'react-dom';
const BrowserRouter = require('react-router-dom').BrowserRouter;
const preloadedState = window.__PRELOADED_STATE__;
import 'whatwg-fetch';

hydrate(
  <BrowserRouter>
    <App preloadedState={preloadedState} />
  </BrowserRouter>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
