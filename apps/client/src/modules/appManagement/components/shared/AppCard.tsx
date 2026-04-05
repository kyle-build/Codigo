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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex min-h-[156px] flex-col justify-between gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
              >
                {item}
              </span>
            ))}
          </div>
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default AppCard;
