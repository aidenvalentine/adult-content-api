var wooRouter = require('express').Router({
  mergeParams: true
});
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// woocommerce Helper
const helper = require('./wooHelper.js');

wooRouter.get('/', (req, res) => {
  res.status(200).json({
    message: 'WooCommerce Router!'
  });
});

// route to trigger the capture
wooRouter.post('/', jsonParser, function(req, res) {
  var event = req.body;
  console.log(JSON.stringify(event, null, 2)); // Mock

  helper.postProduct(event, function(err, data) {
    console.log(data);
    res.json(data);
  });
});

// route to trigger the capture
wooRouter.get('/product/:id', function(req, res) {
  var event = req.body;
  const id = req.params.id;
  console.log(JSON.stringify(event, null, 2)); // Mock

  helper.getProduct(id, function(err, data) {
    console.log(data);
    res.json(data);
  });
});

module.exports = wooRouter;
