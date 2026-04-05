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
    <div className="border-b border-slate-200/80 px-6 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            应用管理页面
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            集中查看模板、应用状态与版本历史
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {isLoggedIn
              ? "登录后可在此继续开发、查看已发布内容并回溯历史版本。"
              : "访客可在此浏览已发布页面与模板内容，登录后即可进入编辑器继续开发。"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {isLoggedIn ? "当前身份：开发者" : "当前身份：访客"}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
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
