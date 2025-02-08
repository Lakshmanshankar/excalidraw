import { SERVER_URL } from '../consts';

const STORAGE_ERRORS = ['StorageApiError'];

export const getReadOnlySignedUrl = async ({ fileId }: { fileId: string }) => {
    const res = await fetch(`${SERVER_URL}/api/v1/file/get`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            path: `${fileId}.excalidraw`,
        }),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch signed URL');
    }

    const data = await res.json();
    const signedUrl = data?.data?.signedUrl;
    const fileRes = await fetch(signedUrl);
    if (!fileRes.ok) {
        throw new Error('Failed to fetch file');
    }

    const blob = await fileRes.blob();
    const text = await blob.text();
    return text;
};

export const getFileTree = async (userID: string) => {
    const res = await fetch(`${SERVER_URL}/api/v1/file/get_tree/${userID}`, {
        credentials: 'include',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return data;
};

export const updateFileTree = async (userID: string) => {
    const sampleData = {
        path: '/',
        children: [
            {
                path: '/home',
            },
        ],
    };
    const res = await fetch(`${SERVER_URL}/api/v1/file/update_tree`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fileTree: sampleData,
        }),
    });
    const data = await res.json();
    return data;
};

export const getUploadSignedURL = async ({
    fileId,
    fileBlob,
}: {
    fileId: string;
    fileBlob: Blob;
}) => {
    try {
        // 1. Get the signed URL
        const res = await fetch(`${SERVER_URL}/api/v1/file/post`, {
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: `${fileId}.excalidraw`,
            }),
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch signed URL: ${res.statusText}`);
        }

        const data = await res.json();
        const { signedUrl, token, path } = data?.data || {};
        if (data?.data?.status !== 400 && STORAGE_ERRORS.includes(data?.data?.name)) {
            throw new Error(data?.data?.message);
        }
        if (!signedUrl || !token) {
            throw new Error('Missing signed URL or token');
        }

        // 2. Upload the file using the signed URL
        const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: fileBlob,
            headers: {
                'Content-Type': fileBlob.type,
                Authorization: `Bearer ${token}`, // Add token in Authorization header
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        return path;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};
