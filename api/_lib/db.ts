/*
  The database handle.

  `neon()` is used in its tagged-template form throughout:

      await sql`SELECT * FROM properties WHERE id = ${id}`

  In that form every interpolated value is sent as a bound parameter, never
  spliced into the SQL text. That is deliberate and non-negotiable here: the PHP
  application this replaces built its queries by string interpolation
  (`WHERE pid='$_GET[pid]'`) and was injectable on essentially every page. Making
  the safe form the only ergonomic one is how that stays fixed.

  If you ever need dynamic SQL (an ORDER BY column, say), whitelist it against a
  fixed set of literals in code — never interpolate a request value.
*/
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;

if (!url) {
  // Failing loudly at import beats a stack of confusing per-query errors.
  throw new Error(
    'DATABASE_URL is not set. Add the Neon/Vercel Postgres integration and set it in the project env.',
  );
}

export const sql = neon(url);
