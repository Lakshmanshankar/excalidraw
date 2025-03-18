import { Button } from "../../packages/excalidraw/components/Button";
import { SaveFileIcon } from "../../packages/excalidraw/components/icons";
import Spinner from "../../packages/excalidraw/components/Spinner";
import { useFileOptimized } from "./hooks/useFileOptimized";

export default function SaveButton() {
  const { isSaving, saveCurrentFile } = useFileOptimized();
  return (
    <Button
      onSelect={() => {
        saveCurrentFile();
      }}
      className="file-menu-save-button"
    >
      {isSaving ? <Spinner /> : SaveFileIcon}
    </Button>
  );
}
