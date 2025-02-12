import { v4 } from "uuid";
import { type FileNode, type FileTree } from "./file-tree-types";
import { addNode, getParentNodeId, updateNode } from "./file-tree-utils";
import { updateFileTree, uploadFileUsingSignedURL } from "./file-api";

export const createFile = async (
  userId: string,
  fileName: string,
  content: string,
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
    const newFileTree = addNode(fileTree, "", newNode);
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
  parentFolderName: string,
  fileTree: FileTree,
) => {
  const fileId = v4();
  const newNode: FileNode = {
    name: parentFolderName,
    id: fileId,
    type: "folder",
    children: [],
  };
  const newFileTree = addNode(fileTree, "", newNode, true);
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

export const updateFile = async (
  fileId: string,
  content: string,
  fileTree: FileTree,
  newNode: FileNode,
  shouldUpdateProperties = false,
) => {
  const excalidrawFile = new Blob([JSON.stringify(content)], {
    type: "application/json",
  });
  const uploadFileToBlob = await uploadFileUsingSignedURL({
    fileId,
    fileBlob: excalidrawFile,
  });
  if (uploadFileToBlob.error === null && shouldUpdateProperties) {
    const parentFolderId = getParentNodeId(fileTree, fileId);
    const newFileTree = updateNode(fileTree, parentFolderId, newNode);
    return {
      error: null,
      message: "File updated successfully",
      data: {
        fileTree: newFileTree,
      },
    };
  }
  return {};
};
