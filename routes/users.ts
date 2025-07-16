import { db } from "@db/config";
import { users } from "@db/schema";

export const createUser = async (req: Request) => {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [newUser] = await db
      .insert(users)
      .values({ name, email })
      .returning();

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const listUsers = async () => {
  try {
    const allUsers = await db.select().from(users);
    
    return new Response(JSON.stringify(allUsers), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};