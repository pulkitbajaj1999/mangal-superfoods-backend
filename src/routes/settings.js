import express from 'express';

import prisma from '../lib/prisma.js';
import settingsStore, {
  deepMerge,
  getGroupDefaults,
  isPlainObject,
  isPublicKey,
  sanitizeKeys,
} from '../lib/settings.js';

const router = express.Router();

/**
 * The cache flag. Exact match only: query params are always strings, so `Boolean('false')` is true.
 * Rather than 400 on garbage, an unrecognised value is discarded and the loaded config is used —
 * `'true'`, `?cache=maybe`, a repeated param (Express gives an array) and an absent param all mean
 * cached.
 *
 * The query string is the primary channel because `fetch(url, { method: 'GET', body })` throws in
 * browsers and in Bun and proxies may drop GET bodies; the JSON body is honoured too.
 */
function useCache(request) {
  const raw = request.query.cache ?? request.body?.cache;
  if (raw === 'false' || raw === false) return false;
  return true;
}

/** Splits a `{ KEY: partialValue }` map into writable entries and the keys that must be rejected. */
function collectPatchEntries(settings) {
  const entries = [];
  const unknownKeys = [];
  const invalidKeys = [];

  for (const [key, value] of Object.entries(settings)) {
    if (getGroupDefaults(key) === undefined) {
      unknownKeys.push(key);
      continue;
    }
    if (!isPlainObject(value)) {
      invalidKeys.push(key);
      continue;
    }
    entries.push({ key, value });
  }

  return { entries, unknownKeys, invalidKeys };
}

/**
 * Deep-merges each entry into its stored group and writes them all in one transaction, so a failure
 * part-way through leaves nothing applied. Shared by PATCH / and PUT /:key.
 */
async function applyPatchEntries(entries) {
  const keys = entries.map((entry) => entry.key);
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const rowsByKey = new Map(rows.map((row) => [row.key, row]));

  const writes = entries.map(({ key, value }) => {
    // A stored value that is missing or the wrong shape (hand-edited via psql) falls back to the
    // code defaults, so the row that gets written is always a complete group.
    const stored = sanitizeKeys(rowsByKey.get(key)?.value);
    const base = isPlainObject(stored) ? stored : getGroupDefaults(key);
    const nextValue = deepMerge(base, sanitizeKeys(value));

    // `isPublic` is never read from the request body — it is derived from which defaults object holds
    // the key, which is what makes the tier untamperable over HTTP.
    const isPublic = isPublicKey(key);

    return prisma.setting.upsert({
      where: { key },
      update: { value: nextValue, isPublic },
      create: { key, value: nextValue, isPublic },
    });
  });

  await prisma.$transaction(writes);
}

/** Picks the given keys out of the refreshed config so the response echoes effective values. */
function pickEffective(config, keys) {
  const settings = {};
  for (const key of keys) {
    settings[key] = config.public[key] ?? config.private[key];
  }
  return settings;
}

router.get('/', async (request, response) => {
  try {
    const { config, fromCache, loadedAt } = await settingsStore.get({ cache: useCache(request) });

    // Keep the in-process config the only cache, so ?cache=false can't be defeated by a proxy.
    response.set('Cache-Control', 'no-store');
    response.json({
      settings: config.public,
      meta: { scope: 'public', fromCache, loadedAt },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    response.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Declared before any param route so it is not shadowed. The frontend calls this after a successful
// login, typically with ?cache=false so it also refreshes the server's config in the same trip.
//
// TODO: there is no session middleware in this app, so this route and the writers below are
// reachable by anyone who can reach the port — "private" means "not in the anonymous storefront
// payload", not "access-controlled". When auth lands, gate this route, PATCH / and PUT /:key with a
// single router.use(requireAdmin) here.
router.get('/private', async (request, response) => {
  try {
    const { config, fromCache, loadedAt } = await settingsStore.get({ cache: useCache(request) });

    response.set('Cache-Control', 'no-store');
    response.json({
      settings: config.private,
      meta: { scope: 'private', fromCache, loadedAt },
    });
  } catch (error) {
    console.error('Error fetching private settings:', error);
    response.status(500).json({ error: 'Failed to fetch private settings' });
  }
});

// Update several groups at once. An admin screen edits multiple groups in one Save; doing that as N
// sequential PUTs means N round trips, N cache refreshes, and a half-applied state if one fails.
router.patch('/', async (request, response) => {
  try {
    const { settings } = request.body;

    if (!isPlainObject(settings) || Object.keys(settings).length === 0) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    // Validate every entry before writing any: rejecting one key at a time makes a caller fix a
    // batch by trial and error, and a partial apply is worse than a clean rejection.
    const { entries, unknownKeys, invalidKeys } = collectPatchEntries(settings);

    if (unknownKeys.length > 0) {
      return response.status(400).json({ error: 'Unknown settings keys', keys: unknownKeys });
    }
    if (invalidKeys.length > 0) {
      return response
        .status(400)
        .json({ error: 'Each settings value must be a JSON object', keys: invalidKeys });
    }

    await applyPatchEntries(entries);

    // One refresh for the whole batch, not one per key.
    const { config, loadedAt } = await settingsStore.refresh();

    response.status(200).json({
      settings: pickEffective(config, entries.map((entry) => entry.key)),
      meta: { updated: entries.length, loadedAt },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    response.status(500).json({ error: 'Failed to update settings' });
  }
});

// Single-group convenience form of PATCH / — same merge and validation path.
router.put('/:key', async (request, response) => {
  try {
    const { key } = request.params;
    const { value } = request.body;

    if (getGroupDefaults(key) === undefined) {
      return response.status(404).json({ error: 'Unknown settings key' });
    }
    // Note both null and arrays are `typeof 'object'`, so isPlainObject has to exclude them.
    if (!isPlainObject(value)) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    await applyPatchEntries([{ key, value }]);

    const { config, loadedAt } = await settingsStore.refresh();

    response.status(200).json({
      settings: pickEffective(config, [key]),
      meta: { updated: 1, loadedAt },
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    response.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
