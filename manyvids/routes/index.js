const router = require('express').Router({ mergeParams: true });
var manyvids = require('./manyvids');

/**
 * Test Route - Root
 * @type {String}
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

module.exports = router;
