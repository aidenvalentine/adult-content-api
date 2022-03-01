const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const path = require('path');
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

// Make sure user has filled out necessary info.
if (conf.settings.woocommerce.site_url && conf.settings.woocommerce.consumer_key && conf.settings.woocommerce.consumer_secret) {
  // credentials
  var WooCommerce = new WooCommerceRestApi({
    url: conf.settings.woocommerce.site_url,
    consumerKey: conf.settings.woocommerce.consumer_key,
    consumerSecret: conf.settings.woocommerce.consumer_secret,
    version: conf.settings.woocommerce.version || "wc/v3",
    queryStringAuth: conf.settings.woocommerce.query_string_auth || true
  });
}

/**
 * Login to Xvideos.
 * Init a new webdriverio session.
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function postProduct(data, callback) {
  data.type = "variable";
  data.status = "draft";
  data.tax_status = "none";
  data.tax_class = "Zero Rate";
  data.attributes = [];
  data.attributes.push({
    id: 4,
    name: "File Format",
    variation: true,
    options: ["HD 1080p MP4", "3-Day VOD Rental"]
  });
  data.default_attributes = [];
  data.default_attributes.push({
    id: 4,
    name: "File Format",
    option: "HD 1080p MP4"
  });
  delete data.id;
  delete data.variations;
  // delete data.tags;
  delete data.images; // TEMP. Upload error b/c clipnuke.com isn't on the net.

  function removeMeta(obj) {
    for (prop in obj) {
      if (prop === 'id')
        delete obj[prop];
      else if (typeof obj[prop] === 'object')
        removeMeta(obj[prop]);
    }
  }

  removeMeta(data.tags);
  removeMeta(data.images);
  removeMeta(data.categories);

  // WooCommerce.get("products/categories")
  //   .then((response) => {
  //     console.log(response.data);
  //   })
  //   .catch((error) => {
  //     console.log(error.response.data);
  //   });

  console.log(data);

  WooCommerce.post("products", data)
    .then((response) => {
      var id = response.data.id;
      console.log(response.data);
      var variation = {};
      variation.regular_price = "1.99";
      variation.tax_status = "none";
      variation.tax_class = "Zero Rate";
      variation.virtual = true;
      variation.attributes = [];
      variation.attributes.push({
        id: 4,
        name: "File Format",
        option: "3-Day VOD Rental"
      });

      /** Create Variations */
      WooCommerce.post("products/" + id + "/variations", variation)
        .then((response) => {
          console.log(response.data);
          WooCommerce.post("products", data)
            .then((response) => {
              console.log(response.data);
              var variation = {};
              variation.tax_status = "none";
              variation.tax_class = "Zero Rate";
              variation.virtual = true;
              variation.downloadable = true;
              variation.attributes = [];
              variation.attributes.push({
                id: 4,
                name: "File Format",
                option: "HD 1080p MP4"
              });

              /** Create Variations */
              WooCommerce.post("products/" + id + "/variations", variation)
                .then((response) => {
                  console.log(response.data);
                })
                .catch((error) => {
                  console.log(error.response.data);
                });

              /** Callback */
              // callback(null, response.data);
            })
            .catch((error) => {
              console.log(error.response.data);
            });
        })
        .catch((error) => {
          console.log(error.response.data);
        });

      /** Callback */
      // callback(null, response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
      var msg = {};
      msg.id = error.response.data.data.resource_id;
      msg.code = error.response.data.code;
      msg.msg = error.response.data.message;
      callback(error.message, msg);
    });

}

function getProduct(id, callback) {
  WooCommerce.get("products/" + id)
    .then((response) => {
      console.log(response.data);
      callback(null, response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
      callback(error, error.response.data);
    });
}

module.exports = {
  postProduct,
  getProduct
};
