import { beforeAll, beforeEach } from 'bun:test';

import { db } from '@db/config';

import { resetUserCounter } from '@tests/factories/user.factory';
import { cleanDatabase } from '@tests/helpers/db.helpers';

beforeAll(() => {
  resetUserCounter();
});

beforeEach(async () => {
  await cleanDatabase(db);
  resetUserCounter();
});

export { db };
