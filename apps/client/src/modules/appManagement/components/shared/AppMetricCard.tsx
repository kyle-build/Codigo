interface AppMetricCardProps {
  label: string;
  value: string;
}

function AppMetricCard({ label, value }: AppMetricCardProps) {
  return (
    <div className="rounded-md border border-slate-200/80 bg-slate-50 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default AppMetricCard;
