import { supabase, BUCKET } from '~/config/supabase';

// NOTE: supabase storage essentials
// https://supabase.com/docs/guides/storage/buckets/fundamentals
export async function createBucket() {
    const { data, error } = await supabase.storage.createBucket(BUCKET.EXCLALIDRAW, {
        public: true,
    });
    return { data, error };
}

export async function getReadonlySignedURL(path: string, expireInMinutes: number) {
    const timeToExpire = expireInMinutes * 60;
    const { data, error } = await supabase.storage
        .from(BUCKET.EXCLALIDRAW)
        .createSignedUrl(path, timeToExpire);

    if (error) {
        console.error('Error creating readonly presigned url', error);
        return error;
    } else {
        console.log('Presigned URL:', data.signedUrl);
    }
    return data;
}

export async function createUploadSignedURL(path: string) {
    const { data, error } = await supabase.storage
        .from(BUCKET.EXCLALIDRAW)
        .createSignedUploadUrl(path, {
            upsert: true,
        });

    if (error) {
        console.error('Error creating upload presigned url', error);
        return error;
    } else {
        console.log('Upload presigned URL:', data.signedUrl);
    }
    return data;
}

export async function getFile(filePath: string) {
    const { data, error } = await supabase.storage.from(BUCKET.EXCLALIDRAW).download(filePath);
    return { data, error };
}

export async function uploadFile(filePath: string, file: string) {
    const { data, error } = await supabase.storage.from(BUCKET.EXCLALIDRAW).upload(filePath, file);
    return { data, error };
}

export const deleteFile = async (path: string, folderId: string) => {
    const folderPath = folderId;
    const fileName = path.split('/').pop();

    const { data: files, error: listError } = await supabase.storage
        .from(BUCKET.EXCLALIDRAW)
        .list(folderPath);

    if (listError) {
        console.error('Error checking file existence:', listError);
        return listError;
    }
    const fileExists = files?.some(file => file.name === fileName);
    if (!fileExists) {
        console.warn('File does not exist:', path);
        return { error: 'File does not exist' };
    }

    console.log('Deleting file:', path);
    const { data, error } = await supabase.storage.from(BUCKET.EXCLALIDRAW).remove([path]);
    if (error) {
        console.error('Error deleting file:', error);
        return error;
    }
    console.log('File deleted successfully:', data);
    return data;
};



export async function createFolder(folderName: string) {
    const { data, error } = await supabase.storage
        .from(BUCKET.EXCLALIDRAW)
        .upload(`${folderName}/.keep`, new Blob(['']), {
            contentType: 'text/plain',
        });

    if (error) {
        console.error('Error creating folder:', error);
    } else {
        console.log('Folder created:', data);
    }

    return { error, data };
}

export async function listFilesAndFolders(path = '') {
    const { data, error } = await supabase.storage.from(BUCKET.EXCLALIDRAW).list(path);

    if (error) {
        console.error('Error listing files:', error);
        return error;
    }

    const folders = data.filter((item) => item.metadata === null);
    const files = data.filter((item) => item.metadata !== null);

    console.log(
        'Folders:',
        folders.map((f) => f.name),
    );
    console.log(
        'Files:',
        files.map((f) => f.name),
    );
}

//const testFn = async () => {
//  const res = await getFile("paytmkaro/main.excalidraw");
//  const responseText = await res.data?.text();
//  console.log(res);
//  const convertToBlob = new Blob([JSON.stringify(responseText)], {
//    type: "application/json",
//  });
//
//  const reposText = await convertToBlob.text();
//  console.log(res, responseText, convertToBlob, reposText);
//};
//testFn();
