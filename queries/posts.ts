import { sql } from '@db/config';

import type { PostResponse } from '@type/posts';

export const postQueries = {
  create: async (data: { title: string; userId: number }) => {
    return sql`
      INSERT INTO posts (title, user_id)
      VALUES (${data.title}, ${data.userId})
      RETURNING *
    `;
  },

  findByUserId: async (userId: number): Promise<PostResponse[]> => {
    const rows = await sql`
      SELECT 
        p.id,
        p.title,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "user.id",
        u.name as "user.name",
        u.email as "user.email"
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row['user.id'],
        name: row['user.name'],
        email: row['user.email'],
      },
    }));
  },

  findAll: async (): Promise<PostResponse[]> => {
    const rows = await sql`
      SELECT 
        p.id,
        p.title,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "user.id",
        u.name as "user.name",
        u.email as "user.email"
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row['user.id'],
        name: row['user.name'],
        email: row['user.email'],
      },
    }));
  },
};
