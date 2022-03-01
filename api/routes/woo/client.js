'use strict';

const WooCommerceAPI = require('woocommerce-api');

/** Setup WooCommerce client */
var WooCommerce = new WooCommerceAPI({
  url: process.env.WP_BASE_URL,
  consumerKey: process.env.WC_CONSUMER_KEY,
  consumerSecret: process.env.WC_CONSUMER_SECRET,
  wpAPI: true,
  version: 'wc/v2'
});

module.exports = {
  WooCommerce: WooCommerce
};
