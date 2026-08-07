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
});