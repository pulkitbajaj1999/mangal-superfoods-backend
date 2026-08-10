// prisma.config.js
import 'dotenv/config'; // <--- This loads the .env file into process.env
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    /* Use the env() helper provided by prisma/config.
       It is designed to work with the Prisma 7 lifecycle.
    */
    url: env('DATABASE_URL'),
  },
  migrations: {
    /* Run by `prisma db seed` only. Prisma 7 dropped the implicit post-reset seeding that v6 did
       (`migrate reset` has no seed step and no `--skip-seed` flag anymore), so the reset script in
       package.json chains `prisma db seed` explicitly.
    */
    seed: 'bun prisma/seed.mjs',
  },
});