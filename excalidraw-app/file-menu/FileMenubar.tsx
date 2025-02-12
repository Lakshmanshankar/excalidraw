import React, { useState } from "react";
import DropdownMenu from "../../packages/excalidraw/components/dropdownMenu/DropdownMenu";
import { useTunnels } from "../../packages/excalidraw/context/tunnels";
import { FolderIcon } from "../../packages/excalidraw/components/icons";
import SignIn from "./SignIn";
import Tree from "./Tree";
import "./FileMenubar.scss";
import { FileMenuProvider } from "./hooks/useFile";

export const FileTree: React.FC<{}> = React.memo(() => {
  const [open, setOpen] = useState(false);
  const { FileTreeTunnel } = useTunnels();
  return (
    <FileTreeTunnel.In>
      <DropdownMenu open={open}>
        <DropdownMenu.Trigger onToggle={() => setOpen(!open)}>
          {FolderIcon}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content onClickOutside={() => setOpen(false)}>
          <div className="file-tree-container">
            <FileMenuProvider>
              <Tree />
            </FileMenuProvider>
          </div>
          <SignIn />
        </DropdownMenu.Content>
      </DropdownMenu>
    </FileTreeTunnel.In>
  );
});
