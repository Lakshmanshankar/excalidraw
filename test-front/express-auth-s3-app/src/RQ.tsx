import { useState, useEffect } from "react";
import { useAuthUser } from "./hooks/useUser";
import { getReadOnlySignedUrl } from "./lib/file";
export const Rqx = () => {
  //const [user, setUser] = useState<AuthContext | null>(null);
  const { data } = useAuthUser();
  if (data?.user?.id) {
    const userID = data?.user?.id;
    const filePath = "Two pointers";
    return (
      <div>
        <GetFile userId={userID} fileId={filePath} />
      </div>
    );
  }
  return <>hllo</>;
};

const GetFile = ({ userId, fileId }: { userId: string; fileId: string }) => {
  const [file, setFile] = useState<string | null>(null);
  useEffect(() => {
    const getFile = async () => {
      const res = await getReadOnlySignedUrl({
        userId,
        fileId,
      });
      setFile(res);
    };
    getFile();
  }, [fileId, userId]);

  return <>{file}</>;
};
