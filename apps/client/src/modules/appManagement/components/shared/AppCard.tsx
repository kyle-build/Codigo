import { Button } from "antd";

interface AppCardProps {
  actionText: string;
  desc: string;
  meta: string[];
  onAction: () => void;
  title: string;
}

function AppCard({
  actionText,
  desc,
  meta,
  onAction,
  title,
}: AppCardProps) {
  return (
    <article className="rounded-lg border border-slate-200/80 bg-white p-4">
      <div className="flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500"
              >
                {item}
              </span>
            ))}
          </div>
          <Button size="small" type="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default AppCard;
