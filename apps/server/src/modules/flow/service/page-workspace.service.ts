import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  flattenComponentTree,
  type PageWorkspaceExplorerResponse,
  type PageWorkspaceFileResponse,
  type PageWorkspaceIDEConfigResponse,
  type PageWorkspaceResponse,
  type PutPageWorkspaceFileRequest,
  type PutPageWorkspaceFileResponse,
} from '@codigo/schema';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { Component, Page } from 'src/modules/flow/entity/low-code.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { DataSource, Repository } from 'typeorm';
import * as path from 'node:path';
import { PageWorkspaceFs } from 'src/modules/flow/service/page-workspace.fs';
import { PageWorkspaceSchema } from 'src/modules/flow/service/page-workspace.schema';

@Injectable()
export class PageWorkspaceService {
  private readonly fsHelper = new PageWorkspaceFs({ workspaceRootVirtual: '/codigo/pages' });

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  async getWorkspace(pageId: number, user: TCurrentUser): Promise<PageWorkspaceResponse> {
    const page = await this.ensurePageOwner(pageId, user);
    const pageWorkspaceDir = await this.fsHelper.getWorkspaceDir(pageId);
    const exists = fs.existsSync(pageWorkspaceDir);
    const schemaService = this.createSchemaService();
    const schema = await schemaService.loadPageSchema(pageId);
    const componentCount = flattenComponentTree(schema.components ?? []).length;
    const schemaFileAbsolutePath = path.join(
      pageWorkspaceDir,
      this.fsHelper.resolveSchemaFilePath(),
    );
    const lastSyncedAt =
      exists && fs.existsSync(schemaFileAbsolutePath)
        ? await this.fsHelper.readFileUpdatedAt(schemaFileAbsolutePath)
        : undefined;

    return {
      pageId,
      pageName: page.page_name,
      workspaceId: this.fsHelper.resolveWorkspaceId(pageId),
      workspaceName: `page-${pageId}`,
      workspaceRoot: `${this.fsHelper.resolveWorkspaceRootVirtual()}/${pageId}`.replace(
        /\/+/g,
        '/',
      ),
      workspaceRelativePath: `pages/${pageId}`,
      templateRoot: 'packages/template',
      packageJsonPath: 'package.json',
      schemaFilePath: this.fsHelper.resolveSchemaFilePath(),
      entryFilePath: 'src/main.tsx',
      packageManager: 'pnpm',
      installCommand: 'pnpm install',
      devCommand: 'pnpm dev',
      exists,
      componentCount,
      lastSyncedAt,
      schema: [],
    };
  }

  async syncWorkspace(pageId: number, user: TCurrentUser): Promise<PageWorkspaceResponse> {
    await this.ensurePageOwner(pageId, user);
    const pageWorkspaceDir = await this.fsHelper.getWorkspaceDir(pageId);
    const exists = fs.existsSync(pageWorkspaceDir);

    if (!exists) {
      await this.fsHelper.ensureWorkspaceDir(pageId);
      const templateRoot = await this.fsHelper.resolveTemplateRoot();
      await this.fsHelper.copyTemplate(templateRoot, pageWorkspaceDir);
    }

    const schemaService = this.createSchemaService();
    const schema = await schemaService.loadPageSchema(pageId);
    const schemaFileAbsolutePath = path.join(
      pageWorkspaceDir,
      this.fsHelper.resolveSchemaFilePath(),
    );
    await fsp.mkdir(path.dirname(schemaFileAbsolutePath), { recursive: true });
    await fsp.writeFile(
      schemaFileAbsolutePath,
      JSON.stringify(schema, null, 2),
      'utf-8',
    );

    const payload = await this.getWorkspace(pageId, user);
    return {
      ...payload,
      exists: true,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  async getExplorer(pageId: number, user: TCurrentUser): Promise<PageWorkspaceExplorerResponse> {
    await this.ensurePageOwner(pageId, user);
    const pageWorkspaceDir = await this.fsHelper.getWorkspaceDir(pageId);
    if (!fs.existsSync(pageWorkspaceDir)) {
      throw new BadRequestException('workspace_missing');
    }

    return {
      pageId,
      workspaceId: this.fsHelper.resolveWorkspaceId(pageId),
      rootPath: `${this.fsHelper.resolveWorkspaceRootVirtual()}/${pageId}`.replace(
        /\/+/g,
        '/',
      ),
      tree: await this.fsHelper.readExplorerTree(pageWorkspaceDir, ''),
    };
  }

  async readWorkspaceFile(
    pageId: number,
    filePath: string,
    user: TCurrentUser,
  ): Promise<PageWorkspaceFileResponse> {
    await this.ensurePageOwner(pageId, user);
    const pageWorkspaceDir = await this.fsHelper.getWorkspaceDir(pageId);
    if (!fs.existsSync(pageWorkspaceDir)) {
      throw new BadRequestException('workspace_missing');
    }
    const absolutePath = this.fsHelper.resolveWorkspaceFileAbsolutePath(
      pageWorkspaceDir,
      filePath,
    );
    const content = await fsp.readFile(absolutePath, 'utf-8');
    const updatedAt = await this.fsHelper.readFileUpdatedAt(absolutePath);
    const normalizedPath = this.fsHelper.normalizeWorkspacePath(filePath);

    return {
      pageId,
      workspaceId: this.fsHelper.resolveWorkspaceId(pageId),
      path: normalizedPath,
      absolutePath: this.fsHelper.buildVirtualAbsolutePath(pageId, normalizedPath),
      language: this.fsHelper.resolveLanguage(filePath),
      content,
      updatedAt,
    };
  }

  async writeWorkspaceFile(
    pageId: number,
    body: PutPageWorkspaceFileRequest,
    user: TCurrentUser,
  ): Promise<PutPageWorkspaceFileResponse> {
    await this.ensurePageOwner(pageId, user);
    const pageWorkspaceDir = await this.fsHelper.ensureWorkspaceDir(pageId);
    const absolutePath = this.fsHelper.resolveWorkspaceFileAbsolutePath(
      pageWorkspaceDir,
      body.path,
    );
    await fsp.mkdir(path.dirname(absolutePath), { recursive: true });
    await fsp.writeFile(absolutePath, body.content ?? '', 'utf-8');

    const normalizedPath = this.fsHelper.normalizeWorkspacePath(body.path);
    if (normalizedPath === this.fsHelper.resolveSchemaFilePath()) {
      const schemaService = this.createSchemaService();
      await schemaService.syncSchemaTextToDatabase(pageId, body.content ?? '', user);
    }

    const updatedAt = await this.fsHelper.readFileUpdatedAt(absolutePath);
    return {
      pageId,
      workspaceId: this.fsHelper.resolveWorkspaceId(pageId),
      path: normalizedPath,
      absolutePath: this.fsHelper.buildVirtualAbsolutePath(pageId, normalizedPath),
      language: this.fsHelper.resolveLanguage(normalizedPath),
      content: body.content ?? '',
      updatedAt,
    };
  }

  async getIDEConfig(
    pageId: number,
    user: TCurrentUser,
    options: { origin?: string },
  ): Promise<PageWorkspaceIDEConfigResponse> {
    await this.ensurePageOwner(pageId, user);
    const ideUrl = process.env.OPENSUMI_IDE_URL || 'http://localhost:8081';
    const origin = options.origin || '*';
    const workspaceDir = `${this.fsHelper.resolveWorkspaceRootVirtual()}/${pageId}`.replace(
      /\/+/g,
      '/',
    );
    const apiBaseUrl = process.env.SERVER_URL
      ? `${process.env.SERVER_URL.replace(/\/+$/, '')}/api`
      : '/api';

    return {
      pageId,
      workspaceId: this.fsHelper.resolveWorkspaceId(pageId),
      sessionId: `page-${pageId}`,
      provider: 'opensumi',
      mode: 'external-host',
      channelId: `codigo-${pageId}`,
      browserUrl: ideUrl,
      serverUrl: apiBaseUrl,
      wsUrl: undefined,
      hostOrigin: origin,
      workspaceDir,
      workspacePath: workspaceDir,
      terminalCwd: workspaceDir,
      previewUrl: undefined,
      launchQuery: {
        pageId: String(pageId),
        apiBaseUrl,
        workspaceRoot: workspaceDir,
      },
      capabilities: {
        fileSystem: true,
        terminal: false,
        preview: false,
      },
      heartbeatAt: new Date().toISOString(),
    };
  }

  private async ensurePageOwner(pageId: number, user: TCurrentUser) {
    const page = await this.pageRepository.findOneBy({
      id: pageId,
      account_id: user.id,
    });
    if (!page) {
      throw new ForbiddenException('无权限访问该页面');
    }
    return page;
  }

  private createSchemaService() {
    return new PageWorkspaceSchema(
      this.dataSource,
      this.pageRepository,
      this.componentRepository,
      this.pageVersionRepository,
    );
  }
}
