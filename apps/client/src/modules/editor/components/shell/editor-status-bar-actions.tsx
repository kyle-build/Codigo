import { BookOutlined, HistoryOutlined, QuestionCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import { Button, List, Modal, Tag, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EDITOR_COMPONENT_SHORTCUTS } from "@/modules/editor/hooks/use-editor-component-key-press";
import { useEditorComponents } from "@/modules/editor/hooks/use-editor-components";

const { Text } = Typography;

function ShortcutKeys({ combos }: { combos: string[][] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {combos.map((combo, comboIndex) => (
        <div key={`${combo.join("+")}_${comboIndex}`} className="flex items-center gap-1">
          {combo.map((key, index) => (
            <div key={`${key}_${index}`} className="flex items-center gap-1">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700 shadow-sm">
                {key}
              </span>
              {index < combo.length - 1 ? (
                <span className="text-slate-400">+</span>
              ) : null}
            </div>
          ))}
          {comboIndex < combos.length - 1 ? <span className="text-slate-400">/</span> : null}
        </div>
      ))}
    </div>
  );
}

function ShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const list = useMemo(() => {
    return [
      ...EDITOR_COMPONENT_SHORTCUTS.map((item) => ({
        group: "组件",
        ...item,
      })),
      { group: "画布", keys: [["Esc"]], label: "取消拖拽落点高亮" },
      {
        group: "画布",
        keys: [["↑"], ["↓"], ["←"], ["→"]],
        label: "平移画布视口（Shift 加速）",
      },
    ];
  }, []);

  return (
    <Modal
      open={open}
      title="快捷键"
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose}>知道了</Button>}
      width={720}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Text className="text-xs text-slate-600">
            仅在焦点不处于输入框/弹窗时触发画布快捷键。
          </Text>
        </div>
        <div className="space-y-2">
          {["组件", "画布"].map((group) => (
            <div key={group} className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <Text strong className="text-sm text-slate-800">
                  {group}
                </Text>
              </div>
              <div className="divide-y divide-slate-100">
                {list
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <div key={`${group}_${item.label}`} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-[260px] flex-shrink-0">
                        <ShortcutKeys combos={item.keys} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text className="text-sm text-slate-700">{item.label}</Text>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

const ShortcutsModalComponent = observer(ShortcutsModal);

function OperationHistoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { operationHistory, rollbackToHistory } = useEditorComponents();

  return (
    <Modal
      open={open}
      title="操作记录"
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose}>关闭</Button>}
      width={720}
      destroyOnHidden
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Text className="text-xs text-slate-600">
            仅记录可回滚的关键操作（新增/移动/删除/修改/样式/页面/AI 替换）。点击“回滚”会直接跳转到指定状态。
          </Text>
        </div>
        <List
          bordered
          dataSource={operationHistory.entries}
          renderItem={(item, index) => {
            const isCurrent = index === operationHistory.cursor;
            return (
              <List.Item
                className={isCurrent ? "bg-emerald-50" : ""}
                actions={[
                  <Button
                    key="rollback"
                    size="small"
                    icon={<RollbackOutlined />}
                    disabled={isCurrent}
                    onClick={() => rollbackToHistory(index)}
                  >
                    回滚
                  </Button>,
                ]}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-10 flex-shrink-0 text-center font-mono text-xs text-slate-500">
                    {index}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Text className="truncate">{item.label}</Text>
                      {isCurrent ? <Tag color="green" className="!m-0">当前</Tag> : null}
                    </div>
                    <Text className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );
}

const OperationHistoryModalComponent = observer(OperationHistoryModal);

function EditorStatusBarActions() {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-1.5 hover:bg-white/10 px-1">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-[var(--ide-statusbar-text)]"
          onClick={() => setIsShortcutsOpen(true)}
        >
          <QuestionCircleOutlined />
          <span>快捷键</span>
        </button>
      </div>
      <div className="flex items-center gap-1.5 hover:bg-white/10 px-1">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-[var(--ide-statusbar-text)]"
          onClick={() => setIsHistoryOpen(true)}
        >
          <HistoryOutlined />
          <span>操作记录</span>
        </button>
      </div>
      <div className="flex items-center gap-1.5 hover:bg-white/10 px-1">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-[var(--ide-statusbar-text)]"
          onClick={() => navigate("/doc")}
        >
          <BookOutlined />
          <span>使用手册</span>
        </button>
      </div>

      <ShortcutsModalComponent
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <OperationHistoryModalComponent
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}

const EditorStatusBarActionsComponent = observer(EditorStatusBarActions);

export { EditorStatusBarActionsComponent as EditorStatusBarActions };
