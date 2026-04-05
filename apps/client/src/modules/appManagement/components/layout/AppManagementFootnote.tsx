function AppManagementFootnote() {
  return (
    <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-500">
        当前应用管理作为独立路由页面存在，不再依附首页内容区切换。入口只做装配，导航、分区视图、预览弹窗与数据控制已经分别下沉到对应层次。
      </div>
    </div>
  );
}

export default AppManagementFootnote;
