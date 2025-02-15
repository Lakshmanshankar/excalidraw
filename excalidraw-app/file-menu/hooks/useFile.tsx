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
import { useExcalidrawActionManager } from "../../../packages/excalidraw/components/App";
import { actionLoadScenFromJSON } from "../../../packages/excalidraw/actions/actionExport";
import { type ExcalidrawImperativeAPI } from "../../../packages/excalidraw/types";
//import JSON_FILE from './sample.json'

type FileManagerContext = {
  fileTree: FileTree | null;
  isFileFetching: boolean;
  currentFileNode: FileNode | null;
  errors: {
    error: string;
    message: string;
  } | null;
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
  getCurrentFile: (node: FileNode | null) => void;
  saveCurrentExcalidrawFile: () => void;
};

const fileMenuContext = createContext({
  fileManager: {},
} as unknown as FileManagerContext);

const { Provider } = fileMenuContext;

interface FileMenuProviderProps {
  children: ReactNode;
  excalidrawAPI: ExcalidrawImperativeAPI;
}

export function FileMenuProvider({
  children,
  excalidrawAPI,
}: FileMenuProviderProps): JSX.Element {
  const fileMenu = useFileMenuProvider({ excalidrawAPI });
  if (fileMenu === null) {
    return <>Component should be wrapped in a FileMenuProvider</>;
  }
  return <Provider value={fileMenu}>{children}</Provider>;
}

export const useFile = () => {
  return useContext(fileMenuContext);
};

const useFileMenuProvider = ({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}) => {
  const { data: auth } = useAuthUser();
  const [fileTree, setFileTree] = useState<FileTree | null>(null);
  const [currentNode, setCurrentNode] = useState<FileNode | null>(null);
  const [isFileFetching, setIsFileFetching] = useState(false);
  const [errors, setErrors] = useState<{
    error: string;
    message: string;
  } | null>(null);

  const actionManager = useExcalidrawActionManager();

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

  if (!actionManager.isActionEnabled(actionLoadScenFromJSON)) {
    return null;
  }

  const getCurrentFile = async (node: FileNode | null) => {
    if (!node || !node.id) {
      setErrors({
        error: "file_not_found",
        message: "File not found",
      });
      return;
    }
    setCurrentNode(node);
    setIsFileFetching(true);
    const fetchedFile = await fetchFile({ fileId: node?.id });
    if (fetchedFile.error === null) {
      const Excalidraw_data = JSON.parse(fetchedFile.data);
      actionManager.executeAction(actionLoadScenFromJSON, "ui", {
        data: Excalidraw_data,
      });
      setErrors(null);
      setIsFileFetching(false);
    }
  };

  const saveCurrentExcalidrawFile = async () => {
    const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
    const appState = excalidrawAPI.getAppState();
    const appFiles = excalidrawAPI.getFiles();
    console.log(elements, appState, appFiles);
  };

  const createExcalidrawFile = async (fileName: string, content: string) => {
    if (!auth?.user?.id) {
      return { error: "unauthorized", message: "No user id found" };
    }
    //if (content === "") {
    //  content = JSON.stringify(JSON_FILE);
    //}
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
    isFileFetching,
    errors,
    currentFileNode: currentNode,
    createExcalidrawFile,
    getExcalidrawFile,
    getCurrentFile,
    saveCurrentExcalidrawFile,
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
