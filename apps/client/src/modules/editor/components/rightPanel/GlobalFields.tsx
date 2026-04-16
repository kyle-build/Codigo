import {
  BgColorsOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Form, Input, Select } from "antd";
import { observer } from "mobx-react-lite";
import type { FC } from "react";

import { useEditorPage } from "@/modules/editor/hooks";
import type { TStorePage } from "@/shared/stores";
import { getBuiltinEChartsThemeOptions } from "@codigo/materials";

const GlobalFields: FC<{ store: TStorePage }> = observer(({ store }) => {
  const { updatePage } = useEditorPage();
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
          label: "搭建场景",
          node: (
            <div className="bg-[#2d2d2d] border border-[#3c3c3c] px-3 py-2 text-[11px] leading-relaxed text-[#858585] rounded-sm">
              当前编辑器已收口为管理系统搭建场景。
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
              className="!bg-[#3c3c3c] !border-[#3c3c3c] !text-[#cccccc]"
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
              className="!bg-[#3c3c3c] !border-[#3c3c3c] !text-[#cccccc]"
            />
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
            <Input size="small" placeholder="admin, list" className="!bg-[#3c3c3c] !border-[#3c3c3c] !text-[#cccccc]" />
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
      <div className="border-b border-[#3c3c3c] py-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007acc]">
            Global Configuration
          </span>
          <span className="text-[10px] text-[#858585]">
            {store.deviceType === "mobile" ? "MOBILE" : "DESKTOP"}
          </span>
        </div>
        <div className="text-[12px] font-medium text-white">
          {store.title || "未命名页面"}
        </div>
      </div>

      <Form
        key={`${store.pageCategory}-${store.layoutMode}-${store.deviceType}`}
        layout="vertical"
        initialValues={store}
        onValuesChange={handleValuesChange}
        className="[&_.ant-form-item]:mb-3 [&_.ant-form-item-label>label]:text-[11px] [&_.ant-form-item-label>label]:text-[#858585]"
      >
        <div className="space-y-2">
          {fieldGroups.map((group) => (
            <div
              key={group.key}
              className="bg-[#2d2d2d] p-3 border border-[#3c3c3c] rounded-sm"
            >
              <div className="mb-2 flex items-start gap-2">
                <span className="text-[#007acc] mt-0.5">
                  {group.icon}
                </span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">
                    {group.title}
                  </div>
                  {group.description && (
                    <div className="text-[10px] text-[#858585]">
                      {group.description}
                    </div>
                  )}
                </div>
              </div>

              {group.fields.map((field) => (
                <Form.Item
                  key={field.name ? String(field.name) : `${group.key}-${field.label}`}
                  label={field.label}
                  name={field.name}
                  className="!mb-2 last:!mb-0"
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
