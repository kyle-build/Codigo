import type { TemplatePreset } from '@codigo/schema';
import { adminConsoleStandardTemplate } from 'src/modules/template/data/admin-console-standard';

export const DEFAULT_TEMPLATE_PRESETS: TemplatePreset[] = [
  adminConsoleStandardTemplate,
  {
    key: 'admin-console-basic',
    name: '通用后台管理模板（基础版）',
    desc: '包含概览与用户管理两页，用于快速搭建后台管理系统骨架。',
    tags: ['admin', 'console'],
    pageTitle: '后台管理系统',
    pageCategory: 'admin',
    layoutMode: 'absolute',
    deviceType: 'pc',
    canvasWidth: 1280,
    canvasHeight: 900,
    activePagePath: '/overview',
    pages: [
      {
        name: '概览',
        path: '/overview',
        components: [
          {
            type: 'container',
            props: {
              title: '',
              showChrome: false,
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: 16,
              padding: 24,
              minHeight: 520,
            },
            children: [
              {
                type: 'titleText',
                props: { title: 'Dashboard', size: 'xl' },
              },
            ],
          },
        ],
      },
      {
        name: '用户管理',
        path: '/users',
        components: [
          {
            type: 'container',
            props: {
              title: '',
              showChrome: false,
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: 16,
              padding: 24,
              minHeight: 520,
            },
            children: [
              {
                type: 'titleText',
                props: { title: 'Users', size: 'xl' },
              },
              {
                type: 'table',
                props: {
                  columnsText: JSON.stringify(
                    [
                      { title: 'ID', dataIndex: 'id' },
                      { title: 'Name', dataIndex: 'name' },
                      { title: 'Role', dataIndex: 'role' },
                    ],
                    null,
                    2,
                  ),
                  dataText: JSON.stringify(
                    [
                      { id: 1, name: 'Alice', role: 'Admin' },
                      { id: 2, name: 'Bob', role: 'User' },
                    ],
                    null,
                    2,
                  ),
                  size: 'middle',
                  bordered: true,
                  rowKey: 'id',
                  pagination: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
