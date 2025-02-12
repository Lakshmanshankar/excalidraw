import { Button } from "../../packages/excalidraw/components/Button";
import {
  FileIcon,
  FolderIcon,
} from "../../packages/excalidraw/components/icons";
import { useAuthUser } from "./hooks/useAuth";
import { useFile } from "./hooks/useFile";
import { createFolder } from "./lib/file";
import { type FileNode, type FileTree } from "./lib/file-tree-types";

export default function Tree() {
  const { data } = useAuthUser();
  const { fileTree, createExcalidrawFile } = useFile();

  if (data && data.user) {
    return (
      <>
        <div className="file-menu-recent">
          <h1 className="file-menu-recent-heading">Recent</h1>
          <div>
            {fileTree?.recent?.map((item) => (
              <FileNodeTile props={item} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          <h1 className="file-menu-recent-heading">Files</h1>
          <div style={{ display: "flex", gap: "5px" }}>
            <Button
              onSelect={() =>
                createFolder(
                  data?.user.id,
                  "dummy",
                  fileTree as unknown as FileTree,
                )
              }
            >
              {FolderIcon}
            </Button>
            <Button
              onSelect={() => {
                createExcalidrawFile(
                  "spers.excalidraw",
                  `{"type":"excalidraw"}`,
                );
              }}
            >
              {FileIcon}
            </Button>
          </div>
        </div>
      </>
    );
  }
  return <></>;
}

function FileNodeTile({ props }: { props: FileNode }) {
  const nameWithoutSuffix = props.name.endsWith(".excalidraw")
    ? props.name.slice(0, -11)
    : props.name;
  return (
    <>
      <div className="file-node-tile">{nameWithoutSuffix}</div>
    </>
  );
}
