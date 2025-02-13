import { Button } from "../../packages/excalidraw/components/Button";
import {
  FileIcon,
  FolderIcon,
} from "../../packages/excalidraw/components/icons";
import { useAuthUser } from "./hooks/useAuth";
import { useFile } from "./hooks/useFile";
import { createFolder } from "./lib/file";
import { type FileNode, type FileTree } from "./lib/file-tree-types";
import { useI18n } from "../../packages/excalidraw/i18n";
import Spinner from "../../packages/excalidraw/components/Spinner";

export default function Tree() {
  const { data } = useAuthUser();
  const { fileTree, createExcalidrawFile } = useFile();
  const { t } = useI18n();
  if (data && data.user) {
    return (
      <>
        <div className="file-menu-recent-container">
          <h1 className="file-menu-heading">{t("labels.fileMenu.recent")}</h1>
          <div className="file-menu-recent">
            {fileTree?.recent?.map((item, index) => (
              <FileNodeTile key={index} node={item} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          <h1 className="file-menu-heading">{t("labels.fileMenu.files")}</h1>
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
                createExcalidrawFile("prefix.excalidraw", "");
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

function FileNodeTile({ node }: { node: FileNode }) {
  const nameWithoutSuffix = node.name.endsWith(".excalidraw")
    ? node.name.slice(0, -11)
    : node.name;
  const { getCurrentFile, isFileFetching, currentFileNode } = useFile();
  return (
    <>
      <button
        className="file-node-tile"
        onClick={() => {
          getCurrentFile(node);
        }}
        draggable
      >
        <span className="file-node-spinner">
          {currentFileNode &&
            currentFileNode.id === node.id &&
            isFileFetching && <Spinner className="" />}
        </span>
        {nameWithoutSuffix}
      </button>
    </>
  );
}
