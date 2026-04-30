import {
  DeleteOutlined,
  RedoOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useEditorComponents, useEditorPage, useEditorPermission } from "@/modules/editor/hooks";

function CanvasEditActions() {
  const { store } = useEditorPage();
  const {
    clearActivePageCanvas,
    hasRedo,
    hasUndo,
    redo,
    store: storeComponents,
    undo,
  } = useEditorComponents();
  const { can } = useEditorPermission();
  const disableClear =
    store.editorMode !== "visual" ||
    !storeComponents.sortableCompConfig.length ||
    !can("edit_structure");

  return (
    <>
      <Popconfirm
        title="确定要清空当前画布吗？"
        description="会移除当前页面中的全部组件，但不会删除页面本身"
        onConfirm={clearActivePageCanvas}
        okText="清空"
        cancelText="取消"
        disabled={disableClear}
      >
        <Button
          danger
          type="text"
          className="!h-7 !rounded-lg !px-2 !text-[11px]"
          disabled={disableClear}
        >
          <DeleteOutlined /> 清空
        </Button>
      </Popconfirm>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-1.5 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={undo}
        disabled={!hasUndo || !can("edit_content")}
      >
        <UndoOutlined />
      </Button>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-1.5 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={redo}
        disabled={!hasRedo || !can("edit_content")}
      >
        <RedoOutlined />
      </Button>
    </>
  );
}

const CanvasEditActionsComponent = observer(CanvasEditActions);

export { CanvasEditActionsComponent as CanvasEditActions };
