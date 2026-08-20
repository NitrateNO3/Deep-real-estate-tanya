/*
  Turns the owner's password into the hash that goes in ADMIN_PASSWORD_HASH.

    npm run hash-password
    npm run hash-password -- "the password"

  The plaintext is never written to disk, and the hash is safe to paste into the
  Vercel dashboard. Prefer the prompt over the argument form: a password given on
  the command line ends up in your shell history.
*/
import { createInterface } from 'node:readline/promises';
import { randomBytes, scryptSync } from 'node:crypto';
import { stdin, stdout } from 'node:process';

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function hash(plain) {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

const fromArg = process.argv[2];
let password = fromArg;

if (!password) {
  const rl = createInterface({ input: stdin, output: stdout });
  password = await rl.question('Owner password: ');
  rl.close();
}

password = (password ?? '').trim();

if (password.length < 12) {
  console.error('\nRefusing: use at least 12 characters. This single password is the only thing');
  console.error('standing between the internet and your listings.\n');
  process.exit(1);
}

console.log('\nSet this in Vercel (Project → Settings → Environment Variables):\n');
console.log(`ADMIN_PASSWORD_HASH=${hash(password)}\n`);
console.log('And a session secret, if you have not set one yet:\n');
console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}\n`);
