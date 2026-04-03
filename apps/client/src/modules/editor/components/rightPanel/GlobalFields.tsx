import {
  BgColorsOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Form, Input, Select } from "antd";
import { observer } from "mobx-react-lite";
import type { FC } from "react";

import { useStorePage } from "@/shared/hooks";
import type { TStorePage } from "@/shared/stores";
import { getBuiltinEChartsThemeOptions } from "@codigo/materials";

const GlobalFields: FC<{ store: TStorePage }> = observer(({ store }) => {
  const { updatePage } = useStorePage();
  //todo: 优化图表主题选项 暂时没有统一option
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartThemeOptions = getBuiltinEChartsThemeOptions() as any;

  function handleValuesChange(changedValues: Partial<TStorePage>) {
    updatePage(changedValues);
  }

  const fieldGroups = [
    {
      key: "basic",
      title: "页面信息",
      icon: <FileTextOutlined />,
      fields: [
        {
          label: "页面类型",
          name: "pageCategory",
          node: (
            <Select
              options={[
                { label: "营销页", value: "marketing" },
                { label: "后台页", value: "admin" },
              ]}
            />
          ),
        },
        {
          label: "布局模式",
          name: "layoutMode",
          node: (
            <Select
              options={[
                { label: "自由布局", value: "absolute" },
                { label: "流式布局", value: "flow" },
              ]}
            />
          ),
        },
        {
          label: "页面标题",
          name: "title",
          node: (
            <Input
              placeholder={
                store.pageCategory === "admin"
                  ? "例如：搜索列表（应用）"
                  : "例如：春季营销活动页"
              }
            />
          ),
        },
        {
          label: "页面详情",
          name: "description",
          node: (
            <Input.TextArea
              placeholder={
                store.pageCategory === "admin"
                  ? "输入后台页面用途、模块职责或业务说明"
                  : "输入页面用途、内容摘要或业务说明"
              }
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          ),
        },
      ],
    },
    {
      key: "seo",
      title: "SEO 设置",
      icon: <GlobalOutlined />,
      description:
        store.pageCategory === "admin"
          ? "补充后台页面的关键字，方便页面归档与检索。"
          : "补充关键字，方便页面发布后的搜索识别与归档。",
      fields: [
        {
          label: "页面关键字",
          name: "tdk",
          node: (
            <Input
              placeholder={
                store.pageCategory === "admin"
                  ? "admin, list, search"
                  : "lowcode, editor, marketing"
              }
            />
          ),
        },
      ],
    },
    {
      key: "theme",
      title: "视觉主题",
      icon: <BgColorsOutlined />,
      description: "统一图表风格，确保数据可视化与页面调性一致。",
      fields: [
        {
          label: "图表主题",
          name: "chartTheme",
          node: (
            <Select options={chartThemeOptions} placeholder="选择图表主题" />
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-3 pb-8">
      <div className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(255,255,255,0.98))] p-3.5 shadow-[0_20px_40px_-32px_rgba(56,189,248,0.7)]">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
            Global
          </span>
          <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] text-slate-500">
            {store.pageCategory === "admin"
              ? "后台页"
              : store.deviceType === "mobile"
                ? "移动端页面"
                : "桌面端页面"}
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {store.title || "未命名页面"}
        </div>
      </div>

      <Form
        key={`${store.pageCategory}-${store.layoutMode}-${store.deviceType}`}
        layout="vertical"
        initialValues={store}
        onValuesChange={handleValuesChange}
        className="[&_.ant-form-item]:mb-3.5 [&_.ant-form-item-label>label]:text-[13px] [&_.ant-form-item-label>label]:text-slate-500 [&_.ant-input]:!rounded-xl [&_.ant-input]:!border-slate-200 [&_.ant-input]:!bg-slate-50/70 [&_.ant-input]:!px-3.5 [&_.ant-input]:!py-2 [&_.ant-input-affix-wrapper]:!rounded-xl [&_.ant-input-affix-wrapper]:!border-slate-200 [&_.ant-input-affix-wrapper]:!bg-slate-50/70 [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!bg-slate-50/70 [&_.ant-select-selection-wrap]:!items-center"
      >
        <div className="mb-14 space-y-3">
          {fieldGroups.map((group) => (
            <div
              key={group.key}
              className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.55)]"
            >
              <div className="mb-3 flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                  {group.icon}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">
                    {group.title}
                  </div>
                  <div className="mt-1 text-[11px] leading-5 text-slate-400">
                    {group.description}
                  </div>
                </div>
              </div>

              {group.fields.map((field) => (
                <Form.Item
                  key={String(field.name)}
                  label={field.label}
                  name={field.name}
                >
                  {field.node}
                </Form.Item>
              ))}
            </div>
          ))}
        </div>
      </Form>
    </div>
  );
});

export default GlobalFields;
