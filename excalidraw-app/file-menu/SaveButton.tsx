import { Button } from "../../packages/excalidraw/components/Button";
import { SaveFileIcon } from "../../packages/excalidraw/components/icons";
import { useFileOptimized } from "./hooks/useFileOptimized";

export default function SaveButton() {
  const { saveCurrentFile } = useFileOptimized();
  return (
    <Button
      onSelect={() => {
        saveCurrentFile();
      }}
      className="file-menu-save-button"
    >
      {SaveFileIcon}
    </Button>
  );
}
