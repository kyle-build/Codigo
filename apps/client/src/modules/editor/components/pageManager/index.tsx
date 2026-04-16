import { observer } from "mobx-react-lite";
import { Button, Input } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useEditorComponents } from "@/modules/editor/hooks";

interface EditorPageManagerProps {
  embedded?: boolean;
}

const EditorPageManager =  observer(function ({
  embedded = false,
}: EditorPageManagerProps) {
  const {
    getPages,
    getActivePage,
    createEditorPage,
    switchEditorPage,
    updateEditorPageMeta,
  } = useEditorComponents();
  const pages = getPages.get();
  const activePage = getActivePage.get();

  if (embedded) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#252526]">
        <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">页面管理</div>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => createEditorPage()}
            className="!rounded-sm"
          >
            新建
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[#3c3c3c] hover:scrollbar-thumb-[#454545] scrollbar-track-transparent">
          <div className="space-y-1">
            {pages.map((page, index) => {
              const isActive = page.id === activePage?.id;

              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => switchEditorPage(page.id)}
                  className={`w-full border-0 px-2 py-1.5 text-left transition-colors ${
                    isActive
                      ? "bg-[#37373d] text-white"
                      : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className={isActive ? "text-[#007acc]" : "text-[#858585]"} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium">
                        {page.name}
                      </div>
                      <div className="truncate text-[10px] opacity-60 font-mono">
                        {page.path}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activePage ? (
          <div className="border-t border-[#3c3c3c] p-3">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#858585]">
                当前页面配置
              </div>
              <Input
                key={`${activePage.id}-${activePage.name}-embedded-name`}
                defaultValue={activePage.name}
                size="small"
                onBlur={(event) =>
                  updateEditorPageMeta(activePage.id, {
                    name: event.target.value,
                  })
                }
                className="!bg-[#3c3c3c] !border-[#3c3c3c] !text-[#cccccc]"
              />
              <Input
                key={`${activePage.id}-${activePage.path}-embedded-path`}
                defaultValue={activePage.path}
                size="small"
                onBlur={(event) =>
                  updateEditorPageMeta(activePage.id, {
                    path: event.target.value,
                  })
                }
                className="!bg-[#3c3c3c] !border-[#3c3c3c] !text-[#cccccc]"
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const content = (
    <>
      <div className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(255,255,255,0.98))] p-3.5 shadow-[0_20px_40px_-32px_rgba(59,130,246,0.75)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
              Pages
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              页面管理
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createEditorPage()}
            className="!rounded-xl"
          >
            新建
          </Button>
        </div>
        <div className="text-[12px] leading-5 text-slate-500">
          适合拆分真正独立的页面，再通过页面跳转动作串联，不必把多页逻辑都塞进同一块内容切换里。
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {pages.map((page, index) => {
            const isActive = page.id === activePage?.id;

            return (
              <button
                key={page.id}
                type="button"
                onClick={() => switchEditorPage(page.id)}
                className={`w-full rounded-[20px] border px-3.5 py-3 text-left transition ${
                  isActive
                    ? "border-sky-300 bg-sky-50 shadow-[0_18px_36px_-30px_rgba(59,130,246,0.65)]"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-2xl text-sm ${
                          isActive
                            ? "bg-sky-500/12 text-sky-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FileTextOutlined />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {page.name}
                        </div>
                        <div className="truncate text-[12px] text-slate-500">
                          page:{page.path}
                        </div>
                      </div>
                    </div>
                  </div>
                  <RightOutlined
                    className={isActive ? "text-sky-500" : "text-slate-300"}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>#{index + 1}</span>
                  <span>{page.components.length} 个根节点</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activePage ? (
        <div className="mt-3 rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.5)]">
          <div className="mb-3 text-sm font-semibold text-slate-900">
            当前页面
          </div>
          <div className="space-y-2.5">
            <Input
              key={`${activePage.id}-${activePage.name}-name`}
              defaultValue={activePage.name}
              onBlur={(event) =>
                updateEditorPageMeta(activePage.id, {
                  name: event.target.value,
                })
              }
              onPressEnter={(event) => {
                updateEditorPageMeta(activePage.id, {
                  name: event.currentTarget.value,
                });
                event.currentTarget.blur();
              }}
              placeholder="页面名称"
            />
            <Input
              key={`${activePage.id}-${activePage.path}-path`}
              defaultValue={activePage.path}
              onBlur={(event) =>
                updateEditorPageMeta(activePage.id, {
                  path: event.target.value,
                })
              }
              onPressEnter={(event) => {
                updateEditorPageMeta(activePage.id, {
                  path: event.currentTarget.value,
                });
                event.currentTarget.blur();
              }}
              placeholder="跳转路径标识"
            />
          </div>
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-[12px] leading-5 text-slate-500">
            页面跳转动作里填写
            <span className="mx-1 rounded-md bg-white px-1.5 py-0.5 font-medium text-sky-600">
              {`page:${activePage.path}`}
            </span>
            即可切到当前页。
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col border-r border-slate-200/80 bg-white/88 px-3 py-3 shadow-[10px_0_40px_-34px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      {content}
    </div>
  );
});


export default EditorPageManager;
