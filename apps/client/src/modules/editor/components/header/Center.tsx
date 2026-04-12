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
    <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-2 py-1 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <DeviceModeSwitch />
      <div className="hidden h-5 w-px bg-slate-200 xl:block" />
      <CanvasSettings />
      <div className="hidden h-5 w-px bg-slate-200 lg:block" />
      <div className="flex items-center gap-1">
        <TemplateLibraryAction />
        <VersionHistoryAction />
        <PreviewDraftActions />
        <CanvasEditActions />
      </div>
      <EditorModeButton />
      <PublishButton />
    </div>
  );
});

export default Center;
