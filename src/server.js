import App from './components/App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import get from "lodash.get";
import {getItem, getProduct} from "./api/item";
import {addToCart} from "./api/cart";
import {getAds} from "./api/ads";
require('dotenv').config();

const bodyParser = require('body-parser')

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

const getCCMData = () => {
  return {
    "enableReviews": true
  };
};

server
  .disable('x-powered-by')
  .use(bodyParser.raw())
  .use(bodyParser.json({type: "*/*"}))
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get("/api/ads", getAds)
  .post("/api/item", getItem)
  .post("/api/addToCart", addToCart)
  .get('/item/:id', (req, res) => {
    const {params = {}} = req;
    const {id} = params;
    const ccmData = getCCMData();
    let itemData = {};
    if (!process.env.DISABLE_SSR) {
      itemData = getProduct(id);
    }
    const selectedItem = get(itemData, `items[${id}]`, {});
    const selectedItemImages = get(selectedItem, "images", []);
    const selectedImageId = get(selectedItemImages, "0", "");
    const initialState = {...itemData, selectedImageId, ccm: ccmData};
    const context = {};
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App preloadedState={initialState} />
      </StaticRouter>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
        ${
          process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\u003c')}
        </script>
    </head>
    <body>
        <div id="root">${markup}</div>
    </body>
</html>`
      );
    }
  });


export default server;
