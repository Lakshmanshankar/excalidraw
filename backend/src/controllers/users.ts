import type { Request, Response } from 'express';
import { db } from '~/config/db';
import { objects, users, type InsertUser, type SelectUser } from '~/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createFolder } from '~/utils/supabase';

export const getUserByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length === 0) {
        res.json({ message: `User ${email} not found` });
        return;
    }
    res.json({
        message: `User ${email} created with email ${email}`,
        result: JSON.stringify(result),
    });
};

export const getUserByEmailFn = async (email: string) => {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result;
};

export async function createUserWithObjectStore(userData: InsertUser): Promise<SelectUser | Error> {
    const [user] = await db.insert(users).values(userData).returning();
    if (!user || !user.id) throw new Error('User creation failed');

    const [objectStore] = await db
        .insert(objects)
        .values({ user_id: user.id, s3_path: user.id.toString() })
        .returning();

    const res = await createFolder(objectStore.s3_path);
    if (res.error) {
        throw new Error(JSON.stringify(res.error));
    }

    if (!objectStore) throw new Error('Object store creation failed');
    return user;
}
