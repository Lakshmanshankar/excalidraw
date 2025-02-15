import { createContext, useCallback, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFile } from "../lib/file";
import { fetchFile, getFileTree, updateFileTree } from "../lib/file-api";
import { useAuthUser } from "./useAuth";
import { useExcalidrawActionManager } from "../../../packages/excalidraw/components/App";
import { actionLoadScenFromJSON } from "../../../packages/excalidraw/actions/actionExport";
import React from "react";
import type { ReactNode } from "react";
import { type FileNode, type FileTree } from "../lib/file-tree-types";
import { type ExcalidrawImperativeAPI } from "../../../packages/excalidraw/types";
import { KEY } from "./ReactQueryProvider";

type FileContext = {
  fileTree: FileTree | null;
  isFileTreeLoading: boolean;
  fileTreeError: Error | null;
  currentFileNode: FileNode | null;
  isCurrentNodeFetching: boolean;
  error: {
    error: string;
    message: string;
  } | null;
  loadFile: (node: FileNode | null) => Promise<any>;
  saveCurrentFile: () => Promise<any>;
  createExcalidrawFile: (fileName: string, content: string) => Promise<any>;
};

const fileContext = createContext<FileContext>({
  fileTree: null,
  isFileTreeLoading: false,
  fileTreeError: null,
  currentFileNode: null,
  isCurrentNodeFetching: false,
  error: null,
  loadFile: async () => {},
  saveCurrentFile: async () => {},
  createExcalidrawFile: async () => {},
});

const { Provider } = fileContext;

interface FileProviderProps {
  children: ReactNode;
  excalidrawAPI: ExcalidrawImperativeAPI;
}

export function FileProviderOptimized({
  children,
  excalidrawAPI,
}: FileProviderProps): JSX.Element {
  const file = useFileHook(excalidrawAPI);
  if (file === null) {
    return <>Component should be wrapped in a FileProvider</>;
  }
  return <Provider value={file}>{children}</Provider>;
}

export const useFileOptimized = () => {
  return useContext(fileContext);
};

/**
 * Custom hook to manage file operations.
 * Core responsibilities:
 * - Load scene from file.
 * - Save current file (create new if no file-node is selected, or update in-place).
 * - Create new files (or folders) and update file tree.
 * - Get file tree date and update it and update it without refetching.
 */
export const useFileHook = (excalidrawAPI: ExcalidrawImperativeAPI) => {
  const { data: auth } = useAuthUser();
  const queryClient = useQueryClient();
  const actionManager = useExcalidrawActionManager();

  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);
  const [isCurrentNodeFetching, setIsCurrentNodeFetching] = useState(false);
  const [error, setError] = useState<{ error: string; message: string } | null>(
    null,
  );
  const userId = auth?.user?.id;

  const {
    data: fileTreeResponse,
    isLoading: isFileTreeLoading,
    error: fileTreeError,
  } = useQuery({
    queryKey: [KEY.FILE_TREE, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await getFileTree(userId);
      const fileTree = response.data?.file_tree;

      if (!fileTree || fileTree._id !== userId) {
        const newTree = createDefaultFileTree(userId);
        await updateFileTree(userId, newTree);
        return { data: { file_tree: newTree } };
      }

      return response;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    // refetchOnWindowFocus: false,
  });

  const createFileMutation = useMutation({
    mutationFn: async ({
      fileName,
      content,
    }: {
      fileName: string;
      content: string;
    }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }

      return createFile(
        auth.user.id,
        fileName,
        content,
        fileTreeResponse?.data?.file_tree as FileTree,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        // refetch
        // queryClient.invalidateQueries({
        //   queryKey: [KEY.FILE_TREE, userId],
        // });
        // or update file tree
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data?.fileTree,
          };
        });
      }
    },
  });

  const loadFile = useCallback(
    async (node: FileNode | null) => {
      setIsCurrentNodeFetching(true);
      if (!node || !node.id) {
        setError({ error: "file_not_found", message: "File not found" });
        return;
      }
      setCurrentFileNode(node);
      try {
        const fetchedFile = await queryClient.fetchQuery({
          queryKey: ["file", node.id],
          queryFn: () => fetchFile({ fileId: node.id }),
          staleTime: 5 * 60 * 1000,
        });
        if (fetchedFile.error === null) {
          const sceneData = JSON.parse(fetchedFile.data);
          actionManager.executeAction(actionLoadScenFromJSON, "ui", {
            data: sceneData,
          });
          setError(null);
        } else {
          setError({
            error: fetchedFile.error,
            message: fetchedFile.message || "",
          });
        }
      } catch (err: any) {
        setError({ error: "fetch_error", message: err.message });
      } finally {
        setIsCurrentNodeFetching(false);
      }
    },
    [queryClient, actionManager],
  );

  /**
   * Saves the current Excalidraw file.
   * - If no file is selected, it’s treated as a new file (saved to recent).
   * - Otherwise, it updates the file in place and invalidates the file tree if needed.
   */
  const saveCurrentFile = async () => {
    const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
    const appState = excalidrawAPI.getAppState();
    const appFiles = excalidrawAPI.getFiles();
    if (currentFileNode === null) {
      // this is a new file save it as untitled
    }
    const content = JSON.stringify({
      type: "excalidraw",
      version: 1,
      source: "https://excalidraw.com",
      elements,
      appState,
      files: appFiles,
    });

    console.log(content);
    // if (!currentFileNode) {
    //   return await createFileMutation.mutateAsync({
    //     fileName: "Untitled",
    //     content,
    //   });
    // }
    // // Update the current file.
    // const response = await updateFileAPI(currentFileNode.id, content);
    // // Optionally update file tree if properties have changed.
    // queryClient.invalidateQueries(["fileTree", auth!.user.id]);
    // return response;
  };

  /**
   * Creates a new file.
   * Can be extended to also support folder creation.
   */
  const createExcalidrawFile = async (fileName: string, content: string) => {
    if (!auth?.user?.id) {
      return { error: "unauthorized", message: "No user id found" };
    }
    return createFileMutation.mutateAsync({ fileName, content });
  };

  // --- Placeholders for future features ---
  // const createFolder = async (folderName: string, parentFolderId: string) => { ... };
  // const handleDragAndDrop = (sourceId: string, targetFolderId: string) => { ... };

  return {
    fileTree: fileTreeResponse?.data?.file_tree ?? null,
    isFileTreeLoading,
    fileTreeError,
    // Currently selected file and errors
    currentFileNode,
    isCurrentNodeFetching,
    error,
    // Core functions
    loadFile,
    saveCurrentFile,
    createExcalidrawFile,
  };
};

const createDefaultFileTree = (userId: string): FileTree => {
  return {
    _id: userId,
    ownerID: userId,
    children: [],
    recent: [],
  };
};
