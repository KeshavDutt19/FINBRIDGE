import crypto from "crypto";
import SearchCache from "../../models/SearchCache.js";

/*
=========================================================
SEARCH CACHE SERVICE
=========================================================

Stores the result of an external search so that repeated
scheduler runs do not repeatedly query Reddit/YouTube.

Cache identity:

source + normalized query

Cache lifecycle:

missing
   ↓
fetch
   ↓
save
   ↓
valid
   ↓
expires
   ↓
fetch again

=========================================================
*/


const DEFAULT_TTL_HOURS = 24;


/*
---------------------------------------------------------
NORMALIZE QUERY
---------------------------------------------------------
*/

function normalizeQuery(query = "") {
  return String(query)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


/*
---------------------------------------------------------
CREATE CACHE HASH
---------------------------------------------------------
*/

export function createQueryHash({
  source,
  query,
} = {}) {
  const normalizedSource =
    String(source || "")
      .toLowerCase()
      .trim();

  const normalizedQuery =
    normalizeQuery(query);

  return crypto
    .createHash("sha256")
    .update(
      `${normalizedSource}:${normalizedQuery}`
    )
    .digest("hex");
}


/*
---------------------------------------------------------
GET CACHE
---------------------------------------------------------

Returns:

{
  found: true,
  fresh: true,
  cache: {...}
}

or

{
  found: false,
  fresh: false,
  cache: null
}

---------------------------------------------------------
*/

export async function getCachedSearch({
  source,
  query,
} = {}) {
  if (!source || !query) {
    return {
      found: false,
      fresh: false,
      cache: null,
    };
  }

  const queryHash =
    createQueryHash({
      source,
      query,
    });

  const cache =
    await SearchCache.findOne({
      queryHash,
    }).lean();

  if (!cache) {
    return {
      found: false,
      fresh: false,
      cache: null,
    };
  }

  const now =
    Date.now();

  const expiresAt =
    new Date(
      cache.expiresAt
    ).getTime();

  const fresh =
    !Number.isNaN(expiresAt) &&
    expiresAt > now;

  return {
    found: true,
    fresh,
    cache,
  };
}


/*
---------------------------------------------------------
SAVE CACHE
---------------------------------------------------------
*/

export async function saveSearchCache({
  source,
  query,
  results = [],
  ttlHours = DEFAULT_TTL_HOURS,
} = {}) {
  if (!source) {
    throw new Error(
      "source is required"
    );
  }

  if (!query) {
    throw new Error(
      "query is required"
    );
  }

  const queryHash =
    createQueryHash({
      source,
      query,
    });

  const now =
    new Date();

  const ttlMs =
    Math.max(
      Number(ttlHours) || DEFAULT_TTL_HOURS,
      1
    ) *
    60 *
    60 *
    1000;

  const expiresAt =
    new Date(
      now.getTime() +
      ttlMs
    );

  return SearchCache.findOneAndUpdate(
    {
      queryHash,
    },

    {
      $set: {
        query:
          String(query).trim(),

        source:
          String(source)
            .toLowerCase()
            .trim(),

        results:
          Array.isArray(results)
            ? results
            : [],

        fetchedAt:
          now,

        expiresAt,
      },
    },

    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean();
}


/*
---------------------------------------------------------
DELETE CACHE ENTRY
---------------------------------------------------------
*/

export async function deleteCachedSearch({
  source,
  query,
} = {}) {
  if (!source || !query) {
    return {
      deleted: false,
    };
  }

  const queryHash =
    createQueryHash({
      source,
      query,
    });

  const result =
    await SearchCache.deleteOne({
      queryHash,
    });

  return {
    deleted:
      result.deletedCount > 0,
  };
}


/*
---------------------------------------------------------
DELETE EXPIRED CACHE
---------------------------------------------------------

Useful for maintenance jobs.

---------------------------------------------------------
*/

export async function deleteExpiredSearchCache() {
  const result =
    await SearchCache.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });

  return {
    deletedCount:
      result.deletedCount,
  };
}


/*
---------------------------------------------------------
CACHE STATUS
---------------------------------------------------------
*/

export async function getSearchCacheStats() {
  const [
    total,
    expired,
  ] = await Promise.all([
    SearchCache.countDocuments({}),

    SearchCache.countDocuments({
      expiresAt: {
        $lt: new Date(),
      },
    }),
  ]);

  return {
    total,
    active:
      Math.max(
        total - expired,
        0
      ),
    expired,
  };
}