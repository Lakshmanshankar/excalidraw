import { createContext, useCallback, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFile,
  createFolder as createFolderAPI,
  deleteFileAPI,
  deleteFolderAPI,
  moveFileNodeAPI,
  updateFileOrFolder,
} from "../lib/file";
import { fetchFile, getFileTree, updateFileTree } from "../lib/file-api";
import { useAuthUser } from "./useAuth";
import { useExcalidrawActionManager } from "../../../packages/excalidraw/components/App";
import { actionLoadScenFromJSON } from "../../../packages/excalidraw/actions/actionExport";
import type { ReactNode } from "react";
import { type FileNode, type FileTree } from "../lib/file-tree-types";
import { type ExcalidrawImperativeAPI } from "../../../packages/excalidraw/types";
import { KEY } from "./ReactQueryProvider";
import DEFAULT_EXCALIDRAW from "./default.json";

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
  isSaving: boolean;
  loadFile: (node: FileNode | null) => Promise<any>;
  saveCurrentFile: () => Promise<any>;
  createExcalidrawFile: (
    fileName: string,
    content: string,
    parentFolderId: string,
  ) => Promise<any>;
  createFolder: (folderName: string, parentFolderId: string) => Promise<any>;
  updateFileNode: (fileId: string, updatedNode: FileNode) => Promise<any>;
  deleteFileNode: (fileId: string) => Promise<any>;
  deleteFolder: (folderId: string) => Promise<any>;
  moveFileNode: (
    sourceNodeId: string,
    destinationContainerId: string,
  ) => Promise<any>;
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
  isSaving: false,
  createExcalidrawFile: async () => {},
  createFolder: async () => {},
  updateFileNode: async () => {},
  moveFileNode: async () => {},
  deleteFileNode: async () => {},
  deleteFolder: async () => {},
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
 * - Create new files (or folders), update file tree and delete files.
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
  const [isSaving, setIsSaving] = useState(false);
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

  const createFolderMuation = useMutation({
    mutationFn: async ({
      folderName,
      parentFolderId,
    }: {
      folderName: string;
      parentFolderId: string;
    }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }

      return createFolderAPI(
        auth.user.id,
        folderName,
        fileTreeResponse?.data?.file_tree as FileTree,
        parentFolderId,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data?.fileTree,
          };
        });
      }
    },
  });

  const moveFileMutation = useMutation({
    mutationFn: async ({
      sourceId: sourceNodeId,
      destinationContainerId,
    }: {
      sourceId: string;
      destinationContainerId: string;
    }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }

      return moveFileNodeAPI(
        sourceNodeId,
        destinationContainerId,
        fileTreeResponse?.data?.file_tree as FileTree,
        auth.user.id,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data?.fileTree,
          };
        });
      }
    },
  });

  const updateFileNodeMutation = useMutation({
    mutationFn: async ({
      fileId: fileID,
      updatedNode,
      content,
    }: {
      fileId: string;
      updatedNode: FileNode;
      content: string;
    }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }

      if (content === "") {
        content = JSON.stringify(DEFAULT_EXCALIDRAW);
      }

      return updateFileOrFolder(
        auth.user.id,
        fileID,
        updatedNode,
        fileTreeResponse?.data?.file_tree as FileTree,
        content,
        true,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data?.fileTree,
          };
        });
        setIsSaving(false);
      }
    },
  });

  const createFileMutation = useMutation({
    mutationFn: async ({
      fileName,
      content,
      parentFolderId,
    }: {
      fileName: string;
      content: string;
      parentFolderId: string;
    }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }

      if (content === "") {
        content = JSON.stringify(DEFAULT_EXCALIDRAW);
      }

      return createFile(
        auth.user.id,
        fileName,
        content,
        parentFolderId,
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
        setIsSaving(false);
      }
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async ({ fileId: fileID }: { fileId: string }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }
      return deleteFileAPI(
        auth.user.id,
        fileID,
        fileTreeResponse?.data?.file_tree,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data.fileTree,
          };
        });
      }
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async ({ folderId: folderID }: { folderId: string }) => {
      if (!auth?.user?.id) {
        throw new Error("Unauthorized: No user ID found");
      }
      return deleteFolderAPI(
        auth.user.id,
        folderID,
        fileTreeResponse?.data?.file_tree,
      );
    },
    onSuccess: (data) => {
      if (data?.error === null) {
        queryClient.setQueryData([KEY.FILE_TREE, userId], (oldData: any) => {
          return {
            ...oldData,
            file_tree: data.data.fileTree,
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
          // staleTime: 5 * 60 * 1000
        });
        if (fetchedFile.error === null) {
          const sceneData = JSON.parse(fetchedFile.data);
          // console.log(sceneData);
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
    setIsSaving(true);
    const { collaborators, ...previousAppState } = {
      ...excalidrawAPI.getAppState(),
    };
    const content = {
      type: "excalidraw",
      version: 1,
      source: "https://excalidraw.com",
      elements: excalidrawAPI.getSceneElements(),
      appState: previousAppState,
      files: excalidrawAPI.getFiles(),
    };
    if (currentFileNode?.id) {
      return updateFileNodeMutation.mutateAsync({
        fileId: currentFileNode.id,
        updatedNode: currentFileNode,
        content: JSON.stringify(content),
      });
    }
    return createFileMutation.mutateAsync({
      fileName: "Untitled",
      content: JSON.stringify(content),
      parentFolderId: "",
    });
  };

  const createExcalidrawFile = async (
    fileName: string,
    content: string,
    parentFolderId: string,
  ) => {
    if (!auth?.user?.id) {
      return { error: "unauthorized", message: "No user id found" };
    }
    return createFileMutation.mutateAsync({
      fileName,
      content,
      parentFolderId,
    });
  };

  const createFolder = async (folderName: string, parentFolderId: string) => {
    return createFolderMuation.mutateAsync({
      folderName,
      parentFolderId,
    });
  };

  const updateFileNode = async (fileId: string, updatedNode: FileNode) => {
    return updateFileNodeMutation.mutateAsync({
      fileId,
      updatedNode,
      content: JSON.stringify(DEFAULT_EXCALIDRAW),
    });
  };

  const moveFileNode = async (
    sourceNodeId: string,
    destinationContainerId: string,
  ) => {
    return moveFileMutation.mutateAsync({
      sourceId: sourceNodeId,
      destinationContainerId,
    });
  };

  const deleteFileNode = async (fileId: string) => {
    return deleteFileMutation.mutateAsync({
      fileId,
    });
  };

  const deleteFolder = async (folderId: string) => {
    return deleteFolderMutation.mutateAsync({
      folderId,
    });
  };
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
    isSaving,
    createExcalidrawFile,
    createFolder,
    updateFileNode,
    moveFileNode,
    deleteFileNode,
    deleteFolder,
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
