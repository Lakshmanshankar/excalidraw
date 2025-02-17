import { v4 } from "uuid";
import { type FileNode, type FileTree } from "./file-tree-types";
import { addNode, moveNode, updateNode } from "./file-tree-utils";
import { updateFileTree, uploadFileUsingSignedURL } from "./file-api";

export const createFile = async (
  userId: string,
  fileName: string,
  content: string,
  parentFolderId: string,
  fileTree: FileTree,
) => {
  const fileId = v4();
  const excalidrawBlob = new Blob([JSON.stringify(content)], {
    type: "application/json",
  });
  const uploadFileToBlob = await uploadFileUsingSignedURL({
    fileId,
    fileBlob: excalidrawBlob,
  });
  if (uploadFileToBlob.error === null) {
    const newNode: FileNode = {
      name: fileName,
      id: fileId,
      type: "file",
      children: [],
    };
    const newFileTree = addNode(fileTree, parentFolderId, newNode);
    const res = await updateFileTree(userId, newFileTree);
    if (res.error) {
      return {
        error: res.error,
        message: res.message,
        data: res.data,
      };
    }
    return {
      error: null,
      message: "File created successfully",
      data: {
        fileTree: newFileTree,
      },
    };
  }
  return uploadFileToBlob;
};

// Folders are logically created by adding a new node to the file.
// Actual files are stored as flat files in the file system.
export const createFolder = async (
  userId: string,
  name: string,
  fileTree: FileTree,
  parentFolderName = "",
) => {
  const fileId = v4();
  const newNode: FileNode = {
    name,
    id: fileId,
    type: "folder",
    children: [],
  };
  const newFileTree = addNode(fileTree, parentFolderName, newNode);
  const res = await updateFileTree(userId, newFileTree);
  if (res.error) {
    return {
      error: res.error,
      message: res.message,
      data: res.data,
    };
  }
  return {
    error: null,
    message: "Folder created successfully",
    data: {
      fileTree: newFileTree,
    },
  };
};

export const moveFileNodeAPI = async (
  sourceNodeId: string,
  destinationContainerId: string,
  fileTree: FileTree,
  userId: string,
) => {
  const newFileTree = moveNode(fileTree, sourceNodeId, destinationContainerId);
  const res = await updateFileTree(userId, newFileTree);
  return res.error
    ? { error: res.error, message: res.message, data: res.data }
    : {
        error: null,
        message: "FileNode updated successfully",
        data: { fileTree: newFileTree },
      };
};

export const updateFileOrFolder = async (
  userId: string,
  fileId: string,
  newNode: FileNode,
  fileTree: FileTree,
  content?: string,
  shouldUpdateProperties = false,
) => {
  async function updateFileTreeNode() {
    const newFileTree = updateNode(fileTree, fileId, newNode);
    const res = await updateFileTree(userId, newFileTree);
    return res.error
      ? { error: res.error, message: res.message, data: res.data }
      : {
          error: null,
          message: "FileNode updated successfully",
          data: { fileTree: newFileTree },
        };
  }

  if (newNode.type === "file") {
    const excalidrawFile = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    const uploadFileToBlob = await uploadFileUsingSignedURL({
      fileId,
      fileBlob: excalidrawFile,
    });

    if (uploadFileToBlob.error) {
      return {
        error: uploadFileToBlob.error,
        message: "File upload failed",
        data: null,
      };
    }

    if (!shouldUpdateProperties) {
      return { error: null, message: "File uploaded successfully", data: null };
    }
  }

  return updateFileTreeNode();
};
