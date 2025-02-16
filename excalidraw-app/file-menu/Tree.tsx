import { Button } from "../../packages/excalidraw/components/Button";
import {
  FileIcon,
  FileOpenIcon,
  FolderClosedIcon,
  FolderIcon,
  SaveFileIcon,
  searchIcon,
} from "../../packages/excalidraw/components/icons";
import { useAuthUser } from "./hooks/useAuth";
import { type FileNode } from "./lib/file-tree-types";
import { useI18n } from "../../packages/excalidraw/i18n";
import Spinner from "../../packages/excalidraw/components/Spinner";
import { TextField } from "../../packages/excalidraw/components/TextField";
import { useState } from "react";
import { useFileOptimized } from "./hooks/useFileOptimized";

export default function Tree() {
  const { data } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { fileTree } = useFileOptimized();

  const { t } = useI18n();
  if (data && data.user) {
    return (
      <>
        <div className="file-menu-search">
          <TextField
            className="file-menu-search-input"
            value={searchQuery}
            icon={searchIcon}
            placeholder="Search for a file"
            onChange={(e) => {
              setSearchQuery(e);
            }}
          />
        </div>

        <div className="file-menu-recent-container">
          <h1 className="file-menu-heading">{t("labels.fileMenu.recent")}</h1>
          <div className="file-menu-recent">
            {fileTree?.recent?.map((item, index) => (
              <FileNodeTile key={index} node={item} depth={0} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          <h1 className="file-menu-heading">{t("labels.fileMenu.files")}</h1>
          <FolderNode
            node={{ id: "", name: "root", type: "folder", children: [] }}
          />
        </div>

        {/* FILE TREE */}
        <div className="file-menu-tree-container">
          {fileTree?.children?.map((item, index) => {
            if (item.type === "folder") {
              return <FolderNode node={item} key={index} />;
            }
            return <FileNodeTile node={item} key={index} depth={0} />;
          })}
        </div>
      </>
    );
  }
  return <></>;
}

function FolderNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [canShowCreateFolder, setCanShowCreateFolder] = useState(false);
  const [isFile, setIsFile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (node.type !== "folder") {
    return null;
  }

  return (
    <div className="file-menu-folder-item-container">
      <div
        className="file-menu-folder-trigger"
        style={{ marginLeft: depth * 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="file-menu-folder-item-inner">
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button
              className="file-menu-toggle-button"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? FolderClosedIcon : FileOpenIcon}
            </button>
            {node.name}
            {isHovered && (
              <div style={{ display: "flex", gap: "5px" }}>
                <Button
                  className="file-menu-button"
                  onSelect={() => setCanShowCreateFolder((prev) => !prev)}
                >
                  {FolderIcon}
                </Button>
                <Button
                  className="file-menu-button"
                  onSelect={() => {
                    setCanShowCreateFolder((prev) => !prev);
                    setIsFile((prev) => !prev);
                  }}
                >
                  {FileIcon}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {canShowCreateFolder ? (
        <div className="file-menu-folder-content create-folder-container">
          {canShowCreateFolder && (
            <CreateFolderInput parentFolderId={node.id} isFile={isFile} />
          )}
        </div>
      ) : null}

      {isOpen ? (
        <div className="file-menu-folder-content">
          {node.children?.map((child) => {
            if (child.type === "folder") {
              return (
                <FolderNode key={child.id} node={child} depth={depth + 1} />
              );
            }
            return (
              <FileNodeTile key={child.id} node={child} depth={depth + 1} />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FileNodeTile({ node, depth }: { node: FileNode; depth: number }) {
  const nameWithoutSuffix = node.name.endsWith(".excalidraw")
    ? node.name.slice(0, -11)
    : node.name;
  const {
    loadFile: getCurrentFile,
    isCurrentNodeFetching: isFileFetching,
    currentFileNode,
  } = useFileOptimized();

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <button
        className="file-node-tile"
        onClick={() => {
          getCurrentFile(node);
        }}
        draggable
      >
        <span className="file-node-spinner file-menu-button">
          {currentFileNode &&
          currentFileNode.id === node.id &&
          isFileFetching ? (
            <Spinner className="" />
          ) : (
            FileIcon
          )}
        </span>
        {nameWithoutSuffix}
      </button>
    </div>
  );
}

function CreateFolderInput({
  parentFolderId,
  isFile = false,
}: {
  parentFolderId: string;
  isFile: boolean;
}) {
  const [folderName, setFolderName] = useState("");
  const { createFolder, createExcalidrawFile } = useFileOptimized();
  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        alignItems: "center",
        height: "18px",
      }}
    >
      <TextField
        className="file-menu-search-input"
        value={folderName}
        icon={FolderIcon}
        placeholder="Enter Folder name"
        onChange={(e) => {
          setFolderName(e);
        }}
      />
      <Button
        className="file-menu-button"
        onSelect={() => {
          if (isFile) {
            createExcalidrawFile(folderName, "", parentFolderId);
          } else {
            createFolder(folderName, parentFolderId);
          }
        }}
        style={{ marginTop: "3px" }}
      >
        {SaveFileIcon}
      </Button>
    </div>
  );
}
