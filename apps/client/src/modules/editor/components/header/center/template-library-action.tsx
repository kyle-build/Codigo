import { observer } from "mobx-react-lite";
import { EditorTemplateLibraryTrigger } from "@/modules/editor/components/template/editor-template-library-trigger";

function TemplateLibraryAction() {
  return <EditorTemplateLibraryTrigger />;
}

const TemplateLibraryActionComponent = observer(TemplateLibraryAction);

export { TemplateLibraryActionComponent as TemplateLibraryAction };
