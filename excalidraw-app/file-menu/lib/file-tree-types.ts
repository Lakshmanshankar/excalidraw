export type FileNode = {
  id: string; // uuid-v4
  name: string;
  type: "folder" | "file";
  children: FileNode[];
};

export type FileTree = {
  _id: string;
  ownerID: string;
  children: FileNode[];
  recent: FileNode[]; // just single lvl only.
};
