import type { TemplatePreset } from "../types/templates";

export const templates: TemplatePreset[] = [
  {
    key: "admin-overview",
    name: "后台总览模板",
    desc: "适用于运营后台首页，包含核心指标、公告与快捷入口。",
    tags: ["后台管理", "运营总览", "PC"],
    pageTitle: "后台管理系统 - 运营总览",
    pageCategory: "admin",
    layoutMode: "flow",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "breadcrumbBar",
        props: {
          items: [
            { id: "overview-breadcrumb-1", label: "工作台" },
            { id: "overview-breadcrumb-2", label: "运营" },
            { id: "overview-breadcrumb-3", label: "总览" },
          ],
          separator: "/",
        },
      },
      {
        type: "pageHeader",
        props: {
          title: "运营总览",
          subtitle: "适用于展示后台首页的核心指标、业务摘要与重点提醒。",
          tagsText: "后台,总览,工作台",
          extraText: "最近更新时间：今天 18:00",
        },
      },
      {
        type: "statCard",
        props: {
          title: "总访问量",
          value: "126,560",
          suffix: "",
          trendText: "较昨日 +12.5%",
          trendDirection: "up",
          description: "访问量保持稳定增长",
        },
      },
      {
        type: "statCard",
        props: {
          title: "新增用户",
          value: "1,243",
          suffix: "",
          trendText: "较昨日 +8.3%",
          trendDirection: "up",
          description: "来源以移动端注册为主",
        },
      },
      {
        type: "statCard",
        props: {
          title: "待处理工单",
          value: "18",
          suffix: "",
          trendText: "较昨日 -2",
          trendDirection: "down",
          description: "建议优先处理高优先级事项",
        },
      },
      {
        type: "cardGrid",
        props: {
          columns: 3,
          items: [
            {
              id: "overview-grid-1",
              title: "内容审核",
              subtitle: "待处理任务",
              value: "32",
              extra: "需要今天内完成",
            },
            {
              id: "overview-grid-2",
              title: "会员中心",
              subtitle: "新增会员",
              value: "328",
              extra: "活跃度持续提升",
            },
            {
              id: "overview-grid-3",
              title: "活动投放",
              subtitle: "本周预算",
              value: "¥82,000",
              extra: "建议关注转化成本",
            },
          ],
        },
      },
    ],
  },
  {
    key: "admin-search-list",
    name: "搜索列表模板",
    desc: "用于后台应用检索、筛选和卡片展示的常用页面骨架。",
    tags: ["搜索列表", "筛选", "PC"],
    pageTitle: "后台管理系统 - 搜索列表",
    pageCategory: "admin",
    layoutMode: "flow",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "breadcrumbBar",
        props: {
          items: [
            { id: "search-breadcrumb-1", label: "列表页" },
            { id: "search-breadcrumb-2", label: "搜索列表" },
            { id: "search-breadcrumb-3", label: "应用" },
          ],
          separator: "/",
        },
      },
      {
        type: "pageHeader",
        props: {
          title: "搜索列表（应用）",
          subtitle: "快速搭建带筛选区、卡片区与表格区的简单后台列表页面。",
          tagsText: "后台,搜索列表,应用",
          extraText: "支持模板初始化后继续扩展",
        },
      },
      {
        type: "queryFilter",
        props: {
          columns: 4,
          searchText: "搜索",
          resetText: "重置",
          showSearchButton: true,
          showResetButton: true,
          fields: [
            {
              id: "search-field-1",
              label: "关键词",
              field: "keyword",
              type: "input",
              placeholder: "请输入应用名称",
              optionsText: "",
            },
            {
              id: "search-field-2",
              label: "所属类目",
              field: "category",
              type: "select",
              placeholder: "请选择类目",
              optionsText: "全部,类目1,类目2,类目3",
            },
            {
              id: "search-field-3",
              label: "好评度",
              field: "score",
              type: "select",
              placeholder: "请选择好评度",
              optionsText: "不限,优秀,良好,一般",
            },
          ],
        },
      },
      {
        type: "cardGrid",
        props: {
          items: [
            {
              id: "search-grid-1",
              title: "Alipay",
              subtitle: "活跃用户",
              value: "15万",
              extra: "新增用户 1,039",
            },
            {
              id: "search-grid-2",
              title: "Angular",
              subtitle: "活跃用户",
              value: "16万",
              extra: "新增用户 1,041",
            },
            {
              id: "search-grid-3",
              title: "Ant Design",
              subtitle: "活跃用户",
              value: "14万",
              extra: "新增用户 1,224",
            },
            {
              id: "search-grid-4",
              title: "Vue",
              subtitle: "活跃用户",
              value: "14万",
              extra: "新增用户 1,477",
            },
          ],
          columns: 4,
        },
      },
      {
        type: "dataTable",
        props: {
          title: "应用列表",
          size: "middle",
          bordered: true,
          pagination: true,
          pageSize: 10,
          emptyText: "暂无应用数据",
          columnsText: JSON.stringify(
            [
              { title: "应用名称", dataIndex: "name" },
              { title: "负责人", dataIndex: "owner" },
              { title: "状态", dataIndex: "status" },
              { title: "更新时间", dataIndex: "updatedAt" },
            ],
            null,
            2,
          ),
          dataText: JSON.stringify(
            [
              {
                key: "table-row-1",
                name: "搜索列表（应用）",
                owner: "张三",
                status: "运行中",
                updatedAt: "2026-04-03 10:20",
              },
              {
                key: "table-row-2",
                name: "组件管理后台",
                owner: "李四",
                status: "草稿中",
                updatedAt: "2026-04-03 09:12",
              },
            ],
            null,
            2,
          ),
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
    pageCategory: "admin",
    layoutMode: "flow",
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    components: [
      {
        type: "breadcrumbBar",
        props: {
          items: [
            { id: "blank-breadcrumb-1", label: "后台" },
            { id: "blank-breadcrumb-2", label: "新建页面" },
          ],
          separator: "/",
        },
      },
      {
        type: "pageHeader",
        props: {
          title: "新建后台页面",
          subtitle: "从后台模板开始搭建你的搜索页、总览页或数据列表页。",
          tagsText: "后台,空白模板",
          extraText: "先从左侧后台组件开始拖入画布",
        },
      },
    ],
  },
];
