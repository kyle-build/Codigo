import { useState } from "react";
import { Button, Input } from "antd";
import { observer } from "mobx-react-lite";
import { useEditorComponents } from "@/modules/editor/hooks";
import SidebarLayoutSectionRow from "./sidebar-layout-section-row";

/**
 * 渲染单页面侧栏布局的快捷配置工具。
 */
function SidebarLayoutTools() {
  const [nextLabel, setNextLabel] = useState("");
  const {
    appendSidebarSection,
    getSidebarSections,
    moveSidebarSection,
    removeSidebarSection,
    store,
    syncSidebarPanels,
    updateSidebarSectionLabel,
  } = useEditorComponents();
  const currentLayoutId = store.currentCompConfig;
  const sections = currentLayoutId ? getSidebarSections(currentLayoutId) : [];

  /**
   * 新增一个导航项，并同步创建右侧内容容器。
   */
  const handleAppend = () => {
    if (!store.currentCompConfig) {
      return;
    }

    const appended = appendSidebarSection(store.currentCompConfig, nextLabel);
    if (appended) {
      setNextLabel("");
    }
  };

  /**
   * 根据当前左侧按钮列表补齐右侧内容区。
   */
  const handleSync = () => {
    if (!currentLayoutId) {
      return;
    }

    syncSidebarPanels(currentLayoutId);
  };

  /**
   * 更新指定导航项名称。
   */
  const handleRename = (stateValue: string, label: string) => {
    if (!currentLayoutId) {
      return;
    }

    updateSidebarSectionLabel(currentLayoutId, stateValue, label);
  };

  /**
   * 上移指定导航项。
   */
  const handleMoveUp = (stateValue: string) => {
    if (!currentLayoutId) {
      return;
    }

    moveSidebarSection(currentLayoutId, stateValue, "up");
  };

  /**
   * 下移指定导航项。
   */
  const handleMoveDown = (stateValue: string) => {
    if (!currentLayoutId) {
      return;
    }

    moveSidebarSection(currentLayoutId, stateValue, "down");
  };

  /**
   * 删除指定导航项。
   */
  const handleRemove = (stateValue: string) => {
    if (!currentLayoutId) {
      return;
    }

    removeSidebarSection(currentLayoutId, stateValue);
  };

  return (
    <section className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 p-3.5">
      <div className="text-[13px] font-semibold text-slate-900">单页侧栏配置</div>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        在当前双栏布局内新增导航按钮，并同步生成右侧内容容器。
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        <Input
          value={nextLabel}
          placeholder="输入新导航名称，例如：订单信息"
          onChange={(event) => setNextLabel(event.target.value)}
        />
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          <Button type="primary" className="w-full" onClick={handleAppend}>
            新增导航项
          </Button>
          <Button className="w-full" onClick={handleSync}>
            同步内容区
          </Button>
        </div>

        {sections.length ? (
          <div className="space-y-2">
            {sections.map((item, index) => (
              <SidebarLayoutSectionRow
                key={item.stateValue}
                item={item}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                onMoveDown={handleMoveDown}
                onMoveUp={handleMoveUp}
                onRemove={handleRemove}
                onRename={handleRename}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const SidebarLayoutToolsComponent = observer(SidebarLayoutTools);

export default SidebarLayoutToolsComponent;
