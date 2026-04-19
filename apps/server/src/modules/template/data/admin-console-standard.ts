import type { TemplateComponent, TemplatePagePreset, TemplatePreset } from '@codigo/schema';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 900;

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
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 96 },
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
        { left: 24, top: 194, width: 'calc(100% - 48px)', height: 140 },
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
        { left: 24, top: 350, width: 820, height: 320 },
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
        { left: 860, top: 350, width: 396, height: 320 },
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
        { left: 24, top: 686, width: 'calc(100% - 48px)', height: 190 },
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
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 96 },
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
        { left: 24, top: 194, width: 'calc(100% - 48px)', height: 120 },
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
        { left: 24, top: 330, width: 'calc(100% - 48px)', height: 546 },
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
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 96 },
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
        { left: 24, top: 194, width: 'calc(100% - 48px)', height: 682 },
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
        { left: 24, top: 82, width: 'calc(100% - 48px)', height: 96 },
      ),
      placeAbs(
        {
          type: 'titleText',
          props: { title: '基础配置', size: 'lg' },
        },
        { left: 24, top: 194, width: 320, height: 40 },
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
        { left: 24, top: 244, width: 560, height: 56 },
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
        { left: 24, top: 312, width: 560, height: 56 },
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
        { left: 24, top: 380, width: 560, height: 68 },
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
        { left: 24, top: 460, width: 560, height: 92 },
      ),
    ],
  };
}

export const adminConsoleStandardTemplate: TemplatePreset = {
  key: 'admin-console-standard',
  name: '通用后台管理模板（标准版）',
  desc: '包含侧边栏框架、运营概览、项目中心、用户管理与系统设置，开箱即像后台系统。',
  tags: ['admin', 'console', 'standard'],
  pageTitle: '后台管理系统',
  pageCategory: 'admin',
  layoutMode: 'absolute',
  deviceType: 'pc',
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  activePagePath: '/overview',
  pages: [
    createStandardOverviewPage(),
    createStandardProjectsPage(),
    createStandardUsersPage(),
    createStandardSettingsPage(),
  ],
};
