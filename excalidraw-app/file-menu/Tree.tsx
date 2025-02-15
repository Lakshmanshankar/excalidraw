import { Button } from "../../packages/excalidraw/components/Button";
import {
  FileIcon,
  FolderIcon,
  searchIcon,
} from "../../packages/excalidraw/components/icons";
import { useAuthUser } from "./hooks/useAuth";
import { createFolder } from "./lib/file";
import { type FileNode, type FileTree } from "./lib/file-tree-types";
import { useI18n } from "../../packages/excalidraw/i18n";
import Spinner from "../../packages/excalidraw/components/Spinner";
import { TextField } from "../../packages/excalidraw/components/TextField";
import { useState } from "react";
import { useFileOptimized } from "./hooks/useFileOptimized";
import React from "react";

export default function Tree() {
  const { data } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  // const { fileTree, createExcalidrawFile, saveCurrentExcalidrawFile } =
  //   useFile();
  const {
    fileTree,
    createExcalidrawFile,
    saveCurrentFile: saveCurrentExcalidrawFile,
  } = useFileOptimized();

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
              <FileNodeTile key={index} node={item} />
            ))}
          </div>
        </div>
        <div>
          <Button
            onSelect={() => {
              saveCurrentExcalidrawFile();
            }}
          >
            {" "}
            Save
          </Button>
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
                createExcalidrawFile("fileName.excalidraw", "");
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
  // const { getCurrentFile, isFileFetching, currentFileNode } = useFile();
  const {
    loadFile: getCurrentFile,
    isFileTreeLoading: isFileFetching,
    currentFileNode: currentFileNode,
  } = useFileOptimized();

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
