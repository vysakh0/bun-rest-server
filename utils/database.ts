import type { SQL } from 'drizzle-orm';
import type { AnySQLiteTable } from 'drizzle-orm/sqlite-core';

import { db } from '@db/config';

export const findOne = async <T>(table: AnySQLiteTable, where: SQL): Promise<T | undefined> => {
  const result = await db.select().from(table).where(where).limit(1);
  return result[0] as T;
};
