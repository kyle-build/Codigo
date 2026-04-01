import '@opensumi/ide-i18n';
import '@opensumi/ide-core-browser/lib/style/index.less';
import * as React from 'react';
import { configure } from 'mobx';
import { SlotLocation } from '@opensumi/ide-core-browser';
import { configureFileServiceContext } from '@codigo/file-service';

import { WebLiteModule } from '../web-lite';
import '../web-lite/i18n';
import { DEFAULT_URL, parseUri } from '../web-lite/utils';
import { CommonBrowserModules } from './common-modules';
import { renderApp } from './render-app';
import './styles.less';

// 视图和slot插槽的对应关系
const layoutConfig = {
  [SlotLocation.top]: {
    modules: ['@opensumi/ide-menu-bar'],
  },
  [SlotLocation.action]: {
    modules: [''],
  },
  [SlotLocation.left]: {
    modules: ['@opensumi/ide-explorer'],
  },
  [SlotLocation.main]: {
    modules: ['@opensumi/ide-editor'],
  },
  [SlotLocation.right]: {
    modules: [],
  },
  [SlotLocation.statusBar]: {
    modules: ['@opensumi/ide-status-bar'],
  },
  [SlotLocation.bottom]: {
    modules: ['@opensumi/ide-output'],
  },
  [SlotLocation.extra]: {
    modules: [],
  },
};

// 请求 github 仓库地址 在hash上添加地址即可 如 http://0.0.0.0:8081/#https://github.com/opensumi/core
// 支持分支及tag  如 http://0.0.0.0:8081/#https://github.com/opensumi/core/tree/v2.15.0

const hash =
  location.hash.startsWith('#') && location.hash.indexOf('github') > -1 ? location.hash.split('#')[1] : DEFAULT_URL;

const { platform, owner, name } = parseUri(hash);
const searchParams = new URLSearchParams(window.location.search);
const workspaceDir = searchParams.get('workspaceRoot') || `/${platform}/${owner}/${name}`;

installConsoleFilters();

configure({
  isolateGlobalState: true,
});

configureFileServiceContext({
  pageId: parsePageId(searchParams.get('pageId')),
  baseUrl: searchParams.get('apiBaseUrl') || undefined,
});

window.addEventListener(
  'message',
  (event: MessageEvent<{ type?: string; payload?: { token?: string; pageId?: number; apiBaseUrl?: string } }>) => {
    if (event.data?.type !== 'codigo:opensumi-app-context') {
      return;
    }

    configureFileServiceContext({
      token: event.data.payload?.token,
      pageId: event.data.payload?.pageId,
      baseUrl: event.data.payload?.apiBaseUrl,
    });
  },
);

if (window.parent !== window) {
  window.parent.postMessage({ type: 'codigo:opensumi-app-ready' }, '*');
}

renderApp({
  modules: [...CommonBrowserModules, WebLiteModule],
  layoutConfig,
  useCdnIcon: true,
  noExtHost: true,
  defaultPreferences: {
    'general.theme': 'ide-light',
    'general.icon': 'vsicons-slim',
    'editor.fontFamily': '"Cascadia Code", "Consolas", "Courier New", monospace',
    'editor.fontSize': 13,
    'editor.lineHeight': 21,
    'editor.minimap.enabled': false,
    'editor.quickSuggestionsDelay': 100,
    'editor.quickSuggestionsMaxCount': 50,
    'editor.cursorSmoothCaretAnimation': true,
    'editor.smoothScrolling': true,
    'editor.guides.indentation': true,
    'editor.bracketPairColorization.enabled': true,
    'editor.renderLineHighlight': 'all',
    'editor.padding.top': 10,
    'editor.padding.bottom': 10,
    'editor.scrollBeyondLastLine': false,
  },
  workspaceDir,
});

function parsePageId(value: string | null) {
  if (!value) {
    return undefined;
  }

  const pageId = Number(value);
  return Number.isNaN(pageId) ? undefined : pageId;
}

function installConsoleFilters() {
  const suppressedMessages = ['NOT SUPPORTED: option jsonPointers. Deprecated jsPropertySyntax can be used instead.'];

  const wrapConsoleMethod = (method: 'warn' | 'error') => {
    const originalMethod = console[method];
    console[method] = (...args: unknown[]) => {
      const message = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ');

      if (suppressedMessages.some((item) => message.includes(item))) {
        return;
      }

      return originalMethod.apply(console, args as Parameters<typeof originalMethod>);
    };
  };

  wrapConsoleMethod('warn');
  wrapConsoleMethod('error');
}
