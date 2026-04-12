import { observer } from "mobx-react-lite";
import { EditorTemplateLibraryTrigger } from "@/modules/editor/components/template/EditorTemplateLibraryTrigger";

export const TemplateLibraryAction = observer(function TemplateLibraryAction() {
  return <EditorTemplateLibraryTrigger />;
});
