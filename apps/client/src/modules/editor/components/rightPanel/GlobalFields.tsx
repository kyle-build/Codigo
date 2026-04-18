import {
  BgColorsOutlined,
  DownOutlined,
  FileTextOutlined,
  GlobalOutlined,
  LayoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Form, Input, InputNumber, Select, Switch } from "antd";
import { observer } from "mobx-react-lite";
import type { FC } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEditorPage } from "@/modules/editor/hooks";
import type { TStorePage } from "@/shared/stores";
import { getBuiltinEChartsThemeOptions } from "@codigo/materials";

const GlobalFields: FC<{ store: TStorePage; showHeader?: boolean }> = observer(
  ({ store, showHeader = true }) => {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const { updatePage, setGridDashedLinesVisible } = useEditorPage();
  //todo: 优化图表主题选项 暂时没有统一option
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartThemeOptions = getBuiltinEChartsThemeOptions() as any;
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {},
  );

  function handleValuesChange(changedValues: Partial<TStorePage>) {
    const nextValues: Partial<TStorePage> = { ...changedValues };
    if (Object.prototype.hasOwnProperty.call(changedValues, "grid")) {
      nextValues.grid = {
        ...store.grid,
        ...(changedValues.grid ?? {}),
      };
    }
    updatePage(nextValues);
  }

  const fieldGroups = [
    {
      key: "basic",
      title: "页面信息",
      icon: <FileTextOutlined />,
      fields: [
        {
          label: "搭建场景",
          node: (
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-2 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
              管理系统搭建场景
            </div>
          ),
        },
        {
          label: "页面标题",
          name: "title",
          node: (
            <Input
              size="small"
              placeholder="例如：客户列表页"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
          ),
        },
        {
          label: "页面详情",
          name: "description",
          node: (
            <Input.TextArea
              size="small"
              placeholder="输入用途说明"
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
          ),
        },
      ],
    },
    {
      key: "layout",
      title: "布局设置",
      icon: <LayoutOutlined />,
      description: "决定画布内组件的定位方式。",
      fields: [
        {
          label: "布局模式",
          name: "layoutMode",
          node: (
            <Select
              size="small"
              options={[
                { label: "自由布局", value: "absolute" },
                { label: "栅格布局", value: "grid" },
              ]}
              className="w-full"
            />
          ),
        },
        {
          label: "栅格列数 (n)",
          name: ["grid", "cols"],
          hidden: store.layoutMode !== "grid",
          node: (
            <InputNumber
              size="small"
              min={1}
              max={48}
              className="w-full !bg-[var(--ide-control-bg)]"
            />
          ),
        },
        {
          label: "栅格行数 (m)",
          name: ["grid", "rows"],
          hidden: store.layoutMode !== "grid",
          node: (
            <InputNumber
              size="small"
              min={1}
              max={48}
              className="w-full !bg-[var(--ide-control-bg)]"
            />
          ),
        },
        {
          label: "栅格间距 (px)",
          name: ["grid", "gap"],
          hidden: store.layoutMode !== "grid",
          node: (
            <InputNumber
              size="small"
              min={0}
              max={64}
              className="w-full !bg-[var(--ide-control-bg)]"
            />
          ),
        },
        {
          label: "显示栅格虚线",
          hidden: store.layoutMode !== "grid",
          node: (
            <div className="flex items-center justify-end">
              <Switch
                size="small"
                checked={store.showGridDashedLines}
                onChange={(checked) =>
                  setGridDashedLinesVisible(checked, pageId || undefined)
                }
              />
            </div>
          ),
        },
      ],
    },
    {
      key: "seo",
      title: "页面检索",
      icon: <GlobalOutlined />,
      description: "业务关键字。",
      fields: [
        {
          label: "关键字",
          name: "tdk",
          node: (
            <Input
              size="small"
              placeholder="admin, list"
              className="!bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
          ),
        },
      ],
    },
    {
      key: "theme",
      title: "视觉主题",
      icon: <BgColorsOutlined />,
      description: "统一图表风格。",
      fields: [
        {
          label: "图表主题",
          name: "chartTheme",
          node: (
            <Select options={chartThemeOptions} size="small" placeholder="选择主题" className="w-full" />
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-2 px-3 pb-8">
      {showHeader && (
        <div className="border-b border-[var(--ide-border)] py-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-accent)]">
              Global Configuration
            </span>
            <span className="text-[10px] text-[var(--ide-text-muted)]">
              {store.deviceType === "mobile" ? "MOBILE" : "DESKTOP"}
            </span>
          </div>
          <div className="text-[12px] font-medium text-[var(--ide-text)]">
            {store.title || "未命名页面"}
          </div>
        </div>
      )}

      <Form
        key={`${store.pageCategory}-${store.layoutMode}-${store.deviceType}`}
        layout="vertical"
        initialValues={store}
        onValuesChange={handleValuesChange}
        className="[&_.ant-form-item]:mb-3 [&_.ant-form-item-label>label]:text-[11px] [&_.ant-form-item-label>label]:text-[var(--ide-text-muted)]"
      >
        <div className="space-y-2">
          {fieldGroups.map((group) => {
            const isCollapsed = Boolean(collapsedGroups[group.key]);
            return (
              <div
                key={group.key}
                className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)]"
              >
                <button
                  type="button"
                  aria-expanded={!isCollapsed}
                  onClick={() => {
                    setCollapsedGroups((prev) => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }));
                  }}
                  className="flex w-full items-start justify-between gap-3 p-3 text-left"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[var(--ide-accent)]">
                      {group.icon}
                    </span>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text)]">
                        {group.title}
                      </div>
                      {group.description && (
                        <div className="text-[10px] text-[var(--ide-text-muted)]">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center text-[var(--ide-text-muted)]">
                    {isCollapsed ? (
                      <RightOutlined className="text-[11px]" />
                    ) : (
                      <DownOutlined className="text-[11px]" />
                    )}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="px-3 pb-3">
                    {group.fields.map((field) => (
                      <Form.Item
                        key={
                          field.name
                            ? String(field.name)
                            : `${group.key}-${field.label}`
                        }
                        label={field.label}
                        name={field.name}
                        hidden={Boolean((field as any).hidden)}
                        className="!mb-2 last:!mb-0"
                      >
                        {field.node}
                      </Form.Item>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Form>
    </div>
  );
});

export default GlobalFields;
