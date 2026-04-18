import type { FC } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { getComponentContainerMeta } from "@codigo/materials";
import {
  AppstoreOutlined,
  BorderOutlined,
  DragOutlined,
  NodeIndexOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
import type { ComponentNode } from "@codigo/schema";
import type { ReactNode } from "react";
import {
  findEditorComponent,
  getComponentPropsByType,
} from "@/modules/editor/registry/components";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { useEditorComponents } from "@/modules/editor/hooks";
import { useEditorPage } from "@/modules/editor/hooks";
import { Collapse, Empty, Form, InputNumber } from "antd";

const { Panel } = Collapse;

export const EditorOutlineTree = observer(function EditorOutlineTree() {
  const {
    getComponentTree,
    getCurrentComponentConfig,
    setCurrentComponent,
  } = useEditorComponents();
  const currentConfigId = getCurrentComponentConfig.get()?.id ?? null;
  const componentTree = getComponentTree.get();

  function renderTree(node: ComponentNode, depth = 0): ReactNode {
    if (node.type === "container") {
      return node.children?.map((child) => renderTree(child, depth)) ?? null;
    }
    const isActive = node.id === currentConfigId;
    const componentMeta = findEditorComponent(node.type);

    return (
      <div
        key={node.id}
        className="relative"
        style={{ marginLeft: depth * 12 }}
      >
        {depth > 0 ? (
          <span className="pointer-events-none absolute -left-2 top-0 h-full w-px bg-[var(--ide-border)]" />
        ) : null}
        <button
          type="button"
          onClick={() => setCurrentComponent(node.id)}
          className={`mb-0.5 flex w-full items-center gap-2 px-2 py-1 text-left transition-colors ${
            isActive
              ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
              : "text-[var(--ide-text)] hover:bg-[var(--ide-hover)]"
          }`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] text-[var(--ide-text-muted)]">
            <NodeIndexOutlined />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px]">
              {node.name || componentMeta?.name || node.type}
            </span>
          </span>
          <span className="text-[10px] opacity-40 font-mono">
            {node.slot ?? "root"}
          </span>
        </button>
        {node.children?.map((child) => renderTree(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--ide-sidebar-bg)]">
      <div className="border-b border-[var(--ide-border)] px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
              Outline Tree
            </div>
          </div>
          <span className="text-[10px] text-[var(--ide-text-muted)]">
            {componentTree.length} Nodes
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
        {componentTree.length ? (
          <div className="space-y-0">
            {componentTree.map((node) => renderTree(node))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] py-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-[var(--ide-text-muted)]">No Components</span>}
            />
          </div>
        )}
      </div>
    </div>
  );
});

const ComponentFields: FC<{ store: TEditorComponentsStore }> = observer(
  ({ store }) => {
    if (!store.currentCompConfig)
      return (
        <div className="p-4">
          <div className="border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--ide-active)] text-xl text-[var(--ide-text-muted)]">
              <AppstoreOutlined />
            </div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--ide-text)]">
              暂未选中组件
            </div>
            <div className="mb-4 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
              在画布中点击组件进行配置
            </div>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={false}
              className="!mb-0 !mt-2"
            />
          </div>
        </div>
      );

    const {
      getCurrentComponentConfig,
      getAvailableSlots,
      updateCurrentComponentStyles,
    } = useEditorComponents();
    const { store: pageStore } = useEditorPage();
    const config = getCurrentComponentConfig.get();

    if (!config) return null;

    const ComponentProps = getComponentPropsByType(config.type);
    const styles = config.styles || {};
    const containerMeta = getComponentContainerMeta(config.type);
    const currentSlots = getAvailableSlots(config.type);
    const childrenCount = config.childIds?.length ?? 0;

    const handleStyleChange = (_changedValues: any, allValues: any) => {
      const formattedStyles = { ...allValues };
      const pxKeys = new Set([
        "left",
        "top",
        "width",
        "height",
        "marginTop",
        "marginBottom",
        "marginLeft",
        "marginRight",
        "paddingTop",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
      ]);
      Object.keys(formattedStyles).forEach((key) => {
        if (typeof formattedStyles[key] === "number" && pxKeys.has(key)) {
          formattedStyles[key] = `${formattedStyles[key]}px`;
        }
      });
      updateCurrentComponentStyles(formattedStyles);
    };

    const initialValues: Record<string, any> = { ...styles };
    Object.keys(initialValues).forEach((key) => {
      if (
        typeof initialValues[key] === "string" &&
        initialValues[key].endsWith("px")
      ) {
        initialValues[key] = parseFloat(initialValues[key]);
      }
    });

    const isGridRoot = pageStore.layoutMode === "grid" && !config.parentId;

    const styleSections = [
      isGridRoot
        ? {
            key: "position",
            title: "栅格位置",
            icon: <DragOutlined />,
            fields: [
              { label: "列", name: "gridColumnStart", placeholder: "1" },
              { label: "行", name: "gridRowStart", placeholder: "1" },
              { label: "列跨度", name: "gridColumnSpan", placeholder: "1" },
              { label: "行跨度", name: "gridRowSpan", placeholder: "1" },
            ],
          }
        : {
            key: "position",
            title: "位置",
            icon: <DragOutlined />,
            fields: [
              { label: "X", name: "left", placeholder: "px" },
              { label: "Y", name: "top", placeholder: "px" },
            ],
          },
      ...(isGridRoot
        ? []
        : [
            {
              key: "size",
              title: "尺寸",
              icon: <BorderOutlined />,
              fields: [
                { label: "W", name: "width", placeholder: "100%" },
                { label: "H", name: "height", placeholder: "auto" },
              ],
            },
          ]),
      {
        key: "margin",
        title: "外间距",
        icon: <ShrinkOutlined />,
        fields: [
          { label: "T", name: "marginTop", placeholder: "px" },
          { label: "B", name: "marginBottom", placeholder: "px" },
          { label: "L", name: "marginLeft", placeholder: "px" },
          { label: "R", name: "marginRight", placeholder: "px" },
        ],
      },
      {
        key: "padding",
        title: "内间距",
        icon: <AppstoreOutlined />,
        fields: [
          { label: "T", name: "paddingTop", placeholder: "px" },
          { label: "B", name: "paddingBottom", placeholder: "px" },
          { label: "L", name: "paddingLeft", placeholder: "px" },
          { label: "R", name: "paddingRight", placeholder: "px" },
        ],
      },
    ];

    return (
      <div className="component-fields-container space-y-2 px-3 pb-8">
        <div className="border-b border-[var(--ide-border)] py-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-accent)]">
              Active Component
            </span>
            <span className="text-[10px] font-mono text-[var(--ide-text-muted)]">
              {config.id.slice(-6)}
            </span>
          </div>
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            {config.type}
          </div>
        </div>

        <Collapse
          defaultActiveKey={["props", "structure", "styles"]}
          ghost
          expandIconPosition="end"
          className="[&_.ant-collapse-item]:mb-1 [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-[var(--ide-border)] [&_.ant-collapse-header]:!px-1 [&_.ant-collapse-header]:!py-2 [&_.ant-collapse-content-box]:!px-1 [&_.ant-collapse-content-box]:!pb-3 [&_.ant-collapse-content-box]:!pt-1"
        >
          <Panel
            header={
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                组件属性
              </div>
            }
            key="props"
          >
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
              {ComponentProps ? (
                <ComponentProps {...toJS(config.props)} id={config.id} />
              ) : (
                <div className="py-4 text-center text-[11px] text-[var(--ide-text-muted)]">
                  无属性配置
                </div>
              )}
            </div>
          </Panel>

          <Panel
            header={
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                结构与插槽
              </div>
            }
            key="structure"
          >
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
                  <div className="mb-1 text-[10px] text-[var(--ide-text-muted)]">插槽</div>
                  <div className="text-[12px] font-medium text-[var(--ide-text)]">
                    {config.slot ?? "root"}
                  </div>
                </div>
                <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
                  <div className="mb-1 text-[10px] text-[var(--ide-text-muted)]">子节点</div>
                  <div className="text-[12px] font-medium text-[var(--ide-text)]">
                    {childrenCount}
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[var(--ide-text)]">
                  <NodeIndexOutlined className="text-[var(--ide-accent)]" />
                  容器信息
                </div>
                <div className="space-y-1 text-[11px] text-[var(--ide-text-muted)]">
                  <div>类型：{containerMeta.isContainer ? "容器" : "普通"}</div>
                  <div>
                    插槽：{containerMeta.isContainer
                      ? currentSlots.map((item) => item.name).join("/")
                      : "无"}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            header={
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                布局与间距
              </div>
            }
            key="styles"
          >
            <Form
              layout="vertical"
              initialValues={initialValues}
              onValuesChange={handleStyleChange}
              className="[&_.ant-form-item]:mb-2 [&_.ant-form-item-label>label]:text-[11px] [&_.ant-form-item-label>label]:text-[var(--ide-text-muted)] [&_.ant-input-number]:!h-7 [&_.ant-input-number]:!w-full [&_.ant-input-number]:!rounded-sm [&_.ant-input-number]:!border-[var(--ide-control-border)] [&_.ant-input-number]:!bg-[var(--ide-control-bg)] [&_.ant-input-number-input]:!text-[var(--ide-text)]"
            >
              <div className="space-y-1.5">
                {styleSections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[var(--ide-accent)]">{section.icon}</span>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                        {section.title}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {section.fields.map((field) => (
                        <Form.Item
                          key={String(field.name)}
                          label={field.label}
                          name={field.name}
                          className="!mb-0"
                        >
                          <InputNumber placeholder={field.placeholder} size="small" />
                        </Form.Item>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Form>
          </Panel>
        </Collapse>
      </div>
    );
  },
);

export default ComponentFields;
