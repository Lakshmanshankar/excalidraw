import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { type FileNode, type FileTree } from "./../lib/file-tree-types";
import { createFile } from "../lib/file";
import { fetchFile, getFileTree, updateFileTree } from "../lib/file-api";
import { useAuthUser } from "./useAuth";

type FileManagerContext = {
  fileTree: FileTree | null;
  createExcalidrawFile: (
    fileName: string,
    content: string,
  ) => Promise<
    | {
        error: string;
        message: string;
      }
    | undefined
  >;
};

const fileMenuContext = createContext({
  fileManager: {},
} as unknown as FileManagerContext);

const { Provider } = fileMenuContext;

export function FileMenuProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const fileMenu = useFileMenuProvider();
  if (fileMenu === null) {
    return <>Component should be wrapped with FileMenuProvider</>;
  }
  return <Provider value={fileMenu}>{children}</Provider>;
}

export const useFile = () => {
  return useContext(fileMenuContext);
};

const useFileMenuProvider = () => {
  const { data: auth } = useAuthUser();
  const [fileTree, setFileTree] = useState<FileTree | null>(null);
  //const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);

  useEffect(() => {
    if (auth && auth.user) {
      getFileTree(auth.user.id).then((res) => {
        if (res.data?.file_tree) {
          if (
            !res.data?.file_tree?._id ||
            res.data?.file_tree?._id !== auth.user.id
          ) {
            const newFileTree = createDefaultFileTree(auth.user.id);
            setFileTree(newFileTree);
            updateFileTree(auth.user.id, newFileTree);
          }
          setFileTree(res.data?.file_tree);
        }
      });
    }
  }, [auth]);

  const createExcalidrawFile = async (fileName: string, content: string) => {
    if (!auth?.user?.id) {
      return { error: "unauthorized", message: "No user id found" };
    }
    const response = await createFile(
      auth.user.id,
      fileName,
      content,
      fileTree as unknown as FileTree,
    );
    if (response?.error === null) {
      setFileTree({ ...response.data?.fileTree });
    }
  };

  const getExcalidrawFile = async (node: FileNode) => {
    const id = node.id;
    const ger = await fetchFile({ fileId: id });
    if (ger.error === null) {
      return ger.data;
    }
    return {
      error: ger.error,
      message: ger.message,
      data: ger.data,
    };
  };

  return {
    fileTree,
    createExcalidrawFile,
    getExcalidrawFile,
  };
};

const createDefaultFileTree = (userId: string) => {
  const fileTree: FileTree = {
    _id: userId,
    ownerID: userId,
    children: [],
    recent: [],
  };
  return fileTree;
};
