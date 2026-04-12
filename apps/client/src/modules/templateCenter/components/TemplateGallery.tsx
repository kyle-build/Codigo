import { EyeOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { TemplatePreset } from "../types/templates";

interface TemplateGalleryProps {
  canUseTemplate: boolean;
  onPreview: (template: TemplatePreset) => void;
  onUse: (template: TemplatePreset) => void;
  templates: TemplatePreset[];
}

export function TemplateGallery({
  canUseTemplate,
  onPreview,
  onUse,
  templates,
}: TemplateGalleryProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <article
          key={template.key}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
          <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
            {template.desc}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              画布 {template.canvasWidth} × {template.canvasHeight}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              {template.components.length} 个组件
            </span>
          </div>
          <div className="mt-6 flex gap-3">
            <Button icon={<EyeOutlined />} onClick={() => onPreview(template)}>
              查看模板
            </Button>
            {canUseTemplate && (
              <Button
                icon={<RocketOutlined />}
                type="primary"
                onClick={() => onUse(template)}
              >
                使用模板
              </Button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
