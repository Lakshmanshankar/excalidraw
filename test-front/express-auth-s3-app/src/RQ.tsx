import { useState, useEffect } from 'react';
import { useAuthUser } from './hooks/useUser';
import { getFileTree, getReadOnlySignedUrl, getUploadSignedURL, updateFileTree } from './lib/file';
import UploadFile from './UploadFile';
export const Rqx = () => {
    const { data } = useAuthUser();
    if (data?.user?.id) {
        const userID = data?.user?.id;
        const filePath = 'Two pointers';
        return (
            <div>
                <GetFile userId={userID} fileId={filePath} />

                <button
                    onClick={() => {
                        const jsonData = { message: 'Hello, Supabase!' };
                        const jsonBlob = new Blob([JSON.stringify(jsonData)], {
                            type: 'application/json',
                        });

                        const uploadUrl = getUploadSignedURL({
                            fileId: 'Two another new pointers',
                            fileBlob: jsonBlob,
                        });
                        console.log(uploadUrl);
                    }}
                >
                    {' '}
                    fetch upload url
                </button>

                <button
                    onClick={async () => {
                        const res = await getFileTree(userID);
                        console.log(res, 'reposop');
                    }}
                >
                    get file tree
                </button>

                <button
                    onClick={async () => {
                        const res = await updateFileTree(userID);
                        console.log(res, 'updating file Tree with sample');
                    }}
                >
                    upload sample data
                </button>
            </div>
        );
    }
    return <>loading</>;
};

const GetFile = ({ userId, fileId }: { userId: string; fileId: string }) => {
    const [file, setFile] = useState<string | null>(null);
    useEffect(() => {
        const getFile = async () => {
            const res = await getReadOnlySignedUrl({
                fileId,
            });
            setFile(res);
        };
        getFile();
    }, [fileId, userId]);

    return <>{Object.keys(file ?? {}).length}</>;
};
