import { SERVER_URL } from "../consts";
import { type FileTree } from "./file-tree-types";

const STORAGE_ERRORS = ["StorageApiError"];

export const fetchFile = async ({ fileId }: { fileId: string }) => {
  if (!fileId) {
    return { error: "Invalid argument", messsage: "File ID is required" };
  }
  const res = await fetch(`${SERVER_URL}/api/v1/file/get`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: `${fileId}.excalidraw`,
    }),
  });
  if (!res.ok) {
    return {
      error: "Failed to fetch file",
      message: "Failed to fetch file",
    };
  }

  const data = await res.json();
  const signedUrl = data?.data?.signedUrl;

  if (!signedUrl) {
    return {
      error: "Invalid arguments",
      message: "No signed url found",
    };
  }

  const fileRes = await fetch(signedUrl);
  if (!fileRes.ok) {
    return {
      error: "Failed to fetch file",
      message: "Unable to fetch file from signed url",
    };
  }

  const blob = await fileRes.blob();
  const text = await blob.text();
  return {
    error: null,
    message: "File fetched successfully",
    data: text,
  };
};

export const getFileTree = async (userID: string) => {
  const res = await fetch(`${SERVER_URL}/api/v1/file/get_tree/${userID}`, {
    credentials: "include",
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
};

export const updateFileTree = async (userID: string, fileTree: FileTree) => {
  if (!fileTree || !fileTree._id) {
    return { error: "Invalid Arguments", message: "File tree cannot be empty" };
  }
  const res = await fetch(`${SERVER_URL}/api/v1/file/update_tree`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userID,
      fileTree,
    }),
  });

  if (res.ok) {
    return {
      error: null,
      message: "File tree updated successfully",
      data: res.json(),
    };
  }
  return {
    error: "Failed to update file tree",
    message: "Failed to update file tree",
    data: res.json(),
  };
};

export const uploadFileUsingSignedURL = async ({
  fileId,
  fileBlob,
}: {
  fileId: string;
  fileBlob: Blob;
}) => {
  try {
    const res = await fetch(`${SERVER_URL}/api/v1/file/post`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: `${fileId}.excalidraw`,
      }),
    });

    if (!res.ok) {
      return {
        error: "Failed to upload file",
        message: "Unable to generate upload url",
      };
    }

    const data = await res.json();
    if (
      data?.data?.status === 400 &&
      STORAGE_ERRORS.includes(data?.data?.name)
    ) {
      return {
        error: "Storage API Error",
        name: data?.data?.name,
        message: data?.data?.message,
        status: data?.data?.status,
      };
    }
    const { signedUrl, token, path } = data?.data || {};

    if (!signedUrl || !token) {
      return {
        error: "Invalid arguments",
        message: "No signed url or token found",
      };
    }
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: fileBlob,
      headers: {
        "Content-Type": fileBlob.type,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!uploadResponse.ok) {
      return {
        error: "Failed to upload file",
        message: "Upload file using signed url failed",
      };
    }

    return {
      error: null,
      message: "File uploaded successfully",
      data: {
        url: path,
        fileId,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
