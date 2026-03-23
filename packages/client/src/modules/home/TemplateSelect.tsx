import type { TComponentTypes } from "@codigo/schema";
import { useNavigate } from "react-router-dom";

interface TemplateComponent {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

interface TemplatePreset {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  deviceType: "pc" | "mobile";
  canvasWidth: number;
  canvasHeight: number;
  components: TemplateComponent[];
}

const templates: TemplatePreset[] = [
  {
    key: "admin-overview",
    name: "后台总览模板",
    desc: "适用于运营后台首页，包含核心指标、公告与快捷入口。",
    tags: ["后台管理", "运营总览", "PC"],
    pageTitle: "后台管理系统 - 运营总览",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "titleText",
        props: { title: "运营总览", size: "xl" },
      },
      {
        type: "richText",
        props: {
          content:
            "<p><strong>今日概览：</strong>访客转化率提升 3.2%，新增商机 28 条。</p>",
        },
      },
      {
        type: "split",
      },
      {
        type: "card",
        props: {
          title: "待处理工单",
          description: "当前待处理 18 条，建议优先处理高优先级事项。",
          coverImg: "https://picsum.photos/800/220?random=8",
        },
      },
      {
        type: "card",
        props: {
          title: "系统公告",
          description: "本周五 23:00 进行数据库维护，预计影响 10 分钟。",
          coverImg: "https://picsum.photos/800/220?random=9",
        },
      },
    ],
  },
  {
    key: "admin-user-center",
    name: "用户管理模板",
    desc: "用于后台用户检索、标签筛选和批量管理的常用页面骨架。",
    tags: ["用户中心", "筛选", "PC"],
    pageTitle: "后台管理系统 - 用户管理",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "titleText",
        props: { title: "用户管理中心", size: "xl" },
      },
      {
        type: "input",
        props: { title: "关键词检索", placeholder: "请输入用户名/手机号", text: "" },
      },
      {
        type: "radio",
        props: {
          title: "用户状态",
          options: [
            { id: "r1", value: "全部" },
            { id: "r2", value: "正常" },
            { id: "r3", value: "冻结" },
          ],
          defaultRadio: "r1",
        },
      },
      {
        type: "list",
        props: {
          items: [
            {
              id: "u1",
              title: "张三",
              avatar: "https://i.pravatar.cc/80?img=1",
              description: "最近登录：今天 10:23",
              titleLink: "https://example.com",
            },
            {
              id: "u2",
              title: "李四",
              avatar: "https://i.pravatar.cc/80?img=2",
              description: "最近登录：昨天 18:10",
              titleLink: "https://example.com",
            },
          ],
        },
      },
    ],
  },
  {
    key: "admin-blank",
    name: "空白后台模板",
    desc: "从空白页面开始，适合需要完全自定义布局的后台场景。",
    tags: ["空白", "自定义", "PC"],
    pageTitle: "后台管理系统 - 新建页面",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "titleText",
        props: { title: "新建后台页面", size: "lg" },
      },
    ],
  },
];

function createId(index: number): string {
  return `tpl_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
}

function writeTemplateToDraft(template: TemplatePreset) {
  const compConfigs: Record<string, Record<string, unknown>> = {};
  const sortableCompConfig: string[] = [];

  template.components.forEach((component, index) => {
    const id = createId(index);
    compConfigs[id] = {
      id,
      type: component.type,
      props: component.props ?? {},
      styles: component.styles,
    };
    sortableCompConfig.push(id);
  });

  localStorage.setItem("compConfig", JSON.stringify(compConfigs));
  localStorage.setItem("sortableCompConfig", JSON.stringify(sortableCompConfig));
  localStorage.setItem(
    "currentCompConfig",
    JSON.stringify(sortableCompConfig[0] ?? null),
  );
  localStorage.setItem(
    "pageSettings",
    JSON.stringify({
      deviceType: template.deviceType,
      canvasWidth: template.canvasWidth,
      canvasHeight: template.canvasHeight,
    }),
  );
  localStorage.setItem("store_time", String(Date.now()));
}

export default function TemplateSelect() {
  const navigate = useNavigate();

  function handleUseTemplate(template: TemplatePreset) {
    writeTemplateToDraft(template);
    navigate("/editor");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">后台管理模板选择</h1>
            <p className="mt-2 text-sm text-slate-500">
              选择一个模板后将直接进入编辑器，你可以继续拖拽和修改组件。
            </p>
          </div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => navigate("/")}
          >
            返回主页
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{template.name}</h2>
              <p className="mt-2 min-h-11 text-sm leading-6 text-slate-500">{template.desc}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  画布 {template.canvasWidth} × {template.canvasHeight}
                </span>
                <button
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                  onClick={() => handleUseTemplate(template)}
                >
                  使用模板
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}












