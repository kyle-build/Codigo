import { Input, InputNumber, Space } from "antd";
import { observer } from "mobx-react-lite";
import { useEditorPage, useEditorPermission } from "@/modules/editor/hooks";

function CanvasSettings() {
  const { store, setCanvasSize } = useEditorPage();
  const { ensurePermission } = useEditorPermission();

  return (
    <div className="hidden items-center gap-2 xl:flex">
      {store.deviceType === "pc" && (
        <Space size="small">
          <Space.Compact size="small">
            <InputNumber
              size="small"
              value={store.canvasWidth}
              onChange={(value) => {
                if (!ensurePermission("edit_content", "当前角色不能修改画布设置")) {
                  return;
                }

                setCanvasSize(value || 1024, store.canvasHeight);
              }}
              className="w-[76px]"
              controls={false}
            />
            <Input
              size="small"
              readOnly
              tabIndex={-1}
              value="W"
              className="w-8 !rounded-l-none !px-0 !text-center !text-[var(--ide-text-muted)]"
            />
          </Space.Compact>
          <Space.Compact size="small">
            <InputNumber
              size="small"
              value={store.canvasHeight}
              onChange={(value) => {
                if (!ensurePermission("edit_content", "当前角色不能修改画布设置")) {
                  return;
                }

                setCanvasSize(store.canvasWidth, value || 768);
              }}
              className="w-[76px]"
              controls={false}
            />
            <Input
              size="small"
              readOnly
              tabIndex={-1}
              value="H"
              className="w-8 !rounded-l-none !px-0 !text-center !text-[var(--ide-text-muted)]"
            />
          </Space.Compact>
        </Space>
      )}
    </div>
  );
}

const CanvasSettingsComponent = observer(CanvasSettings);

export { CanvasSettingsComponent as CanvasSettings };
