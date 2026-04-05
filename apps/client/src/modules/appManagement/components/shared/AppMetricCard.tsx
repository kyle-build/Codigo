interface AppMetricCardProps {
  label: string;
  value: string;
}

function AppMetricCard({ label, value }: AppMetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/72 p-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default AppMetricCard;
