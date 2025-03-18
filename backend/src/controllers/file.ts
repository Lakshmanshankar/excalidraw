import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { createUploadSignedURL, deleteFile, getReadonlySignedURL } from '~/utils/supabase';
import { db } from '~/config/db';
import { objects } from '~/drizzle/schema';

export const getUserIndexFile = async (_req: Request, res: Response) => {
    const session = res.locals.session;
    res.json({ session: session?.user }).status(200);
};

export const getUserFile = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const filePath = `${session?.user?.id}/${(req.body?.path || '') as string}`;
    if (session && session?.user && filePath && filePath.includes(session?.user?.id || '')) {
        const signedURL = await getReadonlySignedURL(filePath, 15);
        res.status(200).json({ data: signedURL });
    } else {
        res.json({
            error: 'Unauthorized',
            message: 'Make sure you have enough permissions to access the file',
        }).status(401);
    }
};

export const createUserFile = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const filePath = `${session?.user?.id}/${(req.body?.path || '') as string}`;
    if (session && session?.user && filePath && filePath.includes(session?.user?.id || '')) {
        const signedURL = await createUploadSignedURL(filePath);
        res.status(200).json({ data: signedURL });
    } else {
        res.json({
            error: 'Unauthorized',
            message: 'Make sure you have enough permissions to create a file',
        }).status(401);
    }
};

export const deleteSingleFile = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const filePath = `${session?.user?.id}/${(req.body?.path || '') as string}`;
    if (session && session?.user && filePath && filePath.includes(session?.user?.id || '')) {
        const userId = session?.user?.id as string;
        const delRes = await deleteFile(filePath, userId);
        res.status(200).json({ data: delRes });
    } else {
        res.json({
            error: 'Unauthorized',
            message: 'Make sure you have enough permissions to create a file',
        }).status(401);
    }
};

export const deleteMultipleFiles = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];
    if (!session?.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (!paths.length) {
        res.status(400).json({ error: 'No file paths provided' });
        return;
    }
    const userId = session.user.id;
    const filePaths = paths.filter(Boolean).map((path: string) => `${userId}/${path}`);

    try {
        const delBulkRes = await Promise.all(
            filePaths.map((path: string) => deleteFile(path, userId))
        );
        res.json({ success: true, deleted: delBulkRes });

        return;
    } catch (e) {
        console.error('Error deleting files:', e);
        res.status(500).json({ error: 'Failed to delete files' });
    }
};

export const getFileTree = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const sessionUserId = session?.user?.id;
    //const userId = req.query.userId as string;
    const userId = req.params.userId as string;
    if (!userId) {
        res.status(400).json({ error: 'Bad Request', message: 'User ID is required' });
    }

    if (sessionUserId !== userId) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Make sure you have enough permissions to access the file',
        });
    }
    const fileTree = await db
        .select({ file_tree: objects.file_tree })
        .from(objects)
        .where(eq(objects.user_id, userId))
        .limit(1);

    if (!fileTree.length) {
        res.status(404).json({ error: 'Not Found', message: 'File tree not found for this user' });
    }

    res.status(200).json({ data: fileTree[0] });
};

export const updateFileTree = async (req: Request, res: Response) => {
    const session = res.locals.session;
    const jsonFileTreePayload = req.body?.fileTree;
    const user = session?.user;

    if (session && user?.id && jsonFileTreePayload) {
        const [objectStore] = await db
            .update(objects)
            .set({ file_tree: jsonFileTreePayload })
            .where(eq(objects.user_id, user.id));
        res.status(201).json({ data: objectStore });
    } else {
        res.json({
            error: 'Unauthorized',
            message: 'Make sure you have enough permissions to create a file',
        }).status(401);
    }
};
