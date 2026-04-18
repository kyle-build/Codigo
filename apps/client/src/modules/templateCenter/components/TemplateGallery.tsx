import { EyeOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { TemplateListItem } from "@codigo/schema";

interface TemplateGalleryProps {
  canUseTemplate: boolean;
  onPreview: (template: TemplateListItem) => void;
  onUse: (template: TemplateListItem) => void;
  templates: TemplateListItem[];
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
          key={template.id}
          className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)] transition-colors hover:border-[var(--ide-control-border)]"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[11px] font-medium text-[var(--ide-accent)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-base font-semibold text-[var(--ide-text)]">
            {template.name}
          </h3>
          <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--ide-text-muted)]">
            {template.desc}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
              画布 {template.canvasWidth} × {template.canvasHeight}
            </span>
            <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
              {template.pagesCount} 个页面
            </span>
            <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
              默认页 page:{template.activePagePath}
            </span>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onPreview(template)}
              className="!rounded-sm"
            >
              查看模板
            </Button>
            {canUseTemplate && (
              <Button
                icon={<RocketOutlined />}
                type="primary"
                onClick={() => onUse(template)}
                className="!rounded-sm"
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
