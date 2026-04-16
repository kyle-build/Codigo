import { observer } from "mobx-react-lite";
import { CanvasEditActions } from "./center/CanvasEditActions";
import { CanvasSettings } from "./center/CanvasSettings";
import { DeviceModeSwitch } from "./center/DeviceModeSwitch";
import { EditorModeButton } from "./center/EditorModeButton";
import { PreviewDraftActions } from "./center/PreviewDraftActions";
import { PublishButton } from "./center/PublishButton";
import { TemplateLibraryAction } from "./center/TemplateLibraryAction";
import { VersionHistoryAction } from "./center/VersionHistoryAction";

const Center = observer(() => {
  return (
    <div className="flex items-center gap-2 bg-[#2d2d2d] px-1 py-0.5">
      <DeviceModeSwitch />
      <div className="hidden h-4 w-px bg-[#3c3c3c] xl:block" />
      <CanvasSettings />
      <div className="hidden h-4 w-px bg-[#3c3c3c] lg:block" />
      <div className="flex items-center gap-0.5">
        <TemplateLibraryAction />
        <VersionHistoryAction />
        <PreviewDraftActions />
        <CanvasEditActions />
      </div>
      <div className="hidden h-4 w-px bg-[#3c3c3c] sm:block" />
      <EditorModeButton />
      <PublishButton />
    </div>
  );
});

export default Center;
