// @ts-nocheck

const Knex = require("knex");

/**
 *  Set the redis connection for Knex
 */
Knex.QueryBuilder.extend("setRedis", function (redis) {
  this.client.redis = redis;
  return this.client.redis;
});

/**
 *  Extend knex to first check Redis for a cached query result.
 *  This is only used when explicitly requested on a given query:
 *  topics.findById(1).cache() will pull the cached version if there is one
 *  (or set the cache for next time if no cached data is present),
 *  but topics.findById(1) will not use the cache at all,
 *  instead always interacting directly with the database.
 *
 *  cache() should not be used for data that might change (e.g., user tags),
 *  but it is safe to use on pure content, since Boombox treats content
 *  as immutable once it is stored in the database.
 *
 *  TODO: Write tests to verify correct caching
 */
Knex.QueryBuilder.extend("cache", async function () {
  // check for a cached Redis result
  const cacheKey = this.toString();
  const result = await this.client.redis.get(cacheKey);
  if (result) {
    return JSON.parse(result);
  }
  // if there is no result,
  // run the query and cache the result for next time
  const data = await this;
  await this.client.redis.set(cacheKey, JSON.stringify(data)); // TODO: Set TTL?
  return data;
});

export const ExtendedKnex = Knex;
