import { observer } from "mobx-react-lite";
import { CanvasEditActions } from "./center/canvas-edit-actions";
import { CanvasSettings } from "./center/canvas-settings";
import { DeviceModeSwitch } from "./center/device-mode-switch";
import { EditorModeButton } from "./center/editor-mode-button";
import { PreviewDraftActions } from "./center/preview-draft-actions";
import { PublishButton } from "./center/publish-button";
import { TemplateLibraryAction } from "./center/template-library-action";
import { VersionHistoryAction } from "./center/version-history-action";

function Center() {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] px-1 py-0.5 shadow-[var(--ide-panel-shadow)]">
      <DeviceModeSwitch />
      <div className="hidden h-4 w-px bg-[var(--ide-border)] xl:block" />
      <CanvasSettings />
      <div className="hidden h-4 w-px bg-[var(--ide-border)] lg:block" />
      <div className="flex items-center gap-0.5">
        <TemplateLibraryAction />
        <VersionHistoryAction />
        <PreviewDraftActions />
        <CanvasEditActions />
      </div>
      <div className="hidden h-4 w-px bg-[var(--ide-border)] sm:block" />
      <EditorModeButton />
      <PublishButton />
    </div>
  );
}

const CenterComponent = observer(Center);

export default CenterComponent;
