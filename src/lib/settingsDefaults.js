/**
 * Single source of truth for application-level settings.
 *
 * These literals are simultaneously three things: the *shape* of every `Setting.value` JSON column,
 * the *fallback* used when a row (or a field within a row) is missing, and the payload
 * `prisma/seed.mjs` writes. Nothing is re-typed anywhere else, so the seed and the runtime cannot
 * drift apart the way the `LOGIN_OTP` template body has (it is written out longhand in both
 * `src/routes/sms.js` and `prisma/seed.mjs`, and the two strings have already diverged).
 *
 * Which of the two objects below holds a key *is* that group's public/private categorisation — there
 * is no separate visibility list to keep in sync. `Setting.isPublic` in the database only mirrors it.
 *
 * Adding a group: add it here, add a uuid to the `ID.settings` map in `prisma/seed.mjs`, done.
 * Adding a field: add it here only — existing rows pick it up through the runtime deep merge.
 *
 * Two hard rules:
 *   1. This module imports nothing and reads no `process.env`. `prisma/seed.mjs` deliberately builds
 *      its own PrismaClient/pg.Pool, so importing `./prisma.js` (even transitively) would open a
 *      second pool in the seed process that nothing ever disconnects.
 *   2. No default value may be `null`. Every leaf gets a real placeholder ('', 0, false, []) so an
 *      effective value can never be null and crash a caller doing `settings.X.email.toLowerCase()`.
 *
 * Secrets do NOT belong in this table: there is no auth on the API and no encryption at rest, so
 * WHAPI_TOKEN and the AWS keys stay in `.env`. INTEGRATION_CONFIG holds non-secret wiring only.
 */

/** Settings served to any storefront visitor by `GET /api/settings`. */
export const PUBLIC_SETTINGS = {
  STORE_IDENTITY: {
    legalName: 'Mangal Superfoods Pvt. Ltd.',
    displayName: 'Mangal Superfoods',
    tagline: 'Pure, honest superfoods',
    description: '',
    logoUrl: '',
    faviconUrl: '',
    gstin: '',
    fssaiLicense: '',
    address: {
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mapUrl: '',
    },
  },

  SUPPORT_CONTACT: {
    email: 'support@mangalsuperfoods.com',
    salesEmail: '',
    phone: '',
    whatsapp: '',
    supportHoursNote: 'Mon-Sat, 10:00-18:00 IST',
  },

  SOCIAL_LINKS: {
    instagram: '',
    facebook: '',
    youtube: '',
    x: '',
    linkedin: '',
  },

  BUSINESS_HOURS: {
    timezone: 'Asia/Kolkata',
    // 24h 'HH:MM' strings. `closed: true` means open/close are ignored for that day.
    weekly: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '', close: '', closed: true },
    },
    // ISO 'YYYY-MM-DD' dates the store is shut regardless of `weekly`.
    holidays: [],
  },

  COMMERCE_CONFIG: {
    currency: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    freeShippingThreshold: 999,
    shippingFlatRate: 49,
    minOrderValue: 0,
    maxCartQuantityPerItem: 10,
    codEnabled: true,
    codFee: 0,
    tax: { pricesIncludeTax: true, gstPercent: 5 },
    returnWindowDays: 7,
  },
};

/**
 * Operational settings served only by `GET /api/settings/private`, which the frontend calls after a
 * successful login. Note there is no auth middleware in this app, so "private" means "not in the
 * anonymous storefront payload", NOT "access-controlled" — see the TODO in src/routes/settings.js.
 */
export const PRIVATE_SETTINGS = {
  NOTIFICATION_CONFIG: {
    orderNotifyEmails: [],
    adminWhatsapp: '',
    otp: { length: 4, expiryMinutes: 5, resendCooldownSeconds: 60 },
    lowStockThreshold: 5,
  },

  INTEGRATION_CONFIG: {
    // Non-secret wiring only — tokens and keys live in .env.
    whapi: { enabled: true, senderLabel: 'Mangal Superfoods' },
    analytics: { gaMeasurementId: '', metaPixelId: '' },
    maintenance: { enabled: false, message: '' },
  },
};
