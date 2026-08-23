/*
  Exercises the security-critical logic against the compiled API modules — the
  password hashing, the session token, and the input allow-lists.

  These are the parts where a mistake is silent and expensive, and they are also
  the parts that need no database, so they are worth checking on every change:

    npm run selfcheck

  It compiles api/ to .selfcheck/ and imports the real modules, so it tests the
  shipped code rather than a copy of it.
*/
import assert from 'node:assert/strict';

const {
  hashPassword, verifyPassword, createSessionToken, verifySessionToken,
  setSessionCookie, clearSessionCookie,
} = await import('../.selfcheck/_lib/auth.js');
const { propertyInput, noticeInput, blogInput } = await import('../.selfcheck/_lib/validate.js');

process.env.SESSION_SECRET ??= 'test-secret-that-is-long-enough';

let passed = 0;
const check = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.error(`  FAIL ${name}\n       ${err.message}`);
    process.exitCode = 1;
  }
};

console.log('\npassword');
const hash = hashPassword('correct horse battery staple');
check('accepts the right password', () =>
  assert.equal(verifyPassword('correct horse battery staple', hash), true));
check('rejects the wrong password', () =>
  assert.equal(verifyPassword('correct horse battery stapl', hash), false));
check('rejects an empty password', () => assert.equal(verifyPassword('', hash), false));
check('salts — same password hashes differently', () =>
  assert.notEqual(hashPassword('same'), hashPassword('same')));
check('rejects a malformed stored hash', () =>
  assert.equal(verifyPassword('x', 'md5$deadbeef'), false));
check('rejects a tampered hash', () => {
  const [algo, salt, key] = hash.split('$');
  const flipped = key.slice(0, -1) + (key.at(-1) === 'a' ? 'b' : 'a');
  assert.equal(verifyPassword('correct horse battery staple', `${algo}$${salt}$${flipped}`), false);
});

console.log('\nsession token');
const token = createSessionToken();
check('accepts a freshly issued token', () => assert.equal(verifySessionToken(token), true));
check('rejects nothing at all', () => assert.equal(verifySessionToken(undefined), false));
check('rejects gibberish', () => assert.equal(verifySessionToken('not-a-token'), false));
check('rejects a forged signature', () => {
  const [payload] = token.split('.');
  assert.equal(verifySessionToken(`${payload}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`), false);
});
check('rejects a tampered payload', () => {
  const [, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 9e9 })).toString('base64url');
  assert.equal(verifySessionToken(`${forged}.${sig}`), false);
});
check('rejects an expired token', () =>
  // Issued nine hours ago, against an eight-hour lifetime.
  assert.equal(verifySessionToken(createSessionToken(Date.now() - 9 * 3600_000)), false));

console.log('\nproperty input');
check('requires a name', () =>
  assert.throws(() => propertyInput({ location: 'Gurugram' }, { withId: false }), /name/));
check('drops unknown fields (no mass assignment)', () => {
  const out = propertyInput(
    { name: 'X', location: 'Y', published: true, isAdmin: true, sort_order: 99, id: 'sneaky' },
    { withId: false },
  );
  assert.equal('isAdmin' in out, false);
  assert.equal('sort_order' in out, false);
  assert.equal('id' in out, false, 'id must come from the URL, never the body');
});
check('rejects a slug with path characters', () =>
  assert.throws(() => propertyInput({ id: '../../etc', name: 'X', location: 'Y' }, { withId: true })));
check('accepts a clean slug', () =>
  assert.equal(propertyInput({ id: 'suncity-floors', name: 'X', location: 'Y' }, { withId: true }).id,
    'suncity-floors'));
check('cover image falls back to the first photograph', () =>
  assert.equal(
    propertyInput({ name: 'X', location: 'Y', images: ['/a.jpg', '/b.jpg'] }, { withId: false }).image,
    '/a.jpg'));
check('keeps quotes and dashes as literal text', () => {
  const out = propertyInput({ name: `O'Brien -- "Villa"`, location: 'Y' }, { withId: false });
  assert.equal(out.name, `O'Brien -- "Villa"`);
});
check('rejects a non-list where a list belongs', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', features: 'nope' }, { withId: false })));
check('defaults published to false', () =>
  assert.equal(propertyInput({ name: 'X', location: 'Y' }, { withId: false }).published, false));

console.log('\nsession cookie attributes');
/* Capture what Set-Cookie would actually contain, in both environments. The
   __Host- prefix is what stops a sibling subdomain planting a session cookie,
   and browsers only honour it when Secure + Path=/ + no Domain are all present —
   so the three have to be asserted together, not assumed. */
const cookieFor = (vercelEnv) => {
  const before = process.env.VERCEL_ENV;
  if (vercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = vercelEnv;
  let out = '';
  setSessionCookie({}, { setHeader: (_k, v) => { out = v; } }, 'tok');
  if (before === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = before;
  return out;
};

const prodCookie = cookieFor('production');
check('production uses the __Host- prefix', () =>
  assert.match(prodCookie, /^__Host-dre_session=/));
check('production sets Secure', () => assert.match(prodCookie, /; Secure/));
check('sets HttpOnly', () => assert.match(prodCookie, /; HttpOnly/));
check('sets SameSite=Strict', () => assert.match(prodCookie, /; SameSite=Strict/));
check('sets Path=/ (required by __Host-)', () => assert.match(prodCookie, /; Path=\//));
check('sets no Domain (required by __Host-)', () =>
  assert.equal(/; *Domain=/i.test(prodCookie), false));
check('local dev drops the prefix and Secure (plain http)', () => {
  const dev = cookieFor(undefined);
  assert.match(dev, /^dre_session=/);
  assert.equal(/; Secure/.test(dev), false);
});
check('logout expires the cookie', () => {
  let out = '';
  clearSessionCookie({}, { setHeader: (_k, v) => { out = v; } });
  assert.match(out, /Max-Age=0/);
});

console.log('\nbounds and URL schemes (security hardening)');
check('sortOrder rejects 1e300 (Number.isInteger accepts it)', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', sortOrder: 1e300 }, { withId: false })));
check('sortOrder rejects an out-of-range integer', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', sortOrder: 99999999 }, { withId: false })));
check('sortOrder rejects an array that Number() would coerce', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', sortOrder: ['5'] }, { withId: false })));
check('sortOrder still accepts a sane value', () =>
  assert.equal(propertyInput({ name: 'X', location: 'Y', sortOrder: 3 }, { withId: false }).sortOrder, 3));
check('image rejects a javascript: URL', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', image: 'javascript:alert(1)' }, { withId: false })));
check('image rejects free-form text', () =>
  assert.throws(() => propertyInput({ name: 'X', location: 'Y', image: 'not a url' }, { withId: false })));
check('image accepts https and site-relative', () => {
  const a = propertyInput({ name: 'X', location: 'Y', image: 'https://x.test/a.jpg' }, { withId: false });
  const b = propertyInput({ name: 'X', location: 'Y', image: '/img/props/a.jpg' }, { withId: false });
  assert.equal(a.image, 'https://x.test/a.jpg');
  assert.equal(b.image, '/img/props/a.jpg');
});
check('gallery entries are scheme-checked too', () =>
  assert.throws(() => propertyInput(
    { name: 'X', location: 'Y', images: ['/ok.jpg', 'javascript:alert(1)'] }, { withId: false })));
check('blog coverImage is scheme-checked', () =>
  assert.throws(() => blogInput({ slug: 'a-post', title: 'T', coverImage: 'javascript:alert(1)' })));
check('dates are normalised to ISO, not passed through raw', () => {
  const out = noticeInput({ body: 'x', startsAt: 'March 3, 2025 10:00 UTC' });
  assert.match(out.startsAt, /^\d{4}-\d{2}-\d{2}T/);
});

console.log('\nnotice + blog input');
check('notice requires a body', () => assert.throws(() => noticeInput({}), /body/));
check('notice rejects an end before its start', () =>
  assert.throws(
    () => noticeInput({ body: 'x', startsAt: '2025-02-01T00:00:00Z', endsAt: '2025-01-01T00:00:00Z' }),
    /after/,
  ));
check('blog requires a title', () => assert.throws(() => blogInput({ slug: 'a-post' }), /title/));
check('blog rejects a bad slug', () =>
  assert.throws(() => blogInput({ slug: 'Not A Slug', title: 'T' })));

console.log(`\n${passed} checks passed${process.exitCode ? ' — with failures above' : ''}\n`);
