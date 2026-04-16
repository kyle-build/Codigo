import type { AppManagementMetric } from "../../types/appManagement";
import AppMetricCard from "../shared/AppMetricCard";

interface AppManagementHeroProps {
  isLoggedIn: boolean;
  metrics: AppManagementMetric[];
}

function AppManagementHero({
  isLoggedIn,
  metrics,
}: AppManagementHeroProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            应用管理
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoggedIn
              ? "集中管理你的应用草稿、发布版本与页面分析。"
              : "访客模式：浏览公开页面与可用模板。"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {metrics.map((item) => (
          <AppMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}

export default AppManagementHero;
