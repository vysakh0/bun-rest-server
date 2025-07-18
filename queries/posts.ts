import { eq } from 'drizzle-orm';

import { db } from '@db/config';
import { posts, users } from '@db/schema';

export const postQueries = {
  create: (data: { title: string; userId: number }) => {
    return db.insert(posts).values(data);
  },

  findByUserId: (userId: number) => {
    return db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId));
  },

  findAll: () => {
    return db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id));
  },
};
