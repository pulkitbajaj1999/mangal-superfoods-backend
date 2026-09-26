import prisma from './prisma.js';
import { PUBLIC_SETTINGS, PRIVATE_SETTINGS } from './settingsDefaults.js';

const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];

/** Plain JSON object only — excludes null and arrays, both of which are `typeof 'object'`. */
export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Returns a new JSON value with unsafe keys removed at every depth.
 *
 * `JSON.parse('{"__proto__":{"x":1}}')` produces an *own, enumerable* `__proto__` key that
 * `Object.keys()` returns, and `express.json()` does not strip it. Anything that then walks the
 * object and assigns into `target[key]` writes straight into `Object.prototype` and pollutes every
 * object in the process. `structuredClone` is NOT a substitute — it preserves an own `__proto__`
 * key verbatim.
 *
 * Sanitising once at the boundary (see the two call sites below) means nothing downstream —
 * deepMerge included — has to remember to guard against these keys.
 */
export function sanitizeKeys(value) {
  if (Array.isArray(value)) return value.map(sanitizeKeys);
  if (!isPlainObject(value)) return value;

  const clean = {};
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.includes(key)) continue;
    clean[key] = sanitizeKeys(value[key]);
  }
  return clean;
}

/**
 * Overlays a stored value on top of a defaults object; the stored value wins.
 *
 * - `null`/`undefined` in `stored` falls back to the default, which is what guarantees an effective
 *   value is never null.
 * - A *shape* mismatch also falls back to the default rather than propagating the wrong type: a
 *   `Setting.value` hand-edited to a bare string via psql must not be served where callers expect an
 *   object. Scalar-to-scalar changes pass through untouched — this is a shape guard, not validation.
 * - Recurses only where both sides are plain objects.
 * - Arrays and scalars replace wholesale — an element-wise array merge would mean removing the 2nd
 *   of 3 holidays leaves the 3rd behind.
 * - Keys absent from `defaults` are kept as-is, so a field added by hand isn't silently dropped.
 *
 * Expects sanitised input — see sanitizeKeys.
 */
export function deepMerge(defaults, stored) {
  if (stored === null || stored === undefined) return defaults;
  if (isPlainObject(defaults) !== isPlainObject(stored)) return defaults;
  if (Array.isArray(defaults) !== Array.isArray(stored)) return defaults;
  if (!isPlainObject(defaults)) return stored;

  const merged = { ...defaults };
  for (const key of Object.keys(stored)) {
    const value = stored[key];

    if (Object.hasOwn(defaults, key)) {
      merged[key] = deepMerge(defaults[key], value);
    } else if (value !== null && value !== undefined) {
      merged[key] = value;
    }
  }
  return merged;
}

/** Returns the defaults for a key, or undefined if the key is not a known settings group. */
export function getGroupDefaults(key) {
  if (Object.hasOwn(PUBLIC_SETTINGS, key)) return PUBLIC_SETTINGS[key];
  if (Object.hasOwn(PRIVATE_SETTINGS, key)) return PRIVATE_SETTINGS[key];
  return undefined;
}

/** True if the key belongs to the public tier. Derived from code, never from the database row. */
export function isPublicKey(key) {
  return Object.hasOwn(PUBLIC_SETTINGS, key);
}

function buildTier(defaults, rowsByKey) {
  const tier = {};
  for (const [key, groupDefaults] of Object.entries(defaults)) {
    // Database rows are untrusted too — a `value` column can be hand-edited via psql or Studio.
    tier[key] = deepMerge(groupDefaults, sanitizeKeys(rowsByKey.get(key)?.value));
  }
  return tier;
}

/**
 * In-memory application settings.
 *
 * Reads are served from the loaded config until a caller explicitly asks for fresh data
 * (`?cache=false`, see src/routes/settings.js) or a write calls refresh().
 *
 * STALENESS, HONESTLY: the config is per-process. A write served by one instance does not
 * invalidate another, and a row changed directly in Postgres (Prisma Studio, psql, `reset-db`)
 * invalidates nothing — `?cache=false` is the only refresh lever. This is fine while the service
 * runs as a single instance; if it ever runs behind a load balancer and settings must propagate
 * immediately, the follow-up is Postgres LISTEN/NOTIFY, which needs no new dependencies since the
 * app already owns a pg.Pool.
 *
 * Note this deliberately does NOT memoise on `global` the way src/lib/prisma.js does: a config
 * surviving a `bun --watch` reload would make edits to settingsDefaults.js invisible in dev.
 */
class SettingsStore {
  /** Last *successful* load: { public: {...}, private: {...} }. */
  #config = null;
  #loadedAt = null;
  /** The single in-flight database read, shared by concurrent callers. */
  #loading = null;

  /**
   * Returns { config, fromCache, loadedAt }.
   *
   * With `cache: true` (the default) an already-loaded config is returned without touching the
   * database. If nothing is loaded yet, one read is issued and any requests arriving while it is in
   * flight await that same promise and receive the same config object.
   */
  async get({ cache = true } = {}) {
    if (cache && this.#config) {
      return { config: this.#config, fromCache: true, loadedAt: this.#loadedAt };
    }

    if (this.#loading) {
      // A load is already running — join it rather than issuing a second identical query.
      const config = await this.#loading;
      return { config, fromCache: true, loadedAt: this.#loadedAt };
    }

    const pending = this.#load();
    this.#loading = pending;
    const config = await pending;
    return { config, fromCache: false, loadedAt: this.#loadedAt };
  }

  /** Reloads from the database and returns the new snapshot. Called after every write. */
  async refresh() {
    return this.get({ cache: false });
  }

  /** Drops the loaded config; the next get() reads the database. */
  invalidate() {
    this.#config = null;
    this.#loadedAt = null;
  }

  get status() {
    return { loaded: this.#config !== null, loadedAt: this.#loadedAt, loading: this.#loading !== null };
  }

  async #load() {
    try {
      const rows = await prisma.setting.findMany();
      const rowsByKey = new Map(rows.map((row) => [row.key, row]));

      // Every known key is always present and complete, even with zero rows in the table. Rows whose
      // key is in neither defaults object are ignored, so they cannot leak into either tier.
      const config = {
        public: buildTier(PUBLIC_SETTINGS, rowsByKey),
        private: buildTier(PRIVATE_SETTINGS, rowsByKey),
      };

      // Assign only on success: a failed refresh must not turn a warm config cold, so a database
      // blip serves slightly stale settings instead of 500ing the storefront footer.
      this.#config = config;
      this.#loadedAt = new Date().toISOString();
      return config;
    } finally {
      // Cleared in a finally, including on rejection — otherwise a single failed load leaves a
      // rejected promise cached and every later request awaits it until the process restarts. It
      // must be a finally *inside* the async method rather than a floating `.finally()` chain,
      // which on a rejecting promise produces an unhandled rejection.
      if (this.#loading) this.#loading = null;
    }
  }
}

const settingsStore = new SettingsStore();

export default settingsStore;

/**
 * Convenience accessor for other routes, e.g.
 *   const { freeShippingThreshold } = await getSetting('COMMERCE_CONFIG');
 * Served from the loaded config unless `cache: false` is passed.
 */
export async function getSetting(key, { cache = true } = {}) {
  const { config } = await settingsStore.get({ cache });
  return config.public[key] ?? config.private[key];
}
