import { sql } from '@db/config';

import type { User, InsertUser, UpdateUser } from '@type/users';

export const userQueries = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return rows[0];
  },

  findById: async (id: number): Promise<User | undefined> => {
    const rows = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return rows[0];
  },

  findAll: async (): Promise<User[]> => {
    return sql`SELECT * FROM users ORDER BY id`;
  },

  create: async (data: InsertUser) => {
    return sql`
      INSERT INTO users (name, email, password)
      VALUES (${data.name}, ${data.email}, ${data.password})
      RETURNING *
    `;
  },

  update: async (id: number, data: UpdateUser) => {
    const setClauses = [];
    const values = [];

    if (data.name !== undefined) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      setClauses.push(`email = $${values.length + 1}`);
      values.push(data.email);
    }
    if (data.password !== undefined) {
      setClauses.push(`password = $${values.length + 1}`);
      values.push(data.password);
    }

    if (setClauses.length === 0) return [];

    values.push(id);
    const query = `
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    return sql.unsafe(query, values);
  },

  delete: async (id: number) => {
    return sql`DELETE FROM users WHERE id = ${id} RETURNING *`;
  },
};
