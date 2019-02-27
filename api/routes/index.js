const router = require('express').Router({ mergeParams: true });
var manyvids = require('./manyvids');
var clips4sale = require('./clips4sale');

/**
 * ManyVids Router
 * @type {String}
 */
router.use('/manyvids', manyvids);

/**
 * Clips4Sale Router
 * @type {String}
 */
router.use('/clips4sale', clips4sale);

/**
 * Test Route - Root
 * @type {String}
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

module.exports = router;
