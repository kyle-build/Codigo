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
import type { ActionConfig, ComponentNode } from "@codigo/schema";
import type { ReactNode } from "react";
import {
  findEditorComponent,
  getComponentPropsByType,
} from "@/modules/editor/registry/components";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { useEditorComponents } from "@/modules/editor/hooks";
import { useEditorPage } from "@/modules/editor/hooks";
import { Button, Collapse, Empty, Form, Input, InputNumber, Select } from "antd";

const { Panel } = Collapse;

const actionTypeOptions = [
  { label: "设置状态", value: "setState" },
  { label: "页面跳转", value: "navigate" },
  { label: "打开链接", value: "openUrl" },
  { label: "滚动定位", value: "scrollTo" },
  { label: "提示消息", value: "toast" },
  { label: "确认弹窗", value: "confirm" },
  { label: "条件判断", value: "when" },
  { label: "请求接口", value: "request" },
] as const;

function createDefaultAction(type: ActionConfig["type"]): ActionConfig {
  switch (type) {
    case "navigate":
      return { type, path: "page:home" };
    case "openUrl":
      return { type, url: "https://example.com", target: "_blank" };
    case "scrollTo":
      return { type, targetId: "section-overview" };
    case "toast":
      return { type, message: "操作成功", variant: "success" };
    case "confirm":
      return { type, message: "确认执行该操作？" };
    case "when":
      return { type, key: "activePanel", op: "eq", value: "overview" };
    case "request":
      return {
        type,
        method: "GET",
        url: "/api/health",
        saveToStateKey: "lastResponse",
      };
    default:
      return { type: "setState", key: "activePanel", value: "overview" };
  }
}

export const EditorOutlineTree = observer(function EditorOutlineTree() {
  const {
    getComponentTree,
    getCurrentComponentConfig,
    setCurrentComponent,
  } = useEditorComponents();
  const currentConfigId = getCurrentComponentConfig.get()?.id ?? null;
  const componentTree = getComponentTree.get();

  function renderTree(node: ComponentNode, depth = 0): ReactNode {
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
      getPages,
      updateCurrentComponentEvents,
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
    const eventActions = (toJS(config.events?.onClick) ?? []) as ActionConfig[];
    const pageOptions = getPages.get().map((page) => ({
      label: `${page.name} · page:${page.path}`,
      value: `page:${page.path}`,
    }));

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

    const updateEventActions = (actions: ActionConfig[]) => {
      updateCurrentComponentEvents("onClick", actions);
    };

    const addEventAction = (type: ActionConfig["type"]) => {
      updateEventActions([...eventActions, createDefaultAction(type)]);
    };

    const updateEventAction = (
      index: number,
      nextAction: Partial<Record<string, unknown>>,
    ) => {
      updateEventActions(
        eventActions.map((action, actionIndex) => {
          if (actionIndex !== index) return action;
          return { ...action, ...nextAction } as ActionConfig;
        }),
      );
    };

    const resetEventActionType = (
      index: number,
      nextType: ActionConfig["type"],
    ) => {
      updateEventActions(
        eventActions.map((action, actionIndex) => {
          if (actionIndex !== index) return action;
          return createDefaultAction(nextType);
        }),
      );
    };

    const removeEventAction = (index: number) => {
      updateEventActions(
        eventActions.filter((_, actionIndex) => actionIndex !== index),
      );
    };

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
          defaultActiveKey={["props", "events", "structure", "styles"]}
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
                事件链路（Flow）
              </div>
            }
            key="events"
          >
            <div className="space-y-2">
              <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
                <div className="flex flex-wrap gap-1">
                  {actionTypeOptions.map((item) => (
                    <Button
                      key={item.value}
                      size="small"
                      onClick={() => addEventAction(item.value)}
                      className="!bg-[var(--ide-control-bg)] !text-[11px] !text-[var(--ide-text)] !border-[var(--ide-control-border)] hover:!bg-[var(--ide-active)]"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              {eventActions.length ? (
                eventActions.map((action, index) => (
                  <div
                    key={`${action.type}-${index}`}
                    className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[var(--ide-accent)]">
                        #{index + 1}
                      </span>
                      <Select
                        value={action.type}
                        size="small"
                        options={actionTypeOptions as unknown as Array<{
                          label: string;
                          value: ActionConfig["type"];
                        }>}
                        onChange={(value) => resetEventActionType(index, value)}
                        className="flex-1"
                      />
                      <Button
                        size="small"
                        danger
                        type="text"
                        onClick={() => removeEventAction(index)}
                        className="!p-0"
                      >
                        删除
                      </Button>
                    </div>

                    {action.type === "setState" ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input
                          value={action.key}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, {
                              key: event.target.value,
                            })
                          }
                          placeholder="键"
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                        <Input
                          value={String(action.value ?? "")}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, {
                              value: event.target.value,
                            })
                          }
                          placeholder="值"
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                      </div>
                    ) : null}

                    {action.type === "navigate" ? (
                      <div className="space-y-1.5">
                        <Select
                          value={
                            pageOptions.some((item) => item.value === action.path)
                              ? action.path
                              : undefined
                          }
                          size="small"
                          options={pageOptions}
                          allowClear
                          placeholder="选择页面"
                          onChange={(value) =>
                            updateEventAction(index, {
                              path: value || action.path,
                            })
                          }
                          className="w-full"
                        />
                        <Input
                          value={action.path}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, {
                              path: event.target.value,
                            })
                          }
                          placeholder="路径"
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                      </div>
                    ) : null}

                    {action.type === "openUrl" ? (
                      <div className="grid grid-cols-1 gap-1.5">
                        <Input
                          value={action.url}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, {
                              url: event.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                        <Select
                          value={action.target ?? "_blank"}
                          size="small"
                          options={[
                            { label: "新窗口", value: "_blank" },
                            { label: "当前窗口", value: "_self" },
                          ]}
                          onChange={(value) =>
                            updateEventAction(index, { target: value })
                          }
                          className="w-full"
                        />
                      </div>
                    ) : null}

                    {action.type === "scrollTo" ? (
                      <Input
                        value={action.targetId}
                        size="small"
                        onChange={(event) =>
                          updateEventAction(index, {
                            targetId: event.target.value,
                          })
                        }
                        placeholder="锚点 ID"
                        className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                      />
                    ) : null}

                    {action.type === "toast" ? (
                      <div className="space-y-1.5">
                        <Input
                          value={action.message}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, {
                              message: event.target.value,
                            })
                          }
                          placeholder="提示内容"
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                        <Select
                          value={action.variant ?? "info"}
                          size="small"
                          options={[
                            { label: "成功", value: "success" },
                            { label: "错误", value: "error" },
                            { label: "信息", value: "info" },
                            { label: "警告", value: "warning" },
                          ]}
                          onChange={(value) =>
                            updateEventAction(index, { variant: value })
                          }
                          className="w-full"
                        />
                      </div>
                    ) : null}

                    {action.type === "confirm" ? (
                      <Input
                        value={action.message}
                        size="small"
                        onChange={(event) =>
                          updateEventAction(index, {
                            message: event.target.value,
                          })
                        }
                        placeholder="确认文案"
                        className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                      />
                    ) : null}

                    {action.type === "when" ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input
                            value={action.key}
                            size="small"
                            onChange={(event) =>
                              updateEventAction(index, {
                                key: event.target.value,
                              })
                            }
                            placeholder="状态键"
                            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                          />
                          <Select
                            value={action.op ?? "truthy"}
                            size="small"
                            options={[
                              { label: "等于", value: "eq" },
                              { label: "不等于", value: "ne" },
                              { label: "为真", value: "truthy" },
                              { label: "为假", value: "falsy" },
                            ]}
                            onChange={(value) =>
                              updateEventAction(index, { op: value })
                            }
                            className="w-full"
                          />
                        </div>
                        {(action.op ?? "truthy") === "eq" ||
                        (action.op ?? "truthy") === "ne" ? (
                          <Input
                            value={String(action.value ?? "")}
                            size="small"
                            onChange={(event) =>
                              updateEventAction(index, {
                                value: event.target.value,
                              })
                            }
                            placeholder="比较值"
                            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {action.type === "request" ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <Select
                            value={action.method ?? "GET"}
                            size="small"
                            options={[
                              { label: "GET", value: "GET" },
                              { label: "POST", value: "POST" },
                              { label: "PUT", value: "PUT" },
                              { label: "PATCH", value: "PATCH" },
                              { label: "DELETE", value: "DELETE" },
                            ]}
                            onChange={(value) =>
                              updateEventAction(index, { method: value })
                            }
                            className="w-full"
                          />
                          <Input
                            value={action.saveToStateKey ?? ""}
                            size="small"
                            onChange={(event) =>
                              updateEventAction(index, {
                                saveToStateKey: event.target.value,
                              })
                            }
                            placeholder="保存到状态键(可选)"
                            className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                          />
                        </div>
                        <Input
                          value={action.url}
                          size="small"
                          onChange={(event) =>
                            updateEventAction(index, { url: event.target.value })
                          }
                          placeholder="/api/..."
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                        <Input.TextArea
                          value={typeof action.body === "string" ? action.body : ""}
                          onChange={(event) =>
                            updateEventAction(index, { body: event.target.value })
                          }
                          placeholder="Body（可选，字符串或 JSON）"
                          autoSize={{ minRows: 2, maxRows: 6 }}
                          className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
                        />
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[11px] text-[var(--ide-text-muted)]">
                  无事件步骤
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
