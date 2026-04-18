import { useKeyPress } from "ahooks";
import { message } from "antd";
import { useEditorComponents } from "./useEditorComponents";

/**
 * 注册 editor 域内的组件快捷键。
 */
export function useEditorComponentKeyPress() {
  const {
    undo,
    redo,
    moveUpComponent,
    moveDownComponent,
    pasteCopyedComponent,
    copyCurrentComponent,
    removeCurrentComponent,
    getCurrentComponentConfig,
    getCurrentComponentIndex,
  } = useEditorComponents();

  /**
   * 判断当前焦点是否允许触发画布快捷键。
   */
  function canTriggerShortcut() {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      return true;
    }

    if (!(activeElement instanceof HTMLElement)) {
      return true;
    }

    const isEditing =
      Boolean(
        activeElement.closest(
          'input, textarea, select, option, [contenteditable=""], [contenteditable="true"], [role="textbox"]',
        ),
      ) || activeElement.isContentEditable;
    if (isEditing) {
      return false;
    }

    const isInOverlay = Boolean(
      activeElement.closest(
        ".ant-modal, .ant-dropdown, .ant-popover, .ant-select-dropdown",
      ),
    );
    if (isInOverlay) {
      return false;
    }

    return true;
  }

  /**
   * 校验当前是否存在选中组件。
   */
  function validateComponent() {
    const isActive = canTriggerShortcut();
    const isCompExist = getCurrentComponentConfig.get() !== null;

    if (!isActive) {
      return false;
    }

    if (!isCompExist) {
      message.warning("请先选择组件");
      return false;
    }
    return isActive;
  }

  /**
   * 获取当前选中组件在同级中的有效序号。
   */
  function getValidatedComponentIndex() {
    if (!validateComponent()) {
      return null;
    }

    const currentIndex = getCurrentComponentIndex.get();
    return currentIndex >= 0 ? currentIndex : null;
  }

  useKeyPress("uparrow", () => {
    const currentIndex = getValidatedComponentIndex();
    if (currentIndex === null) return;
    moveUpComponent(currentIndex);
  });

  useKeyPress("downarrow", () => {
    const currentIndex = getValidatedComponentIndex();
    if (currentIndex === null) return;
    moveDownComponent(currentIndex);
  });

  useKeyPress(["delete", "backspace"], () => {
    if (!validateComponent()) return;
    removeCurrentComponent();
  });

  useKeyPress(["ctrl.c", "meta.c"], () => {
    if (!validateComponent()) return;
    copyCurrentComponent();
  });

  useKeyPress(["ctrl.v", "meta.v"], () => {
    if (!validateComponent()) return;
    pasteCopyedComponent();
  });

  useKeyPress(["ctrl.shift.z", "meta.shift.z"], () => {
    redo();
  });

  useKeyPress(
    ["ctrl.z", "meta.z"],
    () => {
      if (!validateComponent()) return;
      undo();
    },
    {
      exactMatch: true,
    },
  );
}
