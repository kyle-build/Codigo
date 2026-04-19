import type { TemplateComponent, TemplatePagePreset, TemplatePreset } from '@codigo/schema';

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1560;

function withStyles(
  component: TemplateComponent,
  styles?: Record<string, unknown>,
): TemplateComponent {
  if (!styles) return component;
  return { ...component, styles: { ...(component.styles ?? {}), ...styles } };
}

function createContainer(options: {
  children: TemplateComponent[];
  backgroundColor: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  minHeight?: number;
  styles?: Record<string, unknown>;
}): TemplateComponent {
  return withStyles(
    {
      type: 'container',
      props: {
        title: '',
        showChrome: false,
        backgroundColor: options.backgroundColor,
        borderColor: options.borderColor ?? 'transparent',
        borderRadius: options.borderRadius ?? 0,
        padding: options.padding ?? 0,
        minHeight: options.minHeight ?? 0,
      },
      children: options.children,
    },
    options.styles,
  );
}

function createCard(children: TemplateComponent[], styles?: Record<string, unknown>) {
  return createContainer({
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    minHeight: 0,
    children,
    styles,
  });
}

function createAdminContentPage(options: {
  name: string;
  path: string;
  breadcrumb: { id: string; label: string }[];
  header: { title: string; subtitle: string; tagsText: string; extraText: string };
  content: TemplateComponent[];
}): TemplatePagePreset {
  const page = createContainer({
    backgroundColor: '#f8fafc',
    padding: 24,
    minHeight: CANVAS_HEIGHT,
    children: [
      withStyles(
        { type: 'breadcrumbBar', props: { items: options.breadcrumb, separator: '/' } },
        { marginBottom: 12 },
      ),
      withStyles(
        {
          type: 'pageHeader',
          props: {
            title: options.header.title,
            subtitle: options.header.subtitle,
            tagsText: options.header.tagsText,
            extraText: options.header.extraText,
          },
        },
        { marginBottom: 16 },
      ),
      ...options.content,
    ],
  });

  return {
    name: options.name,
    path: options.path,
    components: [
      withStyles(page, {
        width: '100%',
        minHeight: `${CANVAS_HEIGHT}px`,
        position: 'absolute',
        left: 0,
        top: 0,
      }),
    ],
  };
}

function createOverviewPage(): TemplatePagePreset {
  const trendData = [
    { month: 'Jan', value: 3.2 },
    { month: 'Feb', value: 4.1 },
    { month: 'Mar', value: 3.6 },
    { month: 'Apr', value: 4.8 },
    { month: 'May', value: 4.0 },
    { month: 'Jun', value: 5.4 },
    { month: 'Jul', value: 4.9 },
    { month: 'Aug', value: 5.8 },
    { month: 'Sep', value: 5.2 },
    { month: 'Oct', value: 6.4 },
    { month: 'Nov', value: 5.9 },
    { month: 'Dec', value: 6.8 },
  ];

  const sourceData = [
    { name: '直接访问', value: 46358 },
    { name: '站内推荐', value: 18220 },
    { name: '自然搜索', value: 13840 },
    { name: '外部链接', value: 8640 },
  ];

  const deptData = [
    { name: '客服中心', value: 1280 },
    { name: '订单履约', value: 1040 },
    { name: '采购审批', value: 860 },
    { name: '仓储调度', value: 790 },
    { name: '财务结算', value: 640 },
    { name: '人事服务', value: 420 },
  ];

  const chartRow = withStyles(
    {
      type: 'twoColumn',
      props: {
        title: '',
        showChrome: false,
        leftWidth: 720,
        gap: 16,
        minHeight: 320,
        backgroundColor: 'transparent',
      },
      children: [
        {
          ...createCard([
            {
              type: 'lineChart',
              props: {
                title: '业务趋势（本年）',
                dataText: JSON.stringify(trendData, null, 2),
                xAxisKey: 'month',
                yAxisKey: 'value',
                nameKey: 'month',
                valueKey: 'value',
                color: '#2563eb',
                optionText: JSON.stringify(
                  {
                    grid: {
                      left: 44,
                      right: 18,
                      top: 56,
                      bottom: 30,
                      containLabel: true,
                    },
                    yAxis: { splitLine: { lineStyle: { color: '#eef2f7' } } },
                  },
                  null,
                  2,
                ),
              },
            },
          ]),
          slot: 'left',
        },
        {
          ...createCard([
            {
              type: 'pieChart',
              props: {
                title: '访问来源占比',
                dataText: JSON.stringify(sourceData, null, 2),
                xAxisKey: 'name',
                yAxisKey: 'value',
                nameKey: 'name',
                valueKey: 'value',
                color: '#16a34a',
              },
            },
          ]),
          slot: 'right',
        },
      ],
    },
    { marginBottom: 16 },
  );

  const barCard = withStyles(
    createCard([
      {
        type: 'barChart',
        props: {
          title: '部门处理量',
          dataText: JSON.stringify(deptData, null, 2),
          xAxisKey: 'name',
          yAxisKey: 'value',
          nameKey: 'name',
          valueKey: 'value',
          color: '#7c3aed',
          optionText: JSON.stringify(
            {
              grid: { left: 44, right: 18, top: 56, bottom: 30, containLabel: true },
              yAxis: { splitLine: { lineStyle: { color: '#eef2f7' } } },
            },
            null,
            2,
          ),
        },
      },
    ]),
    { marginBottom: 16 },
  );

  const table = createCard([
    {
      type: 'dataTable',
      props: {
        title: '最近操作',
        pagination: false,
        bordered: true,
        size: 'middle',
        pageSize: 10,
        emptyText: '暂无数据',
        columnsText: JSON.stringify(
          [
            { title: '时间', dataIndex: 'time' },
            { title: '操作者', dataIndex: 'operator' },
            { title: '动作', dataIndex: 'action' },
            { title: '结果', dataIndex: 'result' },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: 'op_1',
              time: '2026-04-19 10:21',
              operator: 'Super Admin',
              action: '发布应用配置',
              result: '成功',
            },
            {
              key: 'op_2',
              time: '2026-04-19 09:48',
              operator: '运营-小王',
              action: '更新用户权限',
              result: '成功',
            },
            {
              key: 'op_3',
              time: '2026-04-18 18:02',
              operator: '研发-小李',
              action: '同步数据源',
              result: '部分失败',
            },
          ],
          null,
          2,
        ),
      },
    },
  ]);

  return createAdminContentPage({
    name: '概览',
    path: '/overview',
    breadcrumb: [
      { id: 'bc-home', label: '后台' },
      { id: 'bc-dashboard', label: '概览' },
    ],
    header: {
      title: '运营概览',
      subtitle: '核心指标、趋势与最近操作一屏聚合，适合作为后台系统默认首页。',
      tagsText: 'Dashboard,运营,总览',
      extraText: '数据更新时间：今天 10:30',
    },
    content: [
      withStyles(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              { id: 'kpi-1', title: '访问量', subtitle: '今日', value: '12,840', extra: '较昨日 +8.2%' },
              { id: 'kpi-2', title: '活跃用户', subtitle: '今日', value: '2,135', extra: '新增 219' },
              { id: 'kpi-3', title: '待处理', subtitle: '工单', value: '38', extra: '高优先级 6' },
              { id: 'kpi-4', title: '转化率', subtitle: '本周', value: '4.8%', extra: '环比 +0.3%' },
            ],
          },
        },
        { marginBottom: 16 },
      ),
      chartRow,
      barCard,
      table,
    ],
  });
}

function createUsersPage(): TemplatePagePreset {
  return createAdminContentPage({
    name: '用户管理',
    path: '/users',
    breadcrumb: [
      { id: 'bc-home', label: '后台' },
      { id: 'bc-users', label: '用户管理' },
    ],
    header: {
      title: '用户管理',
      subtitle: '支持按关键词、角色、状态快速筛选，并查看用户最新登录与更新时间。',
      tagsText: 'RBAC,用户,列表页',
      extraText: '最近更新：今天 09:50',
    },
    content: [
      withStyles(
        {
          type: 'queryFilter',
          props: {
            columns: 4,
            searchText: '搜索',
            resetText: '重置',
            showSearchButton: true,
            showResetButton: true,
            fields: [
              {
                id: 'q-user-keyword',
                label: '关键词',
                field: 'keyword',
                type: 'input',
                placeholder: '请输入姓名/邮箱',
                optionsText: '',
              },
              {
                id: 'q-user-role',
                label: '角色',
                field: 'role',
                type: 'select',
                placeholder: '请选择角色',
                optionsText: '全部,SUPER_ADMIN,ADMIN,USER',
              },
              {
                id: 'q-user-status',
                label: '状态',
                field: 'status',
                type: 'select',
                placeholder: '请选择状态',
                optionsText: '全部,启用,禁用',
              },
            ],
          },
        },
        { marginBottom: 16 },
      ),
      createCard([
        {
          type: 'dataTable',
          props: {
            title: '用户列表',
            pagination: true,
            pageSize: 10,
            bordered: true,
            size: 'middle',
            emptyText: '暂无数据',
            columnsText: JSON.stringify(
              [
                { title: 'ID', dataIndex: 'id' },
                { title: '姓名', dataIndex: 'name' },
                { title: '邮箱', dataIndex: 'email' },
                { title: '角色', dataIndex: 'role' },
                { title: '状态', dataIndex: 'status' },
                { title: '最近登录', dataIndex: 'lastLogin' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                {
                  key: 'u_1',
                  id: 1,
                  name: '小黑',
                  email: 'xiaohei@demo.local',
                  role: 'SUPER_ADMIN',
                  status: '启用',
                  lastLogin: '2026-04-19 09:41',
                },
                {
                  key: 'u_2',
                  id: 2,
                  name: '运营-小王',
                  email: 'ops.wang@demo.local',
                  role: 'ADMIN',
                  status: '启用',
                  lastLogin: '2026-04-19 08:12',
                },
                {
                  key: 'u_3',
                  id: 3,
                  name: '访客-小赵',
                  email: 'guest.zhao@demo.local',
                  role: 'USER',
                  status: '禁用',
                  lastLogin: '2026-04-17 16:05',
                },
              ],
              null,
              2,
            ),
          },
        },
      ]),
    ],
  });
}

function createProjectsPage(): TemplatePagePreset {
  return createAdminContentPage({
    name: '项目中心',
    path: '/projects',
    breadcrumb: [
      { id: 'bc-home', label: '后台' },
      { id: 'bc-projects', label: '项目中心' },
    ],
    header: {
      title: '项目中心',
      subtitle: '统一管理应用/页面/流程资产，适合做后台系统的核心列表页。',
      tagsText: '项目,资产,列表页',
      extraText: '最近更新：昨天 18:30',
    },
    content: [
      withStyles(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              { id: 'p-kpi-1', title: '项目总数', subtitle: '全部', value: '28', extra: '本周新增 2' },
              { id: 'p-kpi-2', title: '运行中', subtitle: '环境', value: '16', extra: '异常 0' },
              { id: 'p-kpi-3', title: '待发布', subtitle: '版本', value: '5', extra: '待审批 1' },
              { id: 'p-kpi-4', title: '资源占用', subtitle: '存储', value: '3.2GB', extra: '近7天 +0.4GB' },
            ],
          },
        },
        { marginBottom: 16 },
      ),
      withStyles(
        {
          type: 'queryFilter',
          props: {
            columns: 4,
            searchText: '搜索',
            resetText: '重置',
            showSearchButton: true,
            showResetButton: true,
            fields: [
              {
                id: 'q-project-keyword',
                label: '关键词',
                field: 'keyword',
                type: 'input',
                placeholder: '请输入项目名称',
                optionsText: '',
              },
              {
                id: 'q-project-status',
                label: '状态',
                field: 'status',
                type: 'select',
                placeholder: '请选择状态',
                optionsText: '全部,运行中,已停用,草稿',
              },
            ],
          },
        },
        { marginBottom: 16 },
      ),
      createCard([
        {
          type: 'dataTable',
          props: {
            title: '项目列表',
            pagination: true,
            pageSize: 10,
            bordered: true,
            size: 'middle',
            emptyText: '暂无数据',
            columnsText: JSON.stringify(
              [
                { title: '项目', dataIndex: 'name' },
                { title: '负责人', dataIndex: 'owner' },
                { title: '状态', dataIndex: 'status' },
                { title: '版本', dataIndex: 'version' },
                { title: '更新时间', dataIndex: 'updatedAt' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                {
                  key: 'p_1',
                  name: '通用后台（主站）',
                  owner: '小黑',
                  status: '运行中',
                  version: 'v1.3.2',
                  updatedAt: '2026-04-18 16:22',
                },
                {
                  key: 'p_2',
                  name: '用户中心',
                  owner: '运营-小王',
                  status: '草稿',
                  version: 'v0.9.0',
                  updatedAt: '2026-04-18 11:08',
                },
                {
                  key: 'p_3',
                  name: '审批台',
                  owner: '研发-小李',
                  status: '已停用',
                  version: 'v1.0.0',
                  updatedAt: '2026-04-12 09:30',
                },
              ],
              null,
              2,
            ),
          },
        },
      ]),
    ],
  });
}

function createSettingsPage(): TemplatePagePreset {
  return createAdminContentPage({
    name: '系统设置',
    path: '/settings',
    breadcrumb: [
      { id: 'bc-home', label: '后台' },
      { id: 'bc-settings', label: '系统设置' },
    ],
    header: {
      title: '系统设置',
      subtitle: '示例表单页：基础信息、登录策略与通知配置。',
      tagsText: '设置,表单页,配置',
      extraText: '最近保存：未保存',
    },
    content: [
      createCard(
        [
          {
            type: 'input',
            props: {
              title: '组织名称',
              placeholder: '请输入组织名称',
              text: 'Codigo Studio',
            },
          },
          {
            type: 'input',
            props: {
              title: '默认域名',
              placeholder: '例如 admin.example.com',
              text: 'admin.demo.local',
            },
          },
          {
            type: 'radio',
            props: {
              title: '登录方式',
              defaultRadio: 'password',
              options: [
                { id: 'password', value: '账号密码' },
                { id: 'sms', value: '短信验证码' },
                { id: 'sso', value: 'SSO' },
              ],
            },
          },
          {
            type: 'checkbox',
            props: {
              title: '通知策略',
              defaultChecked: ['email'],
              options: [
                { id: 'email', value: '邮件通知' },
                { id: 'sms', value: '短信通知' },
                { id: 'webhook', value: 'Webhook' },
              ],
            },
          },
          withStyles(
            {
              type: 'button',
              props: {
                text: '保存设置',
                type: 'primary',
                size: 'middle',
                danger: false,
                active: false,
                block: false,
                actionType: 'none',
              },
            },
            { marginLeft: 16, marginBottom: 8 },
          ),
        ],
        { padding: 0 },
      ),
    ],
  });
}

function placeAbs(
  component: TemplateComponent,
  options: {
    left: number;
    top: number;
    width?: number | string;
    height?: number | string;
  },
): TemplateComponent {
  return withStyles(component, {
    position: 'absolute',
    left: options.left,
    top: options.top,
    ...(options.width !== undefined ? { width: options.width } : null),
    ...(options.height !== undefined ? { height: options.height } : null),
  });
}

function createStandardOverviewPage(): TemplatePagePreset {
  const revenueData = [
    { month: 'Jan', value: 3.2 },
    { month: 'Feb', value: 4.1 },
    { month: 'Mar', value: 3.6 },
    { month: 'Apr', value: 4.8 },
    { month: 'May', value: 4.0 },
    { month: 'Jun', value: 5.4 },
  ];
  const breakupData = [
    { name: 'Direct', value: 46358 },
    { name: 'Referral', value: 18220 },
    { name: 'Search', value: 13840 },
    { name: 'External', value: 8640 },
  ];

  return {
    name: '运营概览',
    path: '/overview',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'overview-breadcrumb-1', label: 'Home' },
              { id: 'overview-breadcrumb-2', label: 'Dashboard' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 'calc(100% - 48px)', height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: 'Dashboard',
            subtitle: '关键指标概览、趋势与区域分布',
            tagsText: 'admin,overview',
            extraText: '更新于今天',
          },
        },
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 140 },
      ),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              {
                id: 'overview-stat-1',
                title: 'Open invoices',
                subtitle: 'Total',
                value: '$35,548',
                extra: '+1.4% since last month',
              },
              {
                id: 'overview-stat-2',
                title: 'Ongoing project',
                subtitle: 'Active',
                value: '15',
                extra: '+2.5% since last month',
              },
              {
                id: 'overview-stat-3',
                title: 'Employees',
                subtitle: 'Current',
                value: '25',
                extra: '+2.3% since last month',
              },
              {
                id: 'overview-stat-4',
                title: 'New profit',
                subtitle: 'Monthly',
                value: '27%',
                extra: '+4.5% since last month',
              },
            ],
          },
        },
        { left: 24, top: 238, width: 'calc(100% - 48px)', height: 140 },
      ),
      placeAbs(
        {
          type: 'barChart',
          props: {
            title: 'Revenue report',
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
                yAxis: { splitLine: { lineStyle: { color: '#eef2f7' } } },
              },
              null,
              2,
            ),
            xAxisKey: 'month',
            yAxisKey: 'value',
            nameKey: 'month',
            valueKey: 'value',
            color: '#2563eb',
          },
          styles: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: 8,
            boxSizing: 'border-box',
          },
        },
        { left: 24, top: 394, width: 820, height: 320 },
      ),
      placeAbs(
        {
          type: 'pieChart',
          props: {
            title: 'Yearly breakup',
            dataText: JSON.stringify(breakupData, null, 2),
            optionText: JSON.stringify(
              {
                legend: { bottom: 8 },
                series: [
                  {
                    radius: ['54%', '78%'],
                    label: { show: false },
                  },
                ],
              },
              null,
              2,
            ),
            xAxisKey: 'name',
            yAxisKey: 'value',
            nameKey: 'name',
            valueKey: 'value',
            color: '#2563eb',
          },
          styles: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: 8,
            boxSizing: 'border-box',
          },
        },
        { left: 860, top: 394, width: 396, height: 320 },
      ),
      placeAbs(
        {
          type: 'dataTable',
          props: {
            title: 'Recent activities',
            size: 'middle',
            bordered: true,
            pagination: false,
            pageSize: 8,
            emptyText: '暂无数据',
            columnsText: JSON.stringify(
              [
                { title: 'Action', dataIndex: 'action' },
                { title: 'Owner', dataIndex: 'owner' },
                { title: 'Time', dataIndex: 'time' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                { key: 'act-1', action: '发布成功', owner: 'Mike', time: '10:12' },
                { key: 'act-2', action: '成员加入', owner: 'Anna', time: '09:30' },
                { key: 'act-3', action: '权限变更', owner: 'Kevin', time: '昨天' },
              ],
              null,
              2,
            ),
          },
          styles: {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: 0,
            boxSizing: 'border-box',
          },
        },
        { left: 24, top: 730, width: 'calc(100% - 48px)', height: 246 },
      ),
    ],
  };
}

function createStandardProjectsPage(): TemplatePagePreset {
  return {
    name: '项目中心',
    path: '/projects',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'projects-breadcrumb-1', label: '后台系统' },
              { id: 'projects-breadcrumb-2', label: '项目中心' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 'calc(100% - 48px)', height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '项目中心',
            subtitle: '统一查看项目归属、环境状态和最近一次交付结果。',
            tagsText: 'admin,project',
            extraText: '共 32 个项目',
          },
        },
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 140 },
      ),
      placeAbs(
        {
          type: 'queryFilter',
          props: {
            columns: 4,
            searchText: '搜索',
            resetText: '重置',
            showSearchButton: true,
            showResetButton: true,
            fields: [
              {
                id: 'project-filter-1',
                label: '项目名称',
                field: 'keyword',
                type: 'input',
                placeholder: '请输入项目名称',
                optionsText: '',
              },
              {
                id: 'project-filter-2',
                label: '所属团队',
                field: 'team',
                type: 'select',
                placeholder: '请选择团队',
                optionsText: '全部,平台组,中台组,业务组',
              },
              {
                id: 'project-filter-3',
                label: '当前状态',
                field: 'status',
                type: 'select',
                placeholder: '请选择状态',
                optionsText: '全部,开发中,待上线,运行中',
              },
            ],
          },
        },
        { left: 24, top: 238, width: 'calc(100% - 48px)', height: 120 },
      ),
      placeAbs(
        {
          type: 'dataTable',
          props: {
            title: '项目清单',
            size: 'middle',
            bordered: true,
            pagination: true,
            pageSize: 8,
            emptyText: '暂无项目数据',
            columnsText: JSON.stringify(
              [
                { title: '项目', dataIndex: 'name' },
                { title: '团队', dataIndex: 'team' },
                { title: '环境', dataIndex: 'env' },
                { title: '状态', dataIndex: 'status' },
                { title: '负责人', dataIndex: 'owner' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                {
                  key: 'project-row-1',
                  name: 'Workspace Console',
                  team: '平台组',
                  env: 'Production',
                  status: '运行中',
                  owner: 'Mike He',
                },
                {
                  key: 'project-row-2',
                  name: 'Auth Portal',
                  team: '中台组',
                  env: 'Staging',
                  status: '待上线',
                  owner: 'Olivia',
                },
                {
                  key: 'project-row-3',
                  name: 'Setting Center',
                  team: '业务组',
                  env: 'Production',
                  status: '开发中',
                  owner: 'Kevin',
                },
              ],
              null,
              2,
            ),
          },
        },
        { left: 24, top: 374, width: 'calc(100% - 48px)', height: 602 },
      ),
    ],
  };
}

function createStandardUsersPage(): TemplatePagePreset {
  return {
    name: '用户管理',
    path: '/users',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'users-breadcrumb-1', label: '后台系统' },
              { id: 'users-breadcrumb-2', label: '用户管理' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 'calc(100% - 48px)', height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '用户管理',
            subtitle: '统一管理账号、角色与状态。',
            tagsText: 'admin,user',
            extraText: '共 128 个成员',
          },
        },
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 140 },
      ),
      placeAbs(
        {
          type: 'dataTable',
          props: {
            title: '成员列表',
            size: 'middle',
            bordered: true,
            pagination: true,
            pageSize: 10,
            emptyText: '暂无成员数据',
            columnsText: JSON.stringify(
              [
                { title: 'ID', dataIndex: 'id' },
                { title: 'Name', dataIndex: 'name' },
                { title: 'Role', dataIndex: 'role' },
                { title: 'Status', dataIndex: 'status' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                { id: 1, name: 'Alice', role: 'Admin', status: 'Active' },
                { id: 2, name: 'Bob', role: 'User', status: 'Active' },
                { id: 3, name: 'Carol', role: 'User', status: 'Pending' },
              ],
              null,
              2,
            ),
          },
        },
        { left: 24, top: 238, width: 'calc(100% - 48px)', height: 738 },
      ),
    ],
  };
}

function createStandardSettingsPage(): TemplatePagePreset {
  return {
    name: '系统设置',
    path: '/settings',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'setting-breadcrumb-1', label: '后台系统' },
              { id: 'setting-breadcrumb-2', label: '系统设置' },
              { id: 'setting-breadcrumb-3', label: '基础配置' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 'calc(100% - 48px)', height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '系统设置',
            subtitle: '集中维护平台名称、通知策略和默认发布配置。',
            tagsText: 'admin,setting',
            extraText: '设置变更后需重新发布',
          },
        },
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 140 },
      ),
      placeAbs(
        {
          type: 'titleText',
          props: { title: '基础配置', size: 'lg' },
        },
        { left: 24, top: 238, width: 320, height: 40 },
      ),
      placeAbs(
        withStyles(
          {
            type: 'input',
            props: {
              title: '平台名称',
              placeholder: '请输入平台名称',
              text: 'Codigo Admin Console',
            },
          },
          {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 12,
            boxSizing: 'border-box',
          },
        ),
        { left: 24, top: 288, width: 560, height: 56 },
      ),
      placeAbs(
        withStyles(
          {
            type: 'input',
            props: {
              title: '默认域名',
              placeholder: '请输入默认域名',
              text: 'admin.codigo.local',
            },
          },
          {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 12,
            boxSizing: 'border-box',
          },
        ),
        { left: 24, top: 356, width: 560, height: 56 },
      ),
      placeAbs(
        withStyles(
          {
            type: 'radio',
            props: {
              title: '默认发布环境',
              defaultRadio: 'prod',
              options: [
                { id: 'prod', value: 'Production' },
                { id: 'staging', value: 'Staging' },
              ],
            },
          },
          {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 12,
            boxSizing: 'border-box',
          },
        ),
        { left: 24, top: 424, width: 560, height: 68 },
      ),
      placeAbs(
        withStyles(
          {
            type: 'checkbox',
            props: {
              title: '通知方式',
              defaultChecked: ['mail', 'bot'],
              options: [
                { id: 'mail', value: '邮件通知' },
                { id: 'sms', value: '短信提醒' },
                { id: 'bot', value: '机器人通知' },
              ],
            },
          },
          {
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: 12,
            boxSizing: 'border-box',
          },
        ),
        { left: 24, top: 504, width: 560, height: 92 },
      ),
    ],
  };
}

function createToolbarButton(
  text: string,
  left: number,
  top: number,
  width: number,
  type: 'primary' | 'default' = 'default',
): TemplateComponent {
  return placeAbs(
    {
      type: 'button',
      props: {
        text,
        type,
        size: 'middle',
        danger: false,
        active: type === 'primary',
        block: false,
        actionType: 'none',
      },
    },
    { left, top, width, height: 44 },
  );
}

function createShellCard(options: {
  left: number;
  top: number;
  width: number | string;
  height: number;
  children: TemplateComponent[];
  padding?: number;
}): TemplateComponent {
  return placeAbs(
    createContainer({
      backgroundColor: '#ffffff',
      borderColor: '#eef1f6',
      borderRadius: 28,
      padding: options.padding ?? 20,
      minHeight: options.height,
      children: options.children,
    }),
    {
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
    },
  );
}

function createVuesticDashboardPage(): TemplatePagePreset {
  const revenueData = [
    { month: 'Jan', value: 42 },
    { month: 'Feb', value: 48 },
    { month: 'Mar', value: 46 },
    { month: 'Apr', value: 58 },
    { month: 'May', value: 61 },
    { month: 'Jun', value: 64 },
    { month: 'Jul', value: 68 },
    { month: 'Aug', value: 74 },
    { month: 'Sep', value: 70 },
    { month: 'Oct', value: 79 },
    { month: 'Nov', value: 83 },
    { month: 'Dec', value: 88 },
  ];
  const breakupData = [
    { name: 'Profit', value: 36358 },
    { name: 'Expenses', value: 17820 },
    { name: 'Taxes', value: 12480 },
  ];
  const monthlyData = [
    { month: 'W1', value: 18 },
    { month: 'W2', value: 24 },
    { month: 'W3', value: 21 },
    { month: 'W4', value: 28 },
  ];
  const regionRows = [
    { key: 'r1', region: 'Japan', revenue: '$4,748,454' },
    { key: 'r2', region: 'United Kingdom', revenue: '$405,748' },
    { key: 'r3', region: 'United States', revenue: '$308,536' },
    { key: 'r4', region: 'China', revenue: '$250,963' },
    { key: 'r5', region: 'Canada', revenue: '$29,415' },
    { key: 'r6', region: 'Australia', revenue: '$15,000' },
    { key: 'r7', region: 'India', revenue: '$10,000' },
  ];
  const timelineItems = [
    {
      title: 'Donald updated Refund #1234',
      description: 'Status changed to awaiting customer response · 25m ago',
      avatar: '',
      titleLink: '',
    },
    {
      title: 'Lycy Peterson joined Overtake',
      description: 'New collaborator added to group · 1h ago',
      avatar: '',
      titleLink: '',
    },
    {
      title: 'Joseph Rust opened Mannat #112233',
      description: 'Theme market showcase created · 2h ago',
      avatar: '',
      titleLink: '',
    },
    {
      title: 'Donald updated a pending ticket',
      description: 'Awaiting customer response · 3d ago',
      avatar: '',
      titleLink: '',
    },
  ];

  return {
    name: 'Dashboard',
    path: 'dashboard',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'dashboard-home', label: 'Home' },
              { id: 'dashboard-current', label: 'Dashboard' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 320, height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: 'Dashboard',
            subtitle: 'Revenue Report · Jan 2026',
            tagsText: 'Revenue, Admin, Analytics',
            extraText: '$165,228.00 total earnings',
          },
        },
        { left: 24, top: 92, width: 720, height: 168 },
      ),
      createToolbarButton('Today', 968, 126, 92, 'primary'),
      createToolbarButton('Week', 1068, 126, 92),
      createToolbarButton('Month', 1168, 126, 92),
      createToolbarButton('Export', 1280, 126, 120),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              {
                id: 'dash-stat-1',
                title: 'Total earnings',
                subtitle: 'Revenue report',
                value: '$165,228',
                extra: 'This month $87,862',
              },
              {
                id: 'dash-stat-2',
                title: 'Open invoices',
                subtitle: 'Outstanding',
                value: '$35,548',
                extra: 'Down $1,450 since last month',
              },
              {
                id: 'dash-stat-3',
                title: 'Ongoing project',
                subtitle: 'In progress',
                value: '15',
                extra: 'Up 25.36% since last month',
              },
              {
                id: 'dash-stat-4',
                title: 'Employees',
                subtitle: 'Current team',
                value: '25',
                extra: 'New profit increased 4%',
              },
            ],
          },
        },
        { left: 24, top: 292, width: 1392, height: 182 },
      ),
      createShellCard({
        left: 24,
        top: 500,
        width: 760,
        height: 380,
        children: [
          {
            type: 'lineChart',
            props: {
              title: 'Revenue Report',
              dataText: JSON.stringify(revenueData, null, 2),
              xAxisKey: 'month',
              yAxisKey: 'value',
              nameKey: 'month',
              valueKey: 'value',
              color: '#6f52ed',
              optionText: JSON.stringify(
                {
                  grid: { left: 36, right: 16, top: 56, bottom: 24, containLabel: true },
                  tooltip: { trigger: 'axis' },
                  xAxis: {
                    axisLine: { lineStyle: { color: '#d8dcea' } },
                    axisLabel: { color: '#7a839f' },
                  },
                  yAxis: {
                    splitLine: { lineStyle: { color: '#eef1f6' } },
                    axisLabel: { color: '#7a839f' },
                  },
                  series: [{ areaStyle: { color: 'rgba(111,82,237,0.16)' } }],
                },
                null,
                2,
              ),
            },
            styles: { width: '100%', height: 332 },
          },
        ],
      }),
      createShellCard({
        left: 808,
        top: 500,
        width: 288,
        height: 380,
        children: [
          {
            type: 'pieChart',
            props: {
              title: 'Yearly Breakup',
              dataText: JSON.stringify(breakupData, null, 2),
              xAxisKey: 'name',
              yAxisKey: 'value',
              nameKey: 'name',
              valueKey: 'value',
              color: '#7a5af8',
              optionText: JSON.stringify(
                {
                  legend: { bottom: 0, textStyle: { color: '#7a839f' } },
                  series: [{ radius: ['56%', '78%'] }],
                },
                null,
                2,
              ),
            },
            styles: { width: '100%', height: 332 },
          },
        ],
      }),
      createShellCard({
        left: 1120,
        top: 500,
        width: 296,
        height: 380,
        children: [
          {
            type: 'barChart',
            props: {
              title: 'Monthly Earnings',
              dataText: JSON.stringify(monthlyData, null, 2),
              xAxisKey: 'month',
              yAxisKey: 'value',
              nameKey: 'month',
              valueKey: 'value',
              color: '#22c55e',
              optionText: JSON.stringify(
                {
                  grid: { left: 28, right: 12, top: 56, bottom: 20, containLabel: true },
                  xAxis: { axisLabel: { color: '#7a839f' } },
                  yAxis: {
                    splitLine: { lineStyle: { color: '#eef1f6' } },
                    axisLabel: { color: '#7a839f' },
                  },
                },
                null,
                2,
              ),
            },
            styles: { width: '100%', height: 332 },
          },
        ],
      }),
      createShellCard({
        left: 24,
        top: 908,
        width: 700,
        height: 332,
        children: [
          {
            type: 'dataTable',
            props: {
              title: 'Revenue by Top Regions',
              size: 'middle',
              bordered: false,
              pagination: false,
              pageSize: 10,
              emptyText: 'No region data',
              columnsText: JSON.stringify(
                [
                  { title: 'Top Region', dataIndex: 'region' },
                  { title: 'Revenue', dataIndex: 'revenue' },
                ],
                null,
                2,
              ),
              dataText: JSON.stringify(regionRows, null, 2),
            },
            styles: { width: '100%', height: 284 },
          },
        ],
      }),
      createShellCard({
        left: 748,
        top: 908,
        width: 668,
        height: 332,
        children: [
          {
            type: 'list',
            props: {
              items: timelineItems,
            },
            styles: { width: '100%', height: 260 },
          },
        ],
      }),
      createShellCard({
        left: 24,
        top: 1268,
        width: 1392,
        height: 250,
        children: [
          {
            type: 'dataTable',
            props: {
              title: 'Projects',
              size: 'middle',
              bordered: false,
              pagination: false,
              pageSize: 8,
              emptyText: 'No projects',
              columnsText: JSON.stringify(
                [
                  { title: 'Project', dataIndex: 'name' },
                  { title: 'Owner', dataIndex: 'owner' },
                  { title: 'Status', dataIndex: 'status' },
                  { title: 'Updated', dataIndex: 'updatedAt' },
                ],
                null,
                2,
              ),
              dataText: JSON.stringify(
                [
                  {
                    key: 'project-1',
                    name: 'Vuestic 2026 Console',
                    owner: 'Mike',
                    status: 'Live',
                    updatedAt: '25m ago',
                  },
                  {
                    key: 'project-2',
                    name: 'Overtake Workspace',
                    owner: 'Lycy Peterson',
                    status: 'In review',
                    updatedAt: '1h ago',
                  },
                  {
                    key: 'project-3',
                    name: 'Mannat Showcase',
                    owner: 'Joseph Rust',
                    status: 'Draft',
                    updatedAt: '2h ago',
                  },
                ],
                null,
                2,
              ),
            },
            styles: { width: '100%', height: 202 },
          },
        ],
      }),
    ],
  };
}

function createWorkspaceTablePage(options: {
  name: string;
  path: string;
  title: string;
  subtitle: string;
  extraText: string;
  metricItems: { id: string; title: string; subtitle: string; value: string; extra: string }[];
  filterFields: Array<{
    id: string;
    label: string;
    field: string;
    type: 'input' | 'select';
    placeholder: string;
    optionsText: string;
  }>;
  tableTitle: string;
  columns: Array<{ title: string; dataIndex: string }>;
  rows: Array<Record<string, unknown>>;
}): TemplatePagePreset {
  return {
    name: options.name,
    path: options.path,
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: `${options.path}-home`, label: 'Home' },
              { id: `${options.path}-workspace`, label: options.name },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 320, height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: options.title,
            subtitle: options.subtitle,
            tagsText: 'Workspace, Admin',
            extraText: options.extraText,
          },
        },
        { left: 24, top: 92, width: 960, height: 168 },
      ),
      createToolbarButton('Export', 1288, 126, 128, 'primary'),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: options.metricItems,
          },
        },
        { left: 24, top: 292, width: 1392, height: 182 },
      ),
      placeAbs(
        {
          type: 'queryFilter',
          props: {
            columns: 4,
            searchText: 'Search',
            resetText: 'Reset',
            showSearchButton: true,
            showResetButton: true,
            fields: options.filterFields,
          },
        },
        { left: 24, top: 500, width: 1392, height: 124 },
      ),
      placeAbs(
        {
          type: 'dataTable',
          props: {
            title: options.tableTitle,
            size: 'middle',
            bordered: false,
            pagination: true,
            pageSize: 10,
            emptyText: 'No records',
            columnsText: JSON.stringify(options.columns, null, 2),
            dataText: JSON.stringify(options.rows, null, 2),
          },
        },
        { left: 24, top: 652, width: 1392, height: 760 },
      ),
    ],
  };
}

function createSettingsFormPage(options: {
  name: string;
  path: string;
  title: string;
  subtitle: string;
  extraText: string;
  domainText: string;
  notifyDefaults: string[];
}): TemplatePagePreset {
  return {
    name: options.name,
    path: options.path,
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: `${options.path}-home`, label: 'Home' },
              { id: `${options.path}-settings`, label: 'Settings' },
              { id: `${options.path}-current`, label: options.name },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 420, height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: options.title,
            subtitle: options.subtitle,
            tagsText: 'Settings, Preferences',
            extraText: options.extraText,
          },
        },
        { left: 24, top: 92, width: 960, height: 168 },
      ),
      createShellCard({
        left: 24,
        top: 292,
        width: 820,
        height: 640,
        padding: 28,
        children: [
          {
            type: 'input',
            props: {
              title: 'Organization',
              placeholder: 'Enter organization name',
              text: 'Vuestic Admin',
            },
          },
          {
            type: 'input',
            props: {
              title: 'Default domain',
              placeholder: 'admin.example.com',
              text: options.domainText,
            },
          },
          {
            type: 'radio',
            props: {
              title: 'Theme mode',
              defaultRadio: 'light',
              options: [
                { id: 'light', value: 'Light' },
                { id: 'dark', value: 'Dark' },
                { id: 'system', value: 'System' },
              ],
            },
          },
          {
            type: 'checkbox',
            props: {
              title: 'Notifications',
              defaultChecked: options.notifyDefaults,
              options: [
                { id: 'email', value: 'Email alerts' },
                { id: 'sms', value: 'SMS alerts' },
                { id: 'slack', value: 'Slack digest' },
              ],
            },
          },
          {
            type: 'button',
            props: {
              text: 'Save settings',
              type: 'primary',
              size: 'middle',
              danger: false,
              active: true,
              block: false,
              actionType: 'none',
            },
            styles: { marginTop: 12, width: 160, height: 44 },
          },
        ],
      }),
      createShellCard({
        left: 872,
        top: 292,
        width: 544,
        height: 640,
        padding: 24,
        children: [
          {
            type: 'dataTable',
            props: {
              title: 'Recent configuration changes',
              size: 'middle',
              bordered: false,
              pagination: false,
              pageSize: 6,
              emptyText: 'No changes',
              columnsText: JSON.stringify(
                [
                  { title: 'Change', dataIndex: 'change' },
                  { title: 'Owner', dataIndex: 'owner' },
                  { title: 'Time', dataIndex: 'time' },
                ],
                null,
                2,
              ),
              dataText: JSON.stringify(
                [
                  { key: 'cfg-1', change: 'Theme tokens updated', owner: 'Mike', time: 'Today 09:12' },
                  { key: 'cfg-2', change: 'Security policy changed', owner: 'Olivia', time: 'Yesterday' },
                  { key: 'cfg-3', change: 'Notification routing edited', owner: 'Kevin', time: 'Apr 18' },
                ],
                null,
                2,
              ),
            },
            styles: { width: '100%', height: 592 },
          },
        ],
      }),
    ],
  };
}

function createFaqPage(): TemplatePagePreset {
  return {
    name: 'FAQ',
    path: 'support/faq',
    components: [
      placeAbs(
        {
          type: 'breadcrumbBar',
          props: {
            items: [
              { id: 'faq-home', label: 'Home' },
              { id: 'faq-support', label: 'Support' },
              { id: 'faq-current', label: 'FAQ' },
            ],
            separator: '/',
          },
        },
        { left: 24, top: 24, width: 360, height: 48 },
      ),
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: 'FAQ',
            subtitle: 'Common answers about dashboard setup, data sync and release workflow.',
            tagsText: 'Support, Docs',
            extraText: 'Updated this week',
          },
        },
        { left: 24, top: 92, width: 980, height: 168 },
      ),
      placeAbs(
        {
          type: 'dataTable',
          props: {
            title: 'Knowledge base',
            size: 'middle',
            bordered: false,
            pagination: false,
            pageSize: 8,
            emptyText: 'No FAQ entries',
            columnsText: JSON.stringify(
              [
                { title: 'Question', dataIndex: 'question' },
                { title: 'Answer', dataIndex: 'answer' },
                { title: 'Category', dataIndex: 'category' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                {
                  key: 'faq-1',
                  question: 'How do I publish a dashboard?',
                  answer: 'Use the top-right Publish action and verify the release visibility.',
                  category: 'Release',
                },
                {
                  key: 'faq-2',
                  question: 'How do I invite teammates?',
                  answer: 'Open the permissions module and add collaborators to the current page.',
                  category: 'Collaboration',
                },
                {
                  key: 'faq-3',
                  question: 'Why is data not updating?',
                  answer: 'Check API connectivity and confirm your latest data source sync succeeded.',
                  category: 'Data',
                },
              ],
              null,
              2,
            ),
          },
        },
        { left: 24, top: 292, width: 1392, height: 760 },
      ),
    ],
  };
}

function createHtmlBlock(
  content: string,
  styles?: Record<string, unknown>,
): TemplateComponent {
  return withStyles(
    {
      type: 'richText',
      props: {
        content,
      },
    },
    styles,
  );
}

function placeHtml(
  content: string,
  options: {
    left: number;
    top: number;
    width: number | string;
    height?: number | string;
    styles?: Record<string, unknown>;
  },
): TemplateComponent {
  return placeAbs(createHtmlBlock(content, options.styles), options);
}

function createReplicaPage(options: {
  name: string;
  path: string;
  height: number;
  children: TemplateComponent[];
}): TemplatePagePreset {
  return {
    name: options.name,
    path: options.path,
    components: [
      placeAbs(
        createContainer({
          backgroundColor: '#f5f7fb',
          borderColor: 'transparent',
          borderRadius: 0,
          padding: 0,
          minHeight: options.height,
          children: options.children,
        }),
        {
          left: 0,
          top: 0,
          width: CANVAS_WIDTH,
          height: options.height,
        },
      ),
    ],
  };
}

function createReplicaPanel(options: {
  left: number;
  top: number;
  width: number | string;
  height: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  children?: TemplateComponent[];
}) {
  return placeAbs(
    createContainer({
      backgroundColor: options.backgroundColor ?? '#ffffff',
      borderColor: options.borderColor ?? '#edf0f5',
      borderRadius: options.borderRadius ?? 14,
      padding: options.padding ?? 0,
      minHeight: options.height,
      children: options.children ?? [],
    }),
    {
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
    },
  );
}

function createBreadcrumbHtml(items: string[]) {
  return `
    <div style="display:flex;align-items:center;gap:10px;font-size:14px;color:#65748b;">
      <span style="font-size:16px;line-height:1;color:#7d8ca3;">⇄</span>
      ${items
        .map(
          (item, index) => `
            <span style="display:flex;align-items:center;gap:10px;">
              ${index > 0 ? '<span style="color:#b7c2d0;">/</span>' : ''}
              <span style="color:${index === items.length - 1 ? '#1f2937' : '#5f6c80'};">${item}</span>
            </span>
          `,
        )
        .join('')}
    </div>
  `;
}

function createPageTitleHtml(title: string, description?: string) {
  return `
    <div style="display:flex;flex-direction:column;gap:${description ? 10 : 0}px;">
      <div style="font-size:56px;line-height:1.04;font-weight:700;letter-spacing:-0.04em;color:#1f2937;">${title}</div>
      ${
        description
          ? `<div style="font-size:16px;line-height:1.6;color:#4b5b72;">${description}</div>`
          : ''
      }
    </div>
  `;
}

function createMetricCardHtml(options: {
  value: string;
  label: string;
  subLabel?: string;
  accent: string;
  accentBg: string;
  icon: string;
  delta?: string;
  deltaColor?: string;
}) {
  return `
    <div style="height:100%;display:flex;align-items:center;justify-content:space-between;padding:20px 18px;">
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="font-size:34px;line-height:1;font-weight:700;color:#1f2937;">${options.value}</div>
        <div style="font-size:15px;font-weight:600;color:#27364a;">${options.label}</div>
        ${
          options.delta
            ? `<div style="font-size:13px;color:${options.deltaColor ?? '#35a16b'};">${options.delta}</div>`
            : options.subLabel
              ? `<div style="font-size:13px;color:#6c7b90;">${options.subLabel}</div>`
              : ''
        }
      </div>
      <div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:${options.accentBg};color:${options.accent};font-size:18px;font-weight:700;">
        ${options.icon}
      </div>
    </div>
  `;
}

function createRevenueCardHtml() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lightBars = [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78];
  const darkBars = [24, 6, 42, 52, 52, 10, 22, 42, 74, 58, 14, 56];

  return `
    <div style="height:100%;display:flex;justify-content:space-between;gap:18px;padding:26px 26px 20px;">
      <div style="width:32%;display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Revenue report</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="min-width:108px;height:30px;border:1px solid #d8e0ea;border-radius:4px;background:#fff;padding:0 10px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:#334155;">
              <span>JAN 2026</span>
              <span style="color:#7d8ca3;">⌄</span>
            </div>
            <span style="font-size:14px;font-weight:700;color:#2a5bd7;">Export</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:18px;margin-top:6px;">
          <div>
            <div style="font-size:42px;font-weight:700;line-height:1;color:#1f2937;">$34,940.00</div>
            <div style="margin-top:10px;font-size:15px;color:#243447;">Total earnings</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:18px;">
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:#4aa1ff;margin-top:8px;"></span>
              <div>
                <div style="font-size:14px;color:#66778f;">Earnings this month</div>
                <div style="margin-top:6px;font-size:18px;font-weight:700;color:#1f2937;">$27,024.00</div>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:#234ec8;margin-top:8px;"></span>
              <div>
                <div style="font-size:14px;color:#66778f;">Expense this month</div>
                <div style="margin-top:6px;font-size:18px;font-weight:700;color:#1f2937;">$7,916.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding-top:42px;">
        <div style="height:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
          ${months
            .map(
              (month, index) => `
                <div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:10px;">
                  <div style="position:relative;width:100%;height:280px;display:flex;justify-content:center;align-items:flex-end;gap:6px;">
                    <span style="display:block;width:6px;height:${lightBars[index] * 3}px;border-radius:999px;background:#53a7ff;"></span>
                    <span style="display:block;width:6px;height:${darkBars[index] * 3}px;border-radius:999px;background:#1f4ec9;"></span>
                  </div>
                  <span style="font-size:12px;color:#6b778d;">${month}</span>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function createDonutHtml(value: string, percentText: string) {
  return `
    <div style="height:100%;display:flex;justify-content:space-between;gap:12px;padding:20px 18px 18px;">
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Yearly breakup</div>
        <div style="font-size:20px;font-weight:700;color:#1f2937;">${value}</div>
        <div style="font-size:14px;color:#35a16b;">${percentText}</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:#6b778d;">
          <div style="display:flex;align-items:center;gap:8px;"><span style="width:8px;height:8px;border-radius:2px;background:#e6edf7;"></span>Earnings</div>
          <div style="display:flex;align-items:center;gap:8px;"><span style="width:8px;height:8px;border-radius:2px;background:#1f4ec9;"></span>Profit</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;padding-right:4px;">
        <svg width="108" height="108" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
          <circle cx="54" cy="54" r="34" fill="none" stroke="#e3e8ee" stroke-width="7"/>
          <circle cx="54" cy="54" r="34" fill="none" stroke="#1f4ec9" stroke-width="7" stroke-linecap="round" stroke-dasharray="154 214" transform="rotate(-90 54 54)"/>
        </svg>
      </div>
    </div>
  `;
}

function createSparklineHtml() {
  return `
    <div style="height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:20px 18px 16px;">
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Monthly earnings</div>
        <div style="margin-top:12px;font-size:20px;font-weight:700;color:#1f2937;">$6,820</div>
        <div style="margin-top:8px;font-size:14px;color:#35a16b;">↑ 25.36% last month</div>
      </div>
      <svg width="100%" height="110" viewBox="0 0 250 110" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 94 C 30 46, 54 104, 82 88 C 112 70, 136 18, 165 62 C 188 96, 206 40, 236 92" fill="none" stroke="#2356d8" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>
  `;
}

function createWorldMapHtml() {
  return `
    <div style="height:100%;padding:18px 18px 12px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Revenue by location</div>
      <svg width="100%" height="245" viewBox="0 0 640 245" xmlns="http://www.w3.org/2000/svg" style="margin-top:12px;">
        <rect x="0" y="0" width="640" height="245" rx="12" fill="#ffffff"/>
        <path d="M68 86c18-22 42-34 76-36l30 8 28-6 14 18 50 12 24-12 56 8 40-18 52 12 48 34-8 36-38 18-74-6-46 12-38-8-40 8-66-12-44 4-40-18-34-34 10-20z" fill="#9ec8ff" stroke="#82b8ff" stroke-width="2"/>
        <path d="M340 52l22-14 18 10 6 18-20 8-24-8z" fill="#e6eaef"/>
        <circle cx="170" cy="92" r="5" fill="#1f4ec9"/>
        <circle cx="436" cy="118" r="5" fill="#1f4ec9"/>
        <circle cx="512" cy="154" r="5" fill="#1f4ec9"/>
      </svg>
    </div>
  `;
}

function createSimpleTableHtml(
  headers: string[],
  rows: string[][],
  options?: { compact?: boolean },
) {
  return `
    <div style="height:100%;padding:${options?.compact ? '16px 16px 10px' : '18px 18px 10px'};">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#243447;">
        <thead>
          <tr>
            ${headers
              .map(
                (header) => `
                  <th style="padding:0 0 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#7c889b;text-transform:uppercase;border-bottom:1px solid #e8edf3;">
                    ${header}
                  </th>
                `,
              )
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${row
                    .map(
                      (value) => `
                        <td style="padding:14px 0;border-bottom:1px solid #eef2f6;color:#1f2937;">
                          ${value}
                        </td>
                      `,
                    )
                    .join('')}
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function createTimelineHtml() {
  const items = [
    ['Donald', 'updated the status of', 'Refund #1234', 'to awaiting customer response', '25m ago'],
    ['Lycy Peterson', 'was added to the group, group name is', 'Overtake', '', '1h ago'],
    ['Joseph Rust', 'opened new showcase', 'Mannat #112233', 'with theme market', '2h ago'],
    ['Donald', 'updated the status to', 'awaiting customer response', '', '3d ago'],
    ['Lycy Peterson', 'was added to the group', '', '', 'Nov 14, 2023'],
    ['Dan Rya', 'was added to the group', '', '', 'Nov 14, 2023'],
    ['Project', 'Vuestic 2023 was created', '', '', 'Nov 15, 2023'],
  ];

  return `
    <div style="height:100%;padding:18px 18px 10px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Timeline</div>
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:14px;">
        ${items
          .map(
            (item, index) => `
              <div style="display:flex;gap:12px;">
                <div style="display:flex;flex-direction:column;align-items:center;">
                  <span style="width:10px;height:10px;border-radius:999px;background:${index === 0 ? '#2356d8' : '#d7e0eb'};margin-top:4px;"></span>
                  ${index < items.length - 1 ? '<span style="width:2px;flex:1;background:#e5ebf2;margin-top:6px;"></span>' : ''}
                </div>
                <div style="flex:1;padding-bottom:12px;border-bottom:${index < items.length - 1 ? '1px solid #eef2f6' : 'none'};">
                  <div style="font-size:14px;line-height:1.6;color:#243447;">
                    <strong>${item[0]}</strong> ${item[1]} ${item[2] ? `<a style="color:#2356d8;text-decoration:none;" href="#">${item[2]}</a>` : ''} ${item[3]}
                  </div>
                  <div style="margin-top:6px;font-size:13px;color:#7b889a;">${item[4]}</div>
                </div>
              </div>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

function createToolbarTabsHtml(activeLabel: string, labels: string[]) {
  return `
    <div style="display:inline-flex;align-items:center;border:1px solid #dde4ee;border-radius:6px;background:#fff;overflow:hidden;">
      ${labels
        .map(
          (label) => `
            <div style="padding:10px 18px;font-size:15px;font-weight:700;color:${label === activeLabel ? '#1f2937' : '#4b5b72'};background:${label === activeLabel ? '#eef2f5' : '#ffffff'};border-right:${label !== labels[labels.length - 1] ? '1px solid #dde4ee' : 'none'};">
              ${label}
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function createSearchBarHtml(placeholder: string) {
  return `
    <div style="height:44px;border:1px solid #d7e0ea;border-radius:4px;background:#fff;padding:0 14px;display:flex;align-items:center;font-size:14px;color:#8a97a8;">
      ${placeholder}
    </div>
  `;
}

function createActionButtonHtml(text: string, icon?: string) {
  return `
    <div style="height:44px;border-radius:4px;background:#2356d8;display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:700;color:#ffffff;">
      ${icon ? `<span style="font-size:18px;line-height:1;">${icon}</span>` : ''}
      <span>${text}</span>
    </div>
  `;
}

function createInfoGridHtml(items: Array<{ title: string; body: string; badge?: string; action?: string }>) {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${items
        .map(
          (item) => `
            <div style="min-height:116px;border:1px dashed #d6ddeb;border-radius:10px;padding:16px 14px;display:flex;justify-content:space-between;gap:12px;background:#fff;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="font-size:18px;font-weight:700;color:#1f2937;">${item.title}</div>
                  ${
                    item.badge
                      ? `<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:999px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${item.badge}</span>`
                      : ''
                  }
                </div>
                <div style="margin-top:12px;font-size:14px;line-height:1.5;color:#6a7788;">${item.body}</div>
              </div>
              ${
                item.action
                  ? `<div style="align-self:flex-start;height:36px;padding:0 14px;border-radius:4px;background:#2356d8;display:flex;align-items:center;font-size:14px;font-weight:700;color:#fff;">${item.action}</div>`
                  : ''
              }
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function createPricingCardHtml(options: {
  title: string;
  subtitle: string;
  price: string;
  background: string;
  highlighted?: boolean;
}) {
  const features = [
    ['Up to 10 Active Users', true],
    ['Up to 30 Project Integrations', true],
    ['Analytics Module', true],
    ['Finance Module', options.highlighted ?? false],
    ['Accounting Module', options.highlighted ?? false],
    ['Network Platform', options.highlighted ?? false],
    ['Unlimited Cloud Space', options.highlighted ?? false],
  ];

  return `
    <div style="height:100%;border-radius:18px;background:${options.background};padding:24px 28px;">
      <div style="text-align:center;">
        <div style="font-size:28px;font-weight:700;color:#1f2937;">${options.title}</div>
        ${
          options.highlighted
            ? '<div style="margin-top:8px;"><span style="display:inline-flex;height:18px;padding:0 8px;border-radius:999px;background:#2356d8;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Popular choice</span></div>'
            : ''
        }
        <div style="margin-top:12px;font-size:15px;line-height:1.55;color:#68788f;">${options.subtitle}</div>
        <div style="margin-top:20px;font-size:18px;color:#1f2937;">
          <span style="font-size:20px;vertical-align:top;">$</span>
          <span style="font-size:60px;line-height:1;font-weight:700;">${options.price}</span>
          <span style="font-size:18px;"> / year</span>
        </div>
      </div>
      <div style="margin-top:24px;display:flex;flex-direction:column;gap:18px;">
        ${features
          .map(
            ([feature, enabled]) => `
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:16px;line-height:1.5;color:${enabled ? '#1f2937' : '#7d8ca3'};">
                <span>${feature}</span>
                <span style="color:${enabled ? '#2356d8' : '#c4cdd8'};">${enabled ? '✓' : '⊘'}</span>
              </div>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

function createAuthScreenPage(options: {
  name: string;
  path: string;
  title: string;
  helperText: string;
  secondaryAction: string;
  linkText: string;
  buttonText: string;
  extraHtml?: string;
}) {
  return createReplicaPage({
    name: options.name,
    path: options.path,
    height: 900,
    children: [
      createReplicaPanel({
        left: 0,
        top: 0,
        width: 520,
        height: 900,
        backgroundColor: '#1f53c8',
        borderColor: '#1f53c8',
        borderRadius: 0,
        children: [
          placeHtml(
            `
              <div style="height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="font-size:24px;font-weight:800;letter-spacing:0.42em;color:#ffffff;">VUESTIC<span style="font-size:14px;letter-spacing:0.14em;margin-left:10px;">ADMIN</span></div>
              </div>
            `,
            { left: 0, top: 0, width: 520, height: 900 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 520,
        top: 0,
        width: 920,
        height: 900,
        backgroundColor: '#f5f5f6',
        borderColor: '#f5f5f6',
        borderRadius: 0,
        children: [
          placeHtml(
            `
              <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                <div style="width:440px;">
                  <div style="font-size:56px;line-height:1.08;font-weight:700;color:#1f2937;">${options.title}</div>
                  <div style="margin-top:18px;font-size:16px;color:#334155;">${options.helperText} <a href="#" style="color:#2356d8;text-decoration:none;font-weight:600;">${options.linkText}</a></div>
                  <div style="margin-top:22px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#2356d8;text-transform:uppercase;">Email</div>
                  <div style="margin-top:8px;height:46px;border:1px solid #d7deea;border-radius:4px;background:#ffffff;"></div>
                  <div style="margin-top:18px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#2356d8;text-transform:uppercase;">Password</div>
                  <div style="margin-top:8px;height:46px;border:1px solid #d7deea;border-radius:4px;background:#ffffff;"></div>
                  ${
                    options.extraHtml ??
                    `
                      <div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:14px;color:#334155;">
                        <div style="display:flex;align-items:center;gap:10px;">
                          <span style="width:18px;height:18px;border:1px solid #d7deea;border-radius:4px;background:#fff;display:inline-block;"></span>
                          <span>Keep me signed in on this device</span>
                        </div>
                        <a href="#" style="color:#2356d8;text-decoration:none;font-weight:600;">Forgot password?</a>
                      </div>
                    `
                  }
                  <div style="margin-top:20px;height:46px;border-radius:4px;background:#2356d8;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#ffffff;">${options.buttonText}</div>
                  <div style="margin-top:16px;font-size:14px;color:#64748b;">${options.secondaryAction}</div>
                </div>
              </div>
            `,
            { left: 0, top: 0, width: 920, height: 900 },
          ),
        ],
      }),
    ],
  });
}

function createVuesticDashboardReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Dashboard',
    path: 'dashboard',
    height: 1460,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Dashboard']), {
        left: 18,
        top: 16,
        width: 320,
        height: 28,
      }),
      placeHtml(createPageTitleHtml('Dashboard'), {
        left: 18,
        top: 56,
        width: 420,
        height: 86,
      }),
      createReplicaPanel({
        left: 18,
        top: 162,
        width: 980,
        height: 454,
        children: [placeHtml(createRevenueCardHtml(), { left: 0, top: 0, width: 980, height: 454 })],
      }),
      createReplicaPanel({
        left: 1012,
        top: 162,
        width: 408,
        height: 216,
        children: [placeHtml(createDonutHtml('$36,358', '↗ +2,5% last year'), { left: 0, top: 0, width: 408, height: 216 })],
      }),
      createReplicaPanel({
        left: 1012,
        top: 400,
        width: 408,
        height: 216,
        children: [placeHtml(createSparklineHtml(), { left: 0, top: 0, width: 408, height: 216 })],
      }),
      createReplicaPanel({
        left: 18,
        top: 634,
        width: 340,
        height: 110,
        children: [placeHtml(createMetricCardHtml({ value: '$35,548', label: 'Open invoices', accent: '#ffffff', accentBg: '#1c980a', icon: '$', delta: '↓ $1, 450 since last month', deltaColor: '#ef6d5b' }), { left: 0, top: 0, width: 340, height: 110 })],
      }),
      createReplicaPanel({
        left: 372,
        top: 634,
        width: 340,
        height: 110,
        children: [placeHtml(createMetricCardHtml({ value: '15', label: 'Ongoing project', accent: '#ffffff', accentBg: '#2b8cdc', icon: '▣', delta: '↑ 25.36% since last month' }), { left: 0, top: 0, width: 340, height: 110 })],
      }),
      createReplicaPanel({
        left: 726,
        top: 634,
        width: 340,
        height: 110,
        children: [placeHtml(createMetricCardHtml({ value: '25', label: 'Employees', accent: '#ffffff', accentBg: '#ef4444', icon: '◎', delta: '↑ 2.5% since last month' }), { left: 0, top: 0, width: 340, height: 110 })],
      }),
      createReplicaPanel({
        left: 1080,
        top: 634,
        width: 340,
        height: 110,
        children: [placeHtml(createMetricCardHtml({ value: '27%', label: 'New profit', accent: '#1f2937', accentBg: '#ffd53f', icon: '★', delta: '↑ 4% since last month' }), { left: 0, top: 0, width: 340, height: 110 })],
      }),
      createReplicaPanel({
        left: 18,
        top: 760,
        width: 936,
        height: 360,
        children: [placeHtml(createWorldMapHtml(), { left: 0, top: 0, width: 936, height: 360 })],
      }),
      createReplicaPanel({
        left: 972,
        top: 760,
        width: 448,
        height: 360,
        children: [
          placeHtml(
            `
              <div style="padding:18px 18px 10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Revenue by top regions</div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${createToolbarTabsHtml('Today', ['Today', 'Week', 'Month'])}
                    <span style="font-size:14px;font-weight:700;color:#2356d8;">Export</span>
                  </div>
                </div>
              </div>
            `,
            { left: 0, top: 0, width: 448, height: 70 },
          ),
          placeHtml(
            createSimpleTableHtml(
              ['Top Region', 'Revenue'],
              [
                ['Japan', '$4,748,454'],
                ['United Kingdom', '$405,748'],
                ['United States', '$308,536'],
                ['China', '$250,963'],
                ['Canada', '$29,415'],
                ['Australia', '$15,000'],
                ['India', '$10,000'],
              ],
              { compact: true },
            ),
            { left: 0, top: 58, width: 448, height: 290 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 18,
        top: 1138,
        width: 700,
        height: 286,
        children: [
          placeHtml(
            `
              <div style="padding:18px 18px 10px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;color:#7c889b;text-transform:uppercase;">Projects</div>
              </div>
            `,
            { left: 0, top: 0, width: 700, height: 54 },
          ),
          placeHtml(
            createSimpleTableHtml(
              ['Project', 'Owner', 'Status', 'Updated'],
              [
                ['Vuestic 2026 Console', 'Mike', 'Live', '25m ago'],
                ['Overtake Workspace', 'Lycy Peterson', 'Review', '1h ago'],
                ['Mannat Showcase', 'Joseph Rust', 'Draft', '2h ago'],
              ],
              { compact: true },
            ),
            { left: 0, top: 46, width: 700, height: 220 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 736,
        top: 1138,
        width: 684,
        height: 286,
        children: [placeHtml(createTimelineHtml(), { left: 0, top: 0, width: 684, height: 286 })],
      }),
    ],
  });
}

function createVuesticUsersReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Users',
    path: 'users',
    height: 960,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Users']), { left: 18, top: 16, width: 280, height: 28 }),
      placeHtml(createPageTitleHtml('Users'), { left: 18, top: 56, width: 360, height: 80 }),
      createReplicaPanel({
        left: 18,
        top: 152,
        width: 1402,
        height: 364,
        children: [
          placeHtml(createToolbarTabsHtml('Active', ['Active', 'Inactive']), { left: 18, top: 18, width: 140, height: 44 }),
          placeHtml(createSearchBarHtml('Search'), { left: 176, top: 18, width: 360, height: 44 }),
          placeHtml(createActionButtonHtml('Add User'), { left: 1248, top: 18, width: 136, height: 44 }),
          placeHtml(
            createSimpleTableHtml(
              ['Full Name', 'Email', 'Username', 'Role', 'Projects'],
              [
                ['No items', '', '', '', ''],
              ],
              { compact: true },
            ),
            { left: 0, top: 78, width: 1402, height: 194, styles: { opacity: 0.9 } },
          ),
          placeHtml(
            `
              <div style="display:flex;align-items:center;gap:6px;font-size:14px;color:#1f2937;">
                <strong>0 results.</strong>
                <span>Results per page</span>
                <span style="display:inline-flex;align-items:center;justify-content:space-between;width:64px;height:30px;border:1px solid #d7deea;border-radius:4px;padding:0 10px;color:#475569;">10 <span style="color:#7d8ca3;">⌄</span></span>
              </div>
            `,
            { left: 18, top: 294, width: 240, height: 30 },
          ),
        ],
      }),
    ],
  });
}

function createVuesticProjectsReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Projects',
    path: 'projects',
    height: 960,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Projects']), { left: 18, top: 16, width: 300, height: 28 }),
      placeHtml(createPageTitleHtml('Projects'), { left: 18, top: 56, width: 360, height: 80 }),
      createReplicaPanel({
        left: 18,
        top: 152,
        width: 1402,
        height: 364,
        children: [
          placeHtml(createToolbarTabsHtml('Table', ['Cards', 'Table']), { left: 18, top: 18, width: 122, height: 44 }),
          placeHtml(createActionButtonHtml('Project', '+'), { left: 1238, top: 18, width: 146, height: 44 }),
          placeHtml(
            createSimpleTableHtml(
              ['Project Name', 'Project Owner', 'Team', 'Status', 'Creation Date'],
              [['No items', '', '', '', '']],
              { compact: true },
            ),
            { left: 0, top: 78, width: 1402, height: 194, styles: { opacity: 0.9 } },
          ),
          placeHtml(
            `
              <div style="display:flex;align-items:center;gap:6px;font-size:14px;color:#1f2937;">
                <strong>0 results.</strong>
                <span>Results per page</span>
                <span style="display:inline-flex;align-items:center;justify-content:space-between;width:64px;height:30px;border:1px solid #d7deea;border-radius:4px;padding:0 10px;color:#475569;">10 <span style="color:#7d8ca3;">⌄</span></span>
              </div>
            `,
            { left: 18, top: 294, width: 240, height: 30 },
          ),
        ],
      }),
    ],
  });
}

function createPaymentMethodsReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Payment methods',
    path: 'payments/payment-methods',
    height: 1320,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Payments', 'Payment methods']), { left: 18, top: 16, width: 420, height: 28 }),
      placeHtml(createPageTitleHtml('Payment methods'), { left: 18, top: 56, width: 520, height: 80 }),
      createReplicaPanel({
        left: 18,
        top: 152,
        width: 1402,
        height: 514,
        children: [
          placeHtml('<div style="padding:18px 18px 0;font-size:20px;font-weight:700;color:#1f2937;">My cards</div>', {
            left: 0,
            top: 0,
            width: 220,
            height: 48,
          }),
          placeHtml(
            createInfoGridHtml([
              { title: 'Main card', badge: 'Primary', body: 'Visa ****1679<br/>Card expires at 09/24' },
              { title: 'Online shopping', body: 'Mastercard ****8921<br/>Card expires at 11/23' },
              { title: 'Backup Visa', body: 'Mastercard ****4523<br/>Card expires at 12/22' },
              {
                title: 'Important note',
                body: 'Please carefully read Product Terms before adding your new payment card',
                action: 'Add card',
              },
            ]),
            { left: 18, top: 50, width: 1366, height: 220 },
          ),
          placeHtml('<div style="padding:0 18px;font-size:20px;font-weight:700;color:#1f2937;">Billing address</div>', {
            left: 0,
            top: 296,
            width: 240,
            height: 34,
          }),
          placeHtml(
            createInfoGridHtml([
              { title: 'Home address', badge: 'Primary', body: 'Ap #285-7193 Ullamcorper Avenue<br/>Amesbury, HI 93373<br/>US' },
              { title: 'Office address', body: 'P.O. Box 847, 8011 Nisl St.<br/>Morgantown, IN 46160<br/>US' },
              { title: 'Vacation home', body: '883-2699 Egestas Rd.<br/>Frederick, NE 20620<br/>US' },
              {
                title: 'Important note',
                body: 'Please ensure the provided billing address matches the information on file with your financial institution.',
                action: 'New address',
              },
            ]),
            { left: 18, top: 346, width: 1366, height: 250 },
          ),
        ],
      }),
    ],
  });
}

function createPricingPlansReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Pricing plans',
    path: 'payments/pricing-plans',
    height: 980,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Payments', 'Pricing plans']), { left: 18, top: 16, width: 420, height: 28 }),
      placeHtml(createPageTitleHtml('Choose your plan', 'If you need more info about our pricing, please check Pricing Guidelines.'), {
        left: 18,
        top: 56,
        width: 820,
        height: 140,
      }),
      createReplicaPanel({
        left: 18,
        top: 214,
        width: 1402,
        height: 694,
        children: [
          placeHtml(createToolbarTabsHtml('Annual', ['Monthly', 'Annual']), {
            left: 510,
            top: 18,
            width: 144,
            height: 40,
          }),
          placeHtml(createPricingCardHtml({ title: 'Startup', subtitle: 'Optimal for 10+ team size and new startup', price: '39', background: '#f7f8fa' }), {
            left: 28,
            top: 84,
            width: 388,
            height: 560,
          }),
          placeHtml(createPricingCardHtml({ title: 'Advanced', subtitle: 'Optimal for 100+ team size and grown company', price: '339', background: '#e3f2db', highlighted: true }), {
            left: 507,
            top: 58,
            width: 388,
            height: 586,
          }),
          placeHtml(createPricingCardHtml({ title: 'Enterprise', subtitle: 'Optimal for 1000+ team and enterprise', price: '999', background: '#f7f8fa' }), {
            left: 986,
            top: 84,
            width: 388,
            height: 560,
          }),
        ],
      }),
    ],
  });
}

function createBillingReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'Billing',
    path: 'payments/billing',
    height: 1200,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'Payments', 'Billing']), { left: 18, top: 16, width: 360, height: 28 }),
      placeHtml(createPageTitleHtml('Billing information'), { left: 18, top: 56, width: 520, height: 80 }),
      createReplicaPanel({
        left: 18,
        top: 152,
        width: 1402,
        height: 318,
        children: [
          placeHtml(
            `
              <div style="padding:20px 20px 12px;">
                <div style="font-size:24px;font-weight:700;color:#1f2937;">Membership tier</div>
                <div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;">
                  ${[
                    ['Unlimited padlets', '500MB /upload', '$9.99 /month', '$99.99 /year'],
                    ['20 padlets', '100MB /upload', '$6.99 /month', '$69.99 /year'],
                    ['3 padlets', '20MB /upload', 'Free', ''],
                  ]
                    .map(
                      (card, index) => `
                        <div style="border:1px solid ${index === 1 ? '#2356d8' : '#d9e1ec'};border-radius:12px;padding:18px 16px;background:#fff;">
                          <div style="font-size:18px;font-weight:700;color:#1f2937;">${card[0]}</div>
                          <div style="margin-top:8px;font-size:14px;color:#6c7b90;">${card[1]}</div>
                          <div style="margin-top:18px;font-size:16px;color:#1f2937;">${card[2]}</div>
                          ${card[3] ? `<div style="margin-top:6px;font-size:14px;color:#6c7b90;">${card[3]}</div>` : ''}
                        </div>
                      `,
                    )
                    .join('')}
                </div>
              </div>
            `,
            { left: 0, top: 0, width: 1402, height: 318 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 18,
        top: 492,
        width: 580,
        height: 210,
        children: [
          placeHtml(
            `
              <div style="padding:20px;">
                <div style="font-size:22px;font-weight:700;color:#1f2937;">Payment info</div>
                <div style="margin-top:20px;display:flex;flex-direction:column;gap:18px;">
                  <div>
                    <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;color:#7c889b;text-transform:uppercase;">Payment plan</div>
                    <div style="margin-top:8px;font-size:18px;color:#1f2937;">$6.99 /monthly</div>
                  </div>
                  <div>
                    <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;color:#7c889b;text-transform:uppercase;">Payment method</div>
                    <div style="margin-top:8px;font-size:18px;color:#1f2937;">visa ****1679</div>
                  </div>
                </div>
              </div>
            `,
            { left: 0, top: 0, width: 580, height: 210 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 620,
        top: 492,
        width: 800,
        height: 446,
        children: [
          placeHtml('<div style="padding:18px 18px 6px;font-size:22px;font-weight:700;color:#1f2937;">Invoices</div>', {
            left: 0,
            top: 0,
            width: 200,
            height: 40,
          }),
          placeHtml(
            createSimpleTableHtml(
              ['Invoice', 'Amount', 'Status', 'Date'],
              [
                ['#INV-1024', '$99.99', 'Paid', 'Apr 19, 2026'],
                ['#INV-1018', '$69.99', 'Paid', 'Mar 19, 2026'],
                ['#INV-1002', '$69.99', 'Paid', 'Feb 19, 2026'],
              ],
              { compact: true },
            ),
            { left: 0, top: 44, width: 800, height: 388 },
          ),
        ],
      }),
    ],
  });
}

function createFaqReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: 'FAQ',
    path: 'faq',
    height: 980,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', 'FAQ']), { left: 18, top: 16, width: 260, height: 28 }),
      placeHtml(createPageTitleHtml('FAQ', 'Answers about dashboard setup, payments, releases and account lifecycle.'), {
        left: 18,
        top: 56,
        width: 820,
        height: 120,
      }),
      createReplicaPanel({
        left: 18,
        top: 194,
        width: 1402,
        height: 640,
        children: [
          placeHtml(
            `
              <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
                ${[
                  ['How do I publish a dashboard?', 'Use the top-right publish action and verify release visibility before sharing the final link.'],
                  ['How do I add a payment method?', 'Open Payments / Payment methods and create a new card or billing address entry.'],
                  ['How does account recovery work?', 'Recover password sends a reset link to the account email and returns you to the login screen.'],
                  ['Why is a page missing in navigation?', 'Check the page group path and ensure the page path still belongs to the intended section.'],
                ]
                  .map(
                    ([title, body]) => `
                      <div style="border:1px solid #e6ebf2;border-radius:12px;background:#fff;padding:18px 18px 16px;">
                        <div style="font-size:18px;font-weight:700;color:#1f2937;">${title}</div>
                        <div style="margin-top:10px;font-size:15px;line-height:1.65;color:#5f6c80;">${body}</div>
                      </div>
                    `,
                  )
                  .join('')}
              </div>
            `,
            { left: 0, top: 0, width: 1402, height: 640 },
          ),
        ],
      }),
    ],
  });
}

function create404ReplicaPage(): TemplatePagePreset {
  return createReplicaPage({
    name: '404',
    path: '404',
    height: 900,
    children: [
      createReplicaPanel({
        left: 250,
        top: 132,
        width: 940,
        height: 520,
        children: [
          placeHtml(
            `
              <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;">
                <div style="font-size:120px;line-height:1;font-weight:800;color:#2356d8;">404</div>
                <div style="margin-top:18px;font-size:32px;font-weight:700;color:#1f2937;">Page not found</div>
                <div style="margin-top:14px;max-width:560px;font-size:17px;line-height:1.7;color:#5f6c80;">The page you are looking for does not exist or was moved. Use the left navigation to continue browsing the Vuestic workspace.</div>
                <div style="margin-top:30px;height:46px;padding:0 28px;border-radius:4px;background:#2356d8;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#ffffff;">Back to dashboard</div>
              </div>
            `,
            { left: 0, top: 0, width: 940, height: 520 },
          ),
        ],
      }),
    ],
  });
}

function createSettingsReplicaPage(options: {
  name: string;
  path: string;
  title: string;
  subtitle: string;
  badgeText: string;
  sideTitle: string;
  sideRows: string[][];
}) {
  return createReplicaPage({
    name: options.name,
    path: options.path,
    height: 1100,
    children: [
      placeHtml(createBreadcrumbHtml(['Home', options.name]), { left: 18, top: 16, width: 380, height: 28 }),
      placeHtml(createPageTitleHtml(options.title, options.subtitle), {
        left: 18,
        top: 56,
        width: 860,
        height: 120,
      }),
      createReplicaPanel({
        left: 18,
        top: 194,
        width: 860,
        height: 720,
        children: [
          placeHtml(
            `
              <div style="padding:20px 22px 0;display:flex;align-items:center;gap:10px;">
                <div style="font-size:22px;font-weight:700;color:#1f2937;">${options.title}</div>
                <span style="display:inline-flex;height:22px;padding:0 10px;border-radius:999px;background:#e9f0ff;color:#2356d8;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${options.badgeText}</span>
              </div>
            `,
            { left: 0, top: 0, width: 320, height: 52 },
          ),
          placeHtml(
            `
              <div style="padding:84px 22px 0;display:flex;flex-direction:column;gap:18px;">
                ${[
                  ['Workspace name', 'Vuestic Admin'],
                  ['Default domain', options.path === 'account-preferences' ? 'account.vuestic.local' : 'app.vuestic.local'],
                  ['Theme mode', 'Light / Dark / System'],
                  ['Notifications', 'Email alerts, Slack digest, Weekly summary'],
                ]
                  .map(
                    ([label, value]) => `
                      <div>
                        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;color:#2356d8;text-transform:uppercase;">${label}</div>
                        <div style="margin-top:8px;height:48px;border:1px solid #d7deea;border-radius:4px;background:#ffffff;padding:0 14px;display:flex;align-items:center;font-size:15px;color:#1f2937;">${value}</div>
                      </div>
                    `,
                  )
                  .join('')}
                <div style="margin-top:6px;height:46px;width:168px;border-radius:4px;background:#2356d8;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;">Save settings</div>
              </div>
            `,
            { left: 0, top: 0, width: 860, height: 720 },
          ),
        ],
      }),
      createReplicaPanel({
        left: 900,
        top: 194,
        width: 520,
        height: 720,
        children: [
          placeHtml(`<div style="padding:20px 20px 4px;font-size:22px;font-weight:700;color:#1f2937;">${options.sideTitle}</div>`, {
            left: 0,
            top: 0,
            width: 300,
            height: 40,
          }),
          placeHtml(createSimpleTableHtml(['Change', 'Owner', 'Time'], options.sideRows, { compact: true }), {
            left: 0,
            top: 48,
            width: 520,
            height: 650,
          }),
        ],
      }),
    ],
  });
}

export const adminConsoleStandardTemplate: TemplatePreset = {
  key: 'admin-console-standard',
  name: 'Vuestic Admin 高仿模板',
  desc: '按 Vuestic Admin demo 的导航、页面层级与后台视觉结构重绘的多页面后台模板。',
  tags: ['admin', 'dashboard', 'vuestic-clone'],
  pageTitle: 'Vuestic Admin',
  pageCategory: 'admin',
  layoutMode: 'absolute',
  shellLayout: 'leftRight',
  deviceType: 'pc',
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  activePagePath: 'dashboard',
  pageGroups: [
    { id: 'nav-dashboard', name: 'Dashboard', path: 'dashboard' },
    { id: 'nav-users', name: 'Users', path: 'users' },
    { id: 'nav-projects', name: 'Projects', path: 'projects' },
    { id: 'nav-payments', name: 'Payments', path: 'payments' },
    { id: 'nav-auth', name: 'Auth', path: 'auth' },
    { id: 'nav-faq', name: 'FAQ', path: 'faq' },
    { id: 'nav-404', name: '404', path: '404' },
    { id: 'nav-account', name: 'Account preferences', path: 'account-preferences' },
    { id: 'nav-application', name: 'Application settings', path: 'application-settings' },
  ],
  pages: [
    createVuesticDashboardReplicaPage(),
    createVuesticUsersReplicaPage(),
    createVuesticProjectsReplicaPage(),
    createPaymentMethodsReplicaPage(),
    createPricingPlansReplicaPage(),
    createBillingReplicaPage(),
    createAuthScreenPage({
      name: 'Login',
      path: 'auth/login',
      title: 'Log in',
      helperText: 'New to Vuestic?',
      secondaryAction: '',
      linkText: 'Sign up',
      buttonText: 'Login',
    }),
    createAuthScreenPage({
      name: 'Signup',
      path: 'auth/signup',
      title: 'Sign up',
      helperText: 'Already have an account?',
      secondaryAction: 'By creating an account you agree with the workspace terms and privacy policy.',
      linkText: 'Log in',
      buttonText: 'Create account',
      extraHtml: `
        <div style="margin-top:16px;font-size:14px;line-height:1.6;color:#64748b;">
          Add your password and confirm the email address to create a new Vuestic workspace profile.
        </div>
      `,
    }),
    createAuthScreenPage({
      name: 'Recover password',
      path: 'auth/recover-password',
      title: 'Recover password',
      helperText: 'Remembered your password?',
      secondaryAction: 'We will send a secure reset link to the email address above.',
      linkText: 'Log in',
      buttonText: 'Send reset link',
      extraHtml: `
        <div style="margin-top:16px;font-size:14px;line-height:1.6;color:#64748b;">
          Enter the email linked to your account and we will send instructions to reset your password.
        </div>
      `,
    }),
    createFaqReplicaPage(),
    create404ReplicaPage(),
    createSettingsReplicaPage({
      name: 'Account preferences',
      path: 'account-preferences',
      title: 'Account preferences',
      subtitle: 'Configure profile defaults, notification preferences and the behavior of the current workspace account.',
      badgeText: 'Synced',
      sideTitle: 'Recent configuration changes',
      sideRows: [
        ['Theme tokens updated', 'Mike', 'Today 09:12'],
        ['Security policy changed', 'Olivia', 'Yesterday'],
        ['Notification routing edited', 'Kevin', 'Apr 18'],
      ],
    }),
    createSettingsReplicaPage({
      name: 'Application settings',
      path: 'application-settings',
      title: 'Application settings',
      subtitle: 'Control shared defaults used by every admin page, release environment and billing workflow.',
      badgeText: 'Workspace',
      sideTitle: 'Latest application changes',
      sideRows: [
        ['Locale defaults changed', 'Mike', 'Today 10:04'],
        ['Billing automation edited', 'Donald', 'Yesterday'],
        ['Release theme synced', 'Lycy', 'Apr 18'],
      ],
    }),
  ],
};
