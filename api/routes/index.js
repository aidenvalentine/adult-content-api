const router = require('express').Router({ mergeParams: true });
var manyvids = require('./manyvids');
var clips4sale = require('./clips4sale');
var xvideos = require('./xvideos');
// var google = require('./google');
var azure = require('./azure');
var clipnuke = require('./clipnuke');
var woo = require('./woo');
var pornhub = require('./pornhub');
var aebn = require('./aebn');
var hotmovies = require('./hotmovies');
var adultempire = require('./adultempire');
var local = require('./local');

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
 * Xvideos Router
 * @type {String}
 */
router.use('/xvideos', xvideos);

/**
 * Google Router
 * @type {String}
 */
// router.use('/google', google);

/**
 * Azure Router
 * @type {String}
 */
router.use('/azure', azure);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/clipnuke', clipnuke);

/**
 * WooCommerce Router
 * @type {String}
 */
router.use('/woo', woo);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/pornhub', pornhub);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/aebn', aebn);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/hotmovies', hotmovies);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/adultempire', adultempire);

/**
 * Clipnuke Router
 * @type {String}
 */
router.use('/local', local);

module.exports = router;
