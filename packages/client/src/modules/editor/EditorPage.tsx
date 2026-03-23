import { useTitle } from "ahooks";
import EditorHeader from "./components/header";
import EditorLeftPanel from "./components/leftPanel";
function Editor() {
  useTitle("Codigo低代码平台 - 页面编辑");

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100">
      <header className="flex h-14 items-center border-b bg-white px-4 shadow-sm z-10">
        <h1 className="text-lg font-bold">
          <EditorHeader />
        </h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r bg-white p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">
            <EditorLeftPanel />
          </h2>
        </aside>

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="min-h-full w-full bg-white shadow-lg rounded-sm border border-dashed border-gray-300">
            <p className="text-center text-gray-400 mt-20">这是画布区域</p>
          </div>
        </main>
        <aside className="w-80 border-l bg-white p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">
            属性设置
          </h2>
        </aside>
      </div>
    </div>
  );
}

export default Editor;












