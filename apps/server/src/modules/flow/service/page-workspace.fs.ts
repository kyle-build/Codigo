import { BadRequestException } from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import type { PageWorkspaceExplorerResponse } from '@codigo/schema';

type ExplorerNode = PageWorkspaceExplorerResponse['tree'][number];

export type PageWorkspaceFsOptions = {
  workspaceRootVirtual: string;
};

export class PageWorkspaceFs {
  constructor(private readonly options: PageWorkspaceFsOptions) {}

  resolveWorkspaceRootVirtual() {
    return this.options.workspaceRootVirtual;
  }

  resolveWorkspaceId(pageId: number) {
    return `page-${pageId}`;
  }

  resolveSchemaFilePath() {
    return 'src/schema.json';
  }

  normalizeWorkspacePath(filePath: string) {
    return String(filePath || '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');
  }

  resolveLanguage(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.tsx') return 'tsx';
    if (ext === '.ts') return 'ts';
    if (ext === '.jsx') return 'jsx';
    if (ext === '.js') return 'js';
    if (ext === '.json') return 'json';
    if (ext === '.css') return 'css';
    if (ext === '.md') return 'markdown';
    if (ext === '.html') return 'html';
    return 'plaintext';
  }

  async ensureWorkspaceDir(pageId: number) {
    const base = await this.resolveWorkspaceBaseDir();
    const dir = path.join(base, String(pageId));
    await fsp.mkdir(dir, { recursive: true });
    return dir;
  }

  async getWorkspaceDir(pageId: number) {
    const base = await this.resolveWorkspaceBaseDir();
    return path.join(base, String(pageId));
  }

  async resolveTemplateRoot() {
    const repoRoot = await this.resolveRepoRoot();
    const templateRoot = path.join(repoRoot, 'packages', 'template');
    if (!fs.existsSync(templateRoot)) {
      throw new BadRequestException('template_missing');
    }
    return templateRoot;
  }

  async copyTemplate(fromDir: string, toDir: string) {
    const entries = await fsp.readdir(fromDir, { withFileTypes: true });
    await fsp.mkdir(toDir, { recursive: true });

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }

      const srcPath = path.join(fromDir, entry.name);
      const destPath = path.join(toDir, entry.name);

      if (entry.isDirectory()) {
        await this.copyTemplate(srcPath, destPath);
        continue;
      }

      await fsp.copyFile(srcPath, destPath);
    }
  }

  resolveWorkspaceFileAbsolutePath(pageWorkspaceDir: string, filePath: string) {
    const normalized = this.normalizeWorkspacePath(filePath);
    const resolved = path.resolve(pageWorkspaceDir, normalized);
    const workspaceResolved = path.resolve(pageWorkspaceDir);
    if (!resolved.startsWith(workspaceResolved)) {
      throw new BadRequestException('invalid_path');
    }
    return resolved;
  }

  buildVirtualAbsolutePath(pageId: number, filePath: string) {
    const normalized = this.normalizeWorkspacePath(filePath);
    return `${this.resolveWorkspaceRootVirtual()}/${pageId}/${normalized}`.replace(
      /\/+/g,
      '/',
    );
  }

  async readExplorerTree(pageWorkspaceDir: string, relativePath: string): Promise<ExplorerNode[]> {
    const dirPath = path.join(pageWorkspaceDir, relativePath);
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });

    const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.turbo']);
    const nodes: ExplorerNode[] = [];

    for (const entry of entries) {
      if (ignored.has(entry.name)) {
        continue;
      }

      const entryRelative = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;
      const normalizedPath = this.normalizeWorkspacePath(entryRelative);

      if (entry.isDirectory()) {
        const children = await this.readExplorerTree(pageWorkspaceDir, entryRelative);
        nodes.push({
          name: entry.name,
          path: normalizedPath,
          type: 'directory',
          children,
        });
        continue;
      }

      nodes.push({
        name: entry.name,
        path: normalizedPath,
        type: 'file',
      });
    }

    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return nodes;
  }

  async readFileUpdatedAt(absolutePath: string) {
    try {
      const stat = await fsp.stat(absolutePath);
      return stat.mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private async resolveWorkspaceBaseDir() {
    const repoRoot = await this.resolveRepoRoot();
    const workspaceDir = path.join(repoRoot, '.codigo-workspaces', 'pages');
    await fsp.mkdir(workspaceDir, { recursive: true });
    return workspaceDir;
  }

  private async resolveRepoRoot() {
    const candidates = this.getRepoRootCandidates(process.cwd());
    for (const candidate of candidates) {
      if (fs.existsSync(path.join(candidate, 'pnpm-workspace.yaml'))) {
        return candidate;
      }
    }
    return process.cwd();
  }

  private getRepoRootCandidates(startDir: string) {
    const resolved = path.resolve(startDir);
    const candidates: string[] = [];
    let current = resolved;
    for (let i = 0; i < 8; i++) {
      candidates.push(current);
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
    return candidates;
  }
}

