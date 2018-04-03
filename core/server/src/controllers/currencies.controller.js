const {Currency, Currencies} = require('../models/currencies.model');
const request = require('request-promise');
// const queue = require('../redis').queue;

/**
 * Load currency and append to req.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} symbol - The symbol of the currency to load.
 */
function load(req, res, next, symbol) {
  Currency.get(symbol)
    .then((currency) => {
      req.currency = currency;
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get currency
 * @param {*} req
 * @param {*} res
 * @returns {Event}
 */
function get(req, res) {
  return res.json(req.currency);
}

/**
 * Get currency list.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function list(req, res, next) {
  Currencies.list()
    .then((events) => res.json(events))
    .catch((e) => next(e));
}

/**
 * Refresh data of currency.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 * @param {string} symbol - The symbol of the currency to update.
 */
function updateCurrency(req, res, next) {
  const symbol = req.currency;
  request(`http://coincap.io/page/${symbol}`)
    .then((data) => {
      Currency.updateCurrency(symbol, data)
        .then((data) => res.json(data))
        .catch((e) => next(e));
    });
}

/**
 * Refresh list of currencies.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function refreshCurrencies(req, res, next) {
  request('http://coincap.io/coins')
    .then((currencies) => {
      Currencies.updateCurrencies(currencies)
        .then((currencies) => res.json(currencies))
        .catch((e) => next(e));
    });
}

module.exports = {load, get, refreshCurrencies, updateCurrency, list};
