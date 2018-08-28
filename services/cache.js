const mongoose = require('mongoose')
const redis = require("redis");
const util = require("util");

const keys = require('../config/keys')
const redisClient = redis.createClient(keys.redisUrl);

// redis does not return promise, it expects a callback
// we can use the utility function promisify to wrap a function so that it returns a promise for the callback
redisClient.hget = util.promisify(redisClient.hget);
const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || 'default')
    return this
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    // Do we already have a key?  If so, return those results
    const cacheValue = await redisClient.hget(this.hashKey, key)

    if (cacheValue) {
        const doc = JSON.parse(cacheValue)

        // return hydrated form....need to account for single instance and arrays
        return Array.isArray(doc) ?
            doc.map(d => new this.model(d)) :
            new this.model(doc)
    }

    // otherwise, issue the query and store the results in our cache (redis)
    const result = await exec.apply(this, arguments)
    redisClient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)

    return result
}

module.exports = {
    clearHash(hashKey) {
        redisClient.del(JSON.stringify(hashKey))
    }
}