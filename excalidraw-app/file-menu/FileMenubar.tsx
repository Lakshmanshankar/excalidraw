import React, { useState } from "react";
import DropdownMenu from "../../packages/excalidraw/components/dropdownMenu/DropdownMenu";
import { useTunnels } from "../../packages/excalidraw/context/tunnels";
import { FolderIcon } from "../../packages/excalidraw/components/icons";
import SignIn from "./SignIn";
import Tree from "./Tree";
import "./FileMenubar.scss";
// import { FileMenuProvider } from "./hooks/useFile";
import { FileProviderOptimized } from "./hooks/useFileOptimized";
import { type ExcalidrawImperativeAPI } from "../../packages/excalidraw/types";

export const FileTree: React.FC<{
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}> = React.memo(({ excalidrawAPI }) => {
  const [open, setOpen] = useState(false);
  const { FileTreeTunnel } = useTunnels();

  if (excalidrawAPI === null) {
    return <div>No Excalidraw API</div>;
  }
  return (
    <FileTreeTunnel.In>
      <DropdownMenu open={open}>
        <DropdownMenu.Trigger onToggle={() => setOpen(!open)}>
          {FolderIcon}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content onClickOutside={() => setOpen(false)}>
          <div className="file-tree-container">
            {/* <FileMenuProvider excalidrawAPI={excalidrawAPI}> */}
            <FileProviderOptimized excalidrawAPI={excalidrawAPI}>
              <Tree />
            </FileProviderOptimized>
            {/* </FileMenuProvider> */}
          </div>
          <SignIn />
        </DropdownMenu.Content>
      </DropdownMenu>
    </FileTreeTunnel.In>
  );
});
