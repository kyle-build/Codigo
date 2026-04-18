import { useState } from "react";
import { AppstoreOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import type { TemplatePreset } from "@/modules/templateCenter/types/templates";
import { TemplateLibraryModal } from "@/modules/templateCenter/components/TemplateLibraryModal";
import {
  useEditorComponents,
  useEditorPermission,
} from "@/modules/editor/hooks";

interface EditorTemplateLibraryTriggerProps {
  variant?: "toolbar" | "empty";
}

export function EditorTemplateLibraryTrigger({
  variant = "toolbar",
}: EditorTemplateLibraryTriggerProps) {
  const [open, setOpen] = useState(false);
  const { applyTemplateToWorkspace, store } = useEditorComponents();
  const { can } = useEditorPermission();
  const canUseTemplate = can("edit_structure");
  const hasCanvasContent = store.sortableCompConfig.length > 0;

  /**
   * 在必要时确认覆盖后，将模板应用到当前工作区。
   */
  function handleUseTemplate(template: TemplatePreset) {
    if (!canUseTemplate) {
      return;
    }

    const applyTemplate = () => {
      const applied = applyTemplateToWorkspace(template);
      if (applied) {
        setOpen(false);
      }
    };

    if (!hasCanvasContent) {
      applyTemplate();
      return;
    }

    Modal.confirm({
      title: `使用“${template.name}”模板？`,
      content: "会替换当前工作区内的页面集合，并生成一套新的多页面后台模板结构。",
      okText: "覆盖并应用",
      cancelText: "取消",
      onOk: applyTemplate,
    });
  }

  return (
    <>
      <Button
        type={variant === "empty" ? "default" : "text"}
        icon={<AppstoreOutlined />}
        className={
          variant === "empty"
            ? "!h-10 !rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !px-4 !text-[var(--ide-text)] hover:!border-[var(--ide-accent)] hover:!bg-[var(--ide-hover)]"
            : "!h-7 !rounded-sm !px-2 !text-[11px] !text-[var(--ide-text-muted)] hover:!bg-[var(--ide-hover)] hover:!text-[var(--ide-text)]"
        }
        onClick={() => setOpen(true)}
      >
        模板
      </Button>
      <TemplateLibraryModal
        canUseTemplate={canUseTemplate}
        open={open}
        onClose={() => setOpen(false)}
        onUse={handleUseTemplate}
      />
    </>
  );
}
