const NodeCache = require('node-cache');

const transactionCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const userCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const pendingCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const supplierCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = {
  setCache: (type, key, data) => {
    if (type === 'transaction') {
      transactionCache.set(key, data);
    } else if (type === 'customer') {
      userCache.set(key, data);
    } else if (type === 'pending_transaction') {
      pendingCache.set(key, data);
    } else {
      supplierCache.set(key, data);
    }
  },

  deleteCache: (type) => {
    if (type === 'transaction') {
      transactionCache.flushAll();
    } else if (type === 'customer') {
      userCache.flushAll();
    } else if (type === 'pending_transaction') {
      pendingCache.flushAll();
    } else {
      supplierCache.flushAll();
    }
  },

  getCache: (type, key) => {
    if (type === 'transaction') {
      return transactionCache.get(key);
    } else if (type === 'customer') {
      return userCache.get(key);
    } else if (type === 'pending_transaction') {
      return pendingCache.get(key);
    } else {
      return supplierCache.get(key);
    }
  },
};
