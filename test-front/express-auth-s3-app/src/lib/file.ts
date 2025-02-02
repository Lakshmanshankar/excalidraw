import { SERVER_URL } from "../consts";

export const getReadOnlySignedUrl = async ({
  userId,
  fileId,
}: {
  userId: string;
  fileId: string;
}) => {
  console.log(`${userId}/${fileId}.excalidraw`);
  const res = await fetch(`${SERVER_URL}/api/v1/file/get`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: `${userId}/${fileId}.excalidraw`,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch signed URL");
  }

  const data = await res.json();
  console.log(data, "DATA");
  //const fileRes = await fetch(url);
  //if (!fileRes.ok) {
  //  throw new Error("Failed to fetch file");
  //}

  //const blob = await fileRes.blob();
  //const text = await blob.text();
  //const json = JSON.parse(text);
  //console.log(json, "JSON CONTNET");
  return text; // or return json if it's structured data
};

export const uploadSignedUrl = async ({
  userId,
  fileId,
  signedUrl,
}: {
  userId: string;
  fileId: string;
  signedUrl: string;
}) => {
  const res = await fetch(`${SERVER_URL}/api/file/post`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: `${userId}/${fileId}.excalidraw`,
      signedUrl,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }

  const { url } = await res.json();

  const fileRes = await fetch(url);
  if (!fileRes.ok) {
    throw new Error("Failed to upload file");
  }

  const blob = await fileRes.blob();
  const text = await blob.text();
  const json = JSON.parse(text);
  console.log(json, "JSON CONTNET");
  return text; // or return json if it's structured data
};
