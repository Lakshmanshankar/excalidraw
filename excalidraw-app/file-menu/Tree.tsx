import { Button } from "../../packages/excalidraw/components/Button";
import {
  cutIcon,
  EditFileIcon,
  FileIcon,
  FileOpenIcon,
  FolderClosedIcon,
  FolderIcon,
  PasteFileIcon,
  SaveFileIcon,
  TrashIcon,
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
  // const [searchQuery, setSearchQuery] = useState("");
  const { fileTree } = useFileOptimized();
  const [copyNode, setCopyNode] = useState<FileNode | null>(null);

  const setCopyNodeHandler = (node: FileNode | null) => {
    setCopyNode(node);
  };

  const { moveFileNode } = useFileOptimized();
  // pastable only on folder nodes
  const pasteNodeHandler = async (node: FileNode | null) => {
    if (copyNode) {
      if (!node?.id || node?.id === copyNode.id) {
        return;
      }
      moveFileNode(copyNode.id, node.id);
      setCopyNode(null);
    }
  };
  const { t } = useI18n();
  if (data && data.user) {
    return (
      <>
        {/* <div className="file-menu-search">
          <TextField
            className="file-menu-search-input"
            value={searchQuery}
            icon={searchIcon}
            placeholder="Search for a file"
            onChange={(e) => {
              setSearchQuery(e);
            }}
          />
        </div> */}

        <div className="file-menu-recent-container">
          <h1 className="file-menu-heading">{t("labels.fileMenu.recent")}</h1>
          <div className="file-menu-recent">
            {fileTree?.recent?.map((item, index) => (
              <FileNodeTile
                key={index}
                node={item}
                depth={0}
                onCopyNode={setCopyNodeHandler}
                copyNode={copyNode}
              />
            ))}
          </div>
        </div>

        <FolderNode
          node={{ id: "", name: "root", type: "folder", children: [] }}
        />

        {/* FILE TREE */}
        <div className="file-menu-tree-container">
          {fileTree?.children?.map((item, index) => {
            if (item.type === "folder") {
              return (
                <FolderNode
                  node={item}
                  key={index}
                  copyNode={copyNode}
                  onCopyNode={setCopyNodeHandler}
                  onPasteNode={pasteNodeHandler}
                />
              );
            }
            return (
              <FileNodeTile
                node={item}
                key={index}
                depth={0}
                copyNode={copyNode}
                onCopyNode={setCopyNodeHandler}
              />
            );
          })}
        </div>
      </>
    );
  }
  return <></>;
}

function FolderNode({
  node,
  depth = 0,
  copyNode,
  onCopyNode,
  onPasteNode,
}: {
  node: FileNode;
  depth?: number;
  copyNode?: FileNode | null;
  onCopyNode?: (node: FileNode | null) => void;
  onPasteNode?: (node: FileNode | null) => void;
}) {
  const [canShowCreateFolder, setCanShowCreateFolder] = useState(false);
  const [canEditFileName, setCanEditFileName] = useState(false);
  const [isFile, setIsFile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isRootNode = node.id === "" && node.name === "root";
  const { t } = useI18n();

  const { deleteFolder } = useFileOptimized();

  if (node.type !== "folder") {
    return null;
  }

  const onFileSaveHandler = async () => {
    setCanEditFileName(false);
    setCanShowCreateFolder(false);
  };

  return (
    <div className="file-menu-folder-item-container">
      <div
        className="file-menu-folder-trigger"
        style={{
          marginLeft: depth * 20,
          ...(isRootNode && { background: "transparent" }),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="file-menu-folder-item-inner">
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
            }}
          >
            {isRootNode ? null : (
              <button
                className="file-menu-toggle-button"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? FolderClosedIcon : FileOpenIcon}
              </button>
            )}
            {isRootNode ? (
              <h1 className="file-menu-heading">
                {t("labels.fileMenu.files")}
              </h1>
            ) : (
              node.name
            )}
            {(isHovered || isRootNode) && (
              <div style={{ display: "flex", gap: "5px" }}>
                <Button
                  className="file-menu-button"
                  onSelect={() => {
                    setCanShowCreateFolder((prev) => !prev);
                    setIsFile(false);
                  }}
                >
                  {FolderIcon}
                </Button>
                <Button
                  className="file-menu-button"
                  onSelect={() => {
                    setCanShowCreateFolder((prev) => !prev);
                    setIsFile((prev) => true);
                  }}
                >
                  {FileIcon}
                </Button>
                <Button
                  className="file-menu-button"
                  onSelect={() => {
                    deleteFolder(node.id);
                  }}
                >
                  {TrashIcon}
                </Button>

                {!isRootNode && (
                  <Button
                    className="file-menu-button"
                    onSelect={() => {
                      setCanEditFileName((prev) => !prev);
                    }}
                  >
                    {EditFileIcon}
                  </Button>
                )}
                {copyNode === null ? (
                  <Button
                    className="file-menu-button"
                    onSelect={() => {
                      onCopyNode && onCopyNode(node);
                    }}
                  >
                    {cutIcon}
                  </Button>
                ) : copyNode && copyNode.id === node.id ? null : (
                  <Button
                    className="file-menu-button"
                    onSelect={() => {
                      onPasteNode && onPasteNode(node);
                    }}
                  >
                    {PasteFileIcon}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {canEditFileName && (
        <div className="file-menu-folder-content create-folder-container">
          <UpdateFileNode node={node} onClose={onFileSaveHandler} />
        </div>
      )}

      {canShowCreateFolder && (
        <div className="file-menu-folder-content create-folder-container">
          <CreateFolderInput
            parentFolderId={node.id}
            isFile={isFile}
            onClose={onFileSaveHandler}
          />
        </div>
      )}

      {isOpen && (
        <div className="file-menu-folder-content">
          {node.children?.map((child) => {
            if (child.type === "folder") {
              return (
                <FolderNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  copyNode={copyNode}
                  onCopyNode={onCopyNode}
                  onPasteNode={onPasteNode}
                />
              );
            }
            return (
              <FileNodeTile
                key={child.id}
                node={child}
                depth={depth + 1}
                copyNode={copyNode}
                onCopyNode={onCopyNode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileNodeTile({
  node,
  depth,
  copyNode,
  onCopyNode,
}: {
  node: FileNode;
  depth: number;
  copyNode?: FileNode | null;
  onCopyNode?: (node: FileNode | null) => void;
}) {
  const nameWithoutSuffix = node.name.endsWith(".excalidraw")
    ? node.name.slice(0, -11)
    : node.name;
  const [canEditFileName, setCanEditFileName] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const {
    loadFile: getCurrentFile,
    isCurrentNodeFetching: isFileFetching,
    currentFileNode,
    deleteFileNode,
  } = useFileOptimized();

  const exitFileEdit = () => {
    setCanEditFileName(false);
  };
  return (
    <div
      style={{ marginLeft: depth * 20 }}
      className="file-node-tile"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: "flex", gap: "5px" }}>
        <button
          onClick={() => {
            getCurrentFile(node);
          }}
          className="file-node-tile-button"
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
        {isHovered && (
          <>
            <Button
              className="file-menu-button"
              onSelect={() => {
                setCanEditFileName((prev) => !prev);
              }}
            >
              {EditFileIcon}
            </Button>

            <Button
              className="file-menu-button"
              onSelect={() => {
                deleteFileNode(node.id);
              }}
            >
              {TrashIcon}
            </Button>
          </>
        )}
        {isHovered && copyNode === null && (
          <Button
            className="file-menu-button"
            onSelect={() => {
              onCopyNode && onCopyNode(node);
            }}
          >
            {cutIcon}
          </Button>
        )}
      </div>

      {canEditFileName && (
        <div className="file-menu-folder-content create-folder-container">
          <UpdateFileNode node={node} onClose={exitFileEdit} />
        </div>
      )}
    </div>
  );
}

function UpdateFileNode({
  node: fileNode,
  onClose,
}: {
  node: FileNode;
  onClose?: () => void;
}) {
  const [folderName, setFolderName] = useState(fileNode.name);
  const { updateFileNode } = useFileOptimized();
  const type = fileNode.type === "folder" ? "Folder" : "File";
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
        placeholder={`Enter ${type} name`}
        onChange={(e) => {
          setFolderName(e);
        }}
      />
      <Button
        className="file-menu-button"
        onSelect={() => {
          updateFileNode(fileNode.id, { ...fileNode, name: folderName });
          onClose && onClose();
        }}
        style={{ marginTop: "3px" }}
      >
        {SaveFileIcon}
      </Button>
    </div>
  );
}

function CreateFolderInput({
  parentFolderId,
  isFile = false,
  onClose,
}: {
  parentFolderId: string;
  isFile: boolean;
  onClose?: () => void;
}) {
  const [folderName, setFolderName] = useState("");
  const { createFolder, createExcalidrawFile } = useFileOptimized();
  const type = isFile ? "File" : "Folder";
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
        placeholder={`Enter ${type} name`}
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
          onClose && onClose();
        }}
        style={{ marginTop: "3px" }}
      >
        {SaveFileIcon}
      </Button>
    </div>
  );
}
