import type {
  TemplateComponent,
  TemplatePagePreset,
  TemplatePreset,
} from "../types/templates";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 900;
const SIDEBAR_WIDTH = 272;

/**
 * 将数字值转换为 px 字符串，字符串值原样返回。
 */
function toCssSize(value?: number | string) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * 为模板节点追加绝对定位样式，便于生成后台仪表盘的网格布局。
 */
function place(
  component: TemplateComponent,
  options: {
    left: number | string;
    top: number | string;
    width?: number | string;
    height?: number | string;
  },
): TemplateComponent {
  return {
    ...component,
    styles: {
      ...(component.styles ?? {}),
      left: toCssSize(options.left),
      top: toCssSize(options.top),
      ...(options.width !== undefined ? { width: toCssSize(options.width) } : null),
      ...(options.height !== undefined ? { height: toCssSize(options.height) } : null),
    },
  };
}

/**
 * 创建文本物料节点，统一后台模板中的文案样式。
 */
function createText(
  title: string,
  size: "xs" | "sm" | "base" | "lg" | "xl" = "base",
): TemplateComponent {
  return {
    type: "titleText",
    props: {
      title,
      size,
    },
  };
}

/**
 * 创建带站内页面跳转的侧边栏按钮。
 */
function createNavButton(
  label: string,
  pagePath: string,
  active: boolean,
): TemplateComponent {
  return {
    type: "button",
    props: {
      text: label,
      size: "large",
      type: active ? "primary" : "default",
      block: true,
      active,
    },
    events: {
      onClick: [{ type: "navigate", path: `page:${pagePath}` }],
    },
  };
}

/**
 * 创建后台模板中的通用容器。
 */
function createPlainContainer(
  children: TemplateComponent[],
  options?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    minHeight?: number;
    padding?: number;
    title?: string;
  },
): TemplateComponent {
  return {
    type: "container",
    props: {
      title: options?.title ?? "",
      showChrome: false,
      backgroundColor: options?.backgroundColor ?? "transparent",
      borderColor: options?.borderColor ?? "transparent",
      borderRadius: options?.borderRadius ?? 0,
      padding: options?.padding ?? 0,
      minHeight: options?.minHeight ?? 0,
    },
    children,
  };
}

/**
 * 创建后台模板中的通用双栏布局。
 */
function createPlainTwoColumn(
  leftChildren: TemplateComponent[],
  rightChildren: TemplateComponent[],
  options?: {
    backgroundColor?: string;
    gap?: number;
    leftWidth?: number;
    minHeight?: number;
    styles?: Record<string, unknown>;
    title?: string;
  },
): TemplateComponent {
  return {
    type: "twoColumn",
    props: {
      title: options?.title ?? "",
      showChrome: false,
      leftWidth: options?.leftWidth ?? 320,
      gap: options?.gap ?? 16,
      minHeight: options?.minHeight ?? 120,
      backgroundColor: options?.backgroundColor ?? "transparent",
    },
    styles: options?.styles,
    children: [
      ...leftChildren.map((child) => ({
        ...child,
        slot: "left",
      })),
      ...rightChildren.map((child) => ({
        ...child,
        slot: "right",
      })),
    ],
  };
}

/**
 * 创建后台模板的顶部信息栏。
 */
function createTopBar(sectionTitle: string, sectionHint: string): TemplateComponent {
  return createPlainContainer(
    [
      place(createText(sectionTitle, "sm"), {
        left: 20,
        top: 14,
        width: "520px",
        height: 24,
      }),
      place(createText(sectionHint, "xs"), {
        left: 20,
        top: 40,
        width: "560px",
        height: 20,
      }),
      place(
        {
          type: "button",
          props: {
            text: "Support & Consulting",
            type: "text",
            size: "small",
            danger: false,
            active: false,
            block: false,
            actionType: "none",
            link: "",
            targetId: "",
            stateKey: "",
            stateValue: "",
          },
        },
        {
          left: 560,
          top: 18,
          width: 160,
          height: 32,
        },
      ),
      place(
        {
          type: "button",
          props: {
            text: "About",
            type: "text",
            size: "small",
            danger: false,
            active: false,
            block: false,
            actionType: "none",
            link: "",
            targetId: "",
            stateKey: "",
            stateValue: "",
          },
        },
        {
          left: 736,
          top: 18,
          width: 72,
          height: 32,
        },
      ),
      place(
        {
          type: "avatar",
          props: {
            name: "MH",
            size: 36,
            shape: "circle",
          },
        },
        {
          left: 892,
          top: 16,
          width: 40,
          height: 40,
        },
      ),
    ],
    {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderRadius: 0,
      padding: 0,
      minHeight: 64,
    },
  );
}

/**
 * 创建后台模板的左侧导航区域。
 */
function createSidebar(activePagePath: string): TemplateComponent {
  return createPlainContainer(
    [
      place(createText("VUESTIC ADMIN", "lg"), {
        left: 18,
        top: 18,
        width: 220,
        height: 28,
      }),
      place(createNavButton("Dashboard", "home", activePagePath === "home"), {
        left: 12,
        top: 76,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Users", "auth", false), {
        left: 12,
        top: 128,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Projects", "project", activePagePath === "project"), {
        left: 12,
        top: 180,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Payments", "project", false), {
        left: 12,
        top: 232,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Auth", "auth", activePagePath === "auth"), {
        left: 12,
        top: 284,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Account preferences", "setting", false), {
        left: 12,
        top: 336,
        width: 248,
        height: 44,
      }),
      place(createNavButton("Application settings", "setting", activePagePath === "setting"), {
        left: 12,
        top: 388,
        width: 248,
        height: 44,
      }),
    ],
    {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderRadius: 0,
      padding: 0,
      minHeight: CANVAS_HEIGHT,
    },
  );
}

/**
 * 创建总览页的内容区组件。
 */
function createOverviewContent(): TemplateComponent[] {
  const revenueData = [
    { month: "Jan", value: 3.2 },
    { month: "Feb", value: 4.1 },
    { month: "Mar", value: 3.6 },
    { month: "Apr", value: 4.8 },
    { month: "May", value: 4.0 },
    { month: "Jun", value: 5.4 },
    { month: "Jul", value: 4.9 },
    { month: "Aug", value: 5.8 },
    { month: "Sep", value: 5.2 },
    { month: "Oct", value: 6.4 },
    { month: "Nov", value: 5.9 },
    { month: "Dec", value: 6.8 },
  ];
  const earningsData = [
    { month: "Jan", value: 4.1 },
    { month: "Feb", value: 4.3 },
    { month: "Mar", value: 4.8 },
    { month: "Apr", value: 4.7 },
    { month: "May", value: 5.2 },
    { month: "Jun", value: 5.0 },
    { month: "Jul", value: 5.6 },
    { month: "Aug", value: 5.9 },
    { month: "Sep", value: 6.2 },
    { month: "Oct", value: 6.0 },
    { month: "Nov", value: 6.4 },
    { month: "Dec", value: 6.8 },
  ];
  const breakupData = [
    { name: "Earnings", value: 36358 },
    { name: "Profit", value: 6820 },
  ];

  return [
    place(
      {
        type: "breadcrumbBar",
        props: {
          items: [
            { id: "overview-breadcrumb-1", label: "Home" },
            { id: "overview-breadcrumb-2", label: "Dashboard" },
          ],
          separator: "/",
        },
      },
      { left: 0, top: 0, width: "100%", height: 48 },
    ),
    place(createText("Dashboard", "xl"), {
      left: 0,
      top: 58,
      width: 320,
      height: 40,
    }),
    {
      ...createPlainTwoColumn(
        [
          place(
            createPlainContainer(
              [
                place(
                  {
                    type: "barChart",
                    props: {
                      title: "Revenue report",
                      dataText: JSON.stringify(revenueData, null, 2),
                      optionText: JSON.stringify(
                        {
                          grid: {
                            left: 44,
                            right: 18,
                            top: 56,
                            bottom: 30,
                            containLabel: true,
                          },
                          yAxis: { splitLine: { lineStyle: { color: "#eef2f7" } } },
                        },
                        null,
                        2,
                      ),
                      xAxisKey: "month",
                      yAxisKey: "value",
                      nameKey: "month",
                      valueKey: "value",
                      color: "#2563eb",
                    },
                  },
                  { left: 0, top: 0, width: "100%", height: "100%" },
                ),
              ],
              {
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: 18,
                padding: 8,
                minHeight: 320,
              },
            ),
            { left: 0, top: 0, width: "100%", height: "100%" },
          ),
        ],
        [
          place(
            createPlainContainer(
              [
                place(
                  {
                    type: "pieChart",
                    props: {
                      title: "Yearly breakup",
                      dataText: JSON.stringify(breakupData, null, 2),
                      optionText: JSON.stringify(
                        {
                          legend: { bottom: 8 },
                          series: [
                            {
                              radius: ["54%", "78%"],
                              label: { show: false },
                            },
                          ],
                        },
                        null,
                        2,
                      ),
                      xAxisKey: "name",
                      yAxisKey: "value",
                      nameKey: "name",
                      valueKey: "value",
                      color: "#2563eb",
                    },
                  },
                  { left: 0, top: 0, width: "100%", height: 160 },
                ),
                place(
                  {
                    type: "lineChart",
                    props: {
                      title: "Monthly earnings",
                      dataText: JSON.stringify(earningsData, null, 2),
                      optionText: JSON.stringify(
                        {
                          grid: {
                            left: 44,
                            right: 18,
                            top: 50,
                            bottom: 26,
                            containLabel: true,
                          },
                          yAxis: { splitLine: { lineStyle: { color: "#eef2f7" } } },
                        },
                        null,
                        2,
                      ),
                      xAxisKey: "month",
                      yAxisKey: "value",
                      nameKey: "month",
                      valueKey: "value",
                      color: "#3b82f6",
                    },
                  },
                  { left: 0, top: 176, width: "100%", height: 150 },
                ),
              ],
              {
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: 18,
                padding: 8,
                minHeight: 320,
              },
            ),
            { left: 0, top: 0, width: "100%", height: "100%" },
          ),
        ],
        {
          leftWidth: 680,
          gap: 16,
          minHeight: 320,
          styles: {
            left: "0px",
            top: "104px",
            width: "100%",
            height: "340px",
          },
        },
      ),
    },
    place(
      {
        type: "cardGrid",
        props: {
          columns: 4,
          items: [
            {
              id: "overview-stat-1",
              title: "Open invoices",
              subtitle: "Total",
              value: "$35,548",
              extra: "+1.4% since last month",
            },
            {
              id: "overview-stat-2",
              title: "Ongoing project",
              subtitle: "Active",
              value: "15",
              extra: "+2.5% since last month",
            },
            {
              id: "overview-stat-3",
              title: "Employees",
              subtitle: "Current",
              value: "25",
              extra: "+2.3% since last month",
            },
            {
              id: "overview-stat-4",
              title: "New profit",
              subtitle: "Monthly",
              value: "27%",
              extra: "+4.5% since last month",
            },
          ],
        },
      },
      { left: 0, top: 462, width: "100%", height: 140 },
    ),
    {
      ...createPlainTwoColumn(
        [
          place(
            createPlainContainer(
              [
                place(
                  {
                    type: "image",
                    props: {
                      id: "world-map",
                      name: "Revenue by location",
                      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png",
                      height: 240,
                      fit: "contain",
                      handleClicked: "none",
                      link: "",
                    },
                  },
                  { left: 0, top: 0, width: "100%", height: "100%" },
                ),
              ],
              {
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: 18,
                padding: 12,
                minHeight: 240,
              },
            ),
            { left: 0, top: 0, width: "100%", height: "100%" },
          ),
        ],
        [
          place(
            createPlainContainer(
              [
                place(
                  {
                    type: "dataTable",
                    props: {
                      title: "Revenue by top regions",
                      size: "small",
                      bordered: true,
                      pagination: false,
                      pageSize: 8,
                      emptyText: "暂无数据",
                      columnsText: JSON.stringify(
                        [
                          { title: "Top region", dataIndex: "region" },
                          { title: "Revenue", dataIndex: "revenue" },
                        ],
                        null,
                        2,
                      ),
                      dataText: JSON.stringify(
                        [
                          { key: "region-1", region: "Japan", revenue: "$4,748,454" },
                          { key: "region-2", region: "United Kingdom", revenue: "$405,748" },
                          { key: "region-3", region: "United States", revenue: "$1,280,240" },
                          { key: "region-4", region: "France", revenue: "$338,550" },
                        ],
                        null,
                        2,
                      ),
                    },
                  },
                  { left: 0, top: 0, width: "100%", height: "100%" },
                ),
              ],
              {
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: 18,
                padding: 0,
                minHeight: 240,
              },
            ),
            { left: 0, top: 0, width: "100%", height: "100%" },
          ),
        ],
        {
          leftWidth: 640,
          gap: 16,
          minHeight: 240,
          styles: {
            left: "0px",
            top: "624px",
            width: "100%",
            height: "252px",
          },
        },
      ),
    },
  ];
}

/**
 * 创建项目页的内容区组件。
 */
function createProjectContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "project-breadcrumb-1", label: "后台系统" },
          { id: "project-breadcrumb-2", label: "项目管理" },
          { id: "project-breadcrumb-3", label: "项目列表" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "项目管理",
        subtitle: "统一查看项目归属、环境状态和最近一次交付结果。",
        tagsText: "后台,项目,检索",
        extraText: "共 32 个项目",
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
            id: "project-filter-1",
            label: "项目名称",
            field: "keyword",
            type: "input",
            placeholder: "请输入项目名称",
            optionsText: "",
          },
          {
            id: "project-filter-2",
            label: "所属团队",
            field: "team",
            type: "select",
            placeholder: "请选择团队",
            optionsText: "全部,平台组,中台组,业务组",
          },
          {
            id: "project-filter-3",
            label: "当前状态",
            field: "status",
            type: "select",
            placeholder: "请选择状态",
            optionsText: "全部,开发中,待上线,运行中",
          },
        ],
      },
    },
    {
      type: "dataTable",
      props: {
        title: "项目清单",
        size: "middle",
        bordered: true,
        pagination: true,
        pageSize: 8,
        emptyText: "暂无项目数据",
        columnsText: JSON.stringify(
          [
            { title: "项目", dataIndex: "name" },
            { title: "团队", dataIndex: "team" },
            { title: "环境", dataIndex: "env" },
            { title: "状态", dataIndex: "status" },
            { title: "负责人", dataIndex: "owner" },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: "project-row-1",
              name: "Workspace Console",
              team: "平台组",
              env: "Production",
              status: "运行中",
              owner: "Mike He",
            },
            {
              key: "project-row-2",
              name: "Auth Portal",
              team: "中台组",
              env: "Staging",
              status: "待上线",
              owner: "Olivia",
            },
            {
              key: "project-row-3",
              name: "Setting Center",
              team: "业务组",
              env: "Production",
              status: "开发中",
              owner: "Kevin",
            },
          ],
          null,
          2,
        ),
      },
    },
  ];
}

/**
 * 创建权限页的内容区组件。
 */
function createAuthContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "auth-breadcrumb-1", label: "后台系统" },
          { id: "auth-breadcrumb-2", label: "权限中心" },
          { id: "auth-breadcrumb-3", label: "角色授权" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "权限中心",
        subtitle: "按角色查看权限范围、待处理申请和关键成员分布。",
        tagsText: "后台,权限,角色",
        extraText: "今日新增 5 条申请",
      },
    },
    createPlainTwoColumn(
      [
        {
          type: "list",
          props: {
            items: [
              {
                title: "平台管理员",
                titleLink: "",
                description: "拥有项目、发布、成员、审计的完整权限",
                avatar: "",
              },
              {
                title: "项目管理员",
                titleLink: "",
                description: "管理项目成员、环境配置和发布审批",
                avatar: "",
              },
              {
                title: "审计人员",
                titleLink: "",
                description: "仅查看日志、权限记录和敏感操作结果",
                avatar: "",
              },
            ],
          },
        },
      ],
      [
        {
          type: "cardGrid",
          props: {
            columns: 2,
            items: [
              {
                id: "auth-grid-1",
                title: "待处理申请",
                subtitle: "待审批",
                value: "12",
                extra: "其中高风险 3 条",
              },
              {
                id: "auth-grid-2",
                title: "角色数量",
                subtitle: "当前启用",
                value: "8",
                extra: "覆盖 3 条业务线",
              },
            ],
          },
        },
      ],
      {
        leftWidth: 430,
        gap: 16,
        minHeight: 220,
      },
    ),
    {
      type: "dataTable",
      props: {
        title: "成员授权列表",
        size: "middle",
        bordered: true,
        pagination: true,
        pageSize: 8,
        emptyText: "暂无授权记录",
        columnsText: JSON.stringify(
          [
            { title: "成员", dataIndex: "name" },
            { title: "角色", dataIndex: "role" },
            { title: "范围", dataIndex: "scope" },
            { title: "状态", dataIndex: "status" },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: "auth-row-1",
              name: "Mike He",
              role: "平台管理员",
              scope: "全局",
              status: "生效中",
            },
            {
              key: "auth-row-2",
              name: "Anna",
              role: "项目管理员",
              scope: "Workspace Console",
              status: "待复核",
            },
            {
              key: "auth-row-3",
              name: "Kevin",
              role: "审计人员",
              scope: "只读",
              status: "生效中",
            },
          ],
          null,
          2,
        ),
      },
    },
  ];
}

/**
 * 创建设置页的内容区组件。
 */
function createSettingContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "setting-breadcrumb-1", label: "后台系统" },
          { id: "setting-breadcrumb-2", label: "系统设置" },
          { id: "setting-breadcrumb-3", label: "基础配置" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "系统设置",
        subtitle: "集中维护平台名称、通知策略和默认发布配置。",
        tagsText: "后台,设置,配置",
        extraText: "设置变更后需重新发布",
      },
    },
    createPlainContainer(
      [
        createText("基础配置", "lg"),
        {
          type: "input",
          props: {
            title: "平台名称",
            placeholder: "请输入平台名称",
            text: "Codigo Admin Console",
          },
        },
        {
          type: "input",
          props: {
            title: "默认域名",
            placeholder: "请输入默认域名",
            text: "admin.codigo.local",
          },
        },
        {
          type: "radio",
          props: {
            title: "默认发布环境",
            defaultRadio: "prod",
            options: [
              { id: "prod", value: "Production" },
              { id: "staging", value: "Staging" },
            ],
          },
        },
        {
          type: "checkbox",
          props: {
            title: "通知方式",
            defaultChecked: ["mail", "bot"],
            options: [
              { id: "mail", value: "邮件通知" },
              { id: "sms", value: "短信提醒" },
              { id: "bot", value: "机器人通知" },
            ],
          },
        },
      ],
      {
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderRadius: 24,
        padding: 20,
        minHeight: 420,
      },
    ),
  ];
}

/**
 * 创建带统一后台壳子的页面模板。
 */
function createShellPage(
  name: string,
  path: string,
  sectionHint: string,
  content: TemplateComponent[],
): TemplatePagePreset {
  const topBarHeight = 64;

  return {
    name,
    path,
    components: [
      createPlainTwoColumn(
        [
          place(createSidebar(path), {
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          }),
        ],
        [
          place(
            createPlainContainer(
              [
                place(createTopBar(name, sectionHint), {
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: topBarHeight,
                }),
                place(
                  createPlainContainer(content, {
                    backgroundColor: "#f1f5f9",
                    borderColor: "transparent",
                    borderRadius: 0,
                    padding: 24,
                    minHeight: CANVAS_HEIGHT - topBarHeight,
                  }),
                  {
                    left: 0,
                    top: topBarHeight,
                    width: "100%",
                    height: CANVAS_HEIGHT - topBarHeight,
                  },
                ),
              ],
              {
                backgroundColor: "transparent",
                borderColor: "transparent",
                borderRadius: 0,
                padding: 0,
                minHeight: CANVAS_HEIGHT,
              },
            ),
            {
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
            },
          ),
        ],
        {
          leftWidth: SIDEBAR_WIDTH,
          gap: 20,
          minHeight: CANVAS_HEIGHT - 64,
          backgroundColor: "#f8fafc",
          styles: {
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          },
        },
      ),
    ],
  };
}

/**
 * 创建通用后台多页面模板。
 */
export function createAdminConsoleTemplate(): TemplatePreset {
  return {
    key: "admin-console-workspace",
    name: "通用后台管理模板",
    desc: "提供左侧导航、顶部用户区和多页面内容区的常规后台骨架，适合作为管理系统模板起点。",
    tags: ["后台管理", "多页面", "PC"],
    pageTitle: "Codigo Admin Console",
    pageCategory: "admin",
    layoutMode: "absolute",
    deviceType: "pc",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    activePagePath: "home",
    pages: [
      createShellPage("Overview", "home", "业务总览与运行概况", createOverviewContent()),
      createShellPage("Project", "project", "项目列表与团队分工", createProjectContent()),
      createShellPage("Auth", "auth", "角色授权与权限审计", createAuthContent()),
      createShellPage("Setting", "setting", "平台配置与发布策略", createSettingContent()),
    ],
  };
}
