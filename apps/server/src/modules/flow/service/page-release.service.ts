import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  buildComponentTree,
  flattenComponentTree,
  type ComponentNode,
  type IEditorPageGroupSchema,
  type IEditorPageSchema,
  type IPageSchema,
  type PostReleaseRequest,
  type UpdateReleaseConfigRequest,
} from '@codigo/schema';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import {
  Component,
  ComponentData,
  Page,
} from 'src/modules/flow/entity/low-code.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';

function objectOmit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

@Injectable()
export class PageReleaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Component)
    private readonly componentRepository: Repository<Component>,
    @InjectRepository(ComponentData)
    private readonly componentDataRepository: Repository<ComponentData>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  /**
   * 为发布链路补齐缺失的 schema 节点标识，避免模板草稿缺少 id 时落库失败。
   */
  private createSchemaNodeId(prefix: string) {
    return `${prefix}_${randomUUID()}`;
  }

  /**
   * 递归补齐组件树节点 id，并深拷贝出可安全落库的节点结构。
   */
  private normalizeReleaseNodes(
    nodes: ComponentNode[] | undefined,
    prefix: string,
  ): ComponentNode[] {
    return (nodes ?? []).map((node, index) => {
      const currentId =
        typeof node.id === 'string' && node.id.trim().length > 0
          ? node.id
          : this.createSchemaNodeId(`${prefix}_${node.type}_${index}`);

      return {
        ...node,
        id: currentId,
        children: this.normalizeReleaseNodes(
          node.children ?? [],
          `${prefix}_${index}`,
        ),
      };
    });
  }

  private resolveReleaseSchema(body: PostReleaseRequest): IPageSchema {
    if (
      body.schema?.components?.length ||
      body.schema?.pages?.length ||
      body.schema?.pageGroups?.length
    ) {
      const normalizedPages = Array.isArray(body.schema.pages)
        ? body.schema.pages.map<IEditorPageSchema>((page, index) => {
            const pageId =
              typeof page.id === 'string' && page.id.trim().length > 0
                ? page.id
                : this.createSchemaNodeId(`page_${index}`);

            return {
              ...page,
              id: pageId,
              components: this.normalizeReleaseNodes(
                page.components ?? [],
                `page_${index}`,
              ),
            };
          })
        : undefined;
      const normalizedPageGroups = Array.isArray(body.schema.pageGroups)
        ? body.schema.pageGroups.map<IEditorPageGroupSchema>((group, index) => ({
            ...group,
            id:
              typeof group.id === 'string' && group.id.trim().length > 0
                ? group.id
                : this.createSchemaNodeId(`page_group_${index}`),
          }))
        : undefined;
      const activePageId =
        normalizedPages?.find((page) => page.id === body.schema?.activePageId)
          ?.id ??
        normalizedPages?.[0]?.id ??
        body.schema.activePageId;
      const activePageComponents =
        normalizedPages?.find((page) => page.id === activePageId)?.components ??
        body.schema.components;

      return {
        version: body.schema.version ?? 2,
        components: this.normalizeReleaseNodes(activePageComponents, 'root'),
        pages: normalizedPages,
        pageGroups: normalizedPageGroups,
        activePageId,
      };
    }

    const components = (body.components ?? []).map((component) => ({
      id:
        component.node_id ??
        (component.id ? String(component.id) : this.createSchemaNodeId('legacy')),
      type: component.type,
      name: component.name,
      props: component.options ?? {},
      styles: component.styles,
      slot: component.slot ?? undefined,
      meta: component.meta,
      children: [],
    })) as ComponentNode[];

    return {
      version: body.schema_version ?? 1,
      components,
    };
  }

  private buildPageSchema(
    components: Component[],
    rootIds: string[],
    version: number,
  ): IPageSchema {
    return {
      version,
      components: buildComponentTree(
        components.map((component) => ({
          id: component.node_id,
          type: component.type,
          name: component.name,
          props: component.options ?? {},
          styles: component.styles,
          slot: component.slot ?? undefined,
          meta: component.meta,
          parentId: component.parent_node_id,
        })),
        rootIds,
      ),
    };
  }

  private async buildReleaseData(page: Page) {
    const components = await this.componentRepository.find({
      where: {
        page_id: Number(page.id),
      },
      order: {
        id: 'ASC',
      },
    });
    const componentIds = page.components;
    const schemaFromDb = this.buildPageSchema(
      components,
      componentIds,
      page.schema_version ?? 1,
    );
    const latestVersion = await this.pageVersionRepository.findOne({
      where: { page_id: Number(page.id) },
      order: { version: 'DESC' },
    });
    const schemaFromVersion = (latestVersion?.schema_data as any)?.schema as
      | IPageSchema
      | undefined;
    const schema = schemaFromVersion
      ? {
          version: schemaFromVersion.version ?? schemaFromDb.version,
          components: schemaFromVersion.components?.length
            ? schemaFromVersion.components
            : schemaFromDb.components,
          pages: schemaFromVersion.pages,
          pageGroups: schemaFromVersion.pageGroups,
          activePageId: schemaFromVersion.activePageId,
        }
      : schemaFromDb;

    return {
      ...objectOmit(page, ['components']),
      components,
      componentIds,
      schema_version: page.schema_version ?? 1,
      schema,
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

  private resolveExpireAt(expireAt?: string | Date | null) {
    if (!expireAt) {
      return null;
    }
    const parsed = expireAt instanceof Date ? expireAt : new Date(expireAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('过期时间格式不正确');
    }
    return parsed;
  }

  private assertPageAccessible(page: Page, user?: TCurrentUser) {
    if (page.expire_at && page.expire_at.getTime() <= Date.now()) {
      throw new BadRequestException('当前发布链接已过期');
    }
    if (page.visibility === 'private') {
      if (!user) {
        throw new UnauthorizedException('当前发布内容仅限登录后访问');
      }
      if (Number(user.id) !== Number(page.account_id)) {
        throw new ForbiddenException('当前发布内容不可访问');
      }
    }
  }

  async release(body: PostReleaseRequest, user: TCurrentUser) {
    const resolvedSchema = this.resolveReleaseSchema(body);
    const normalizedBody: PostReleaseRequest = body.schema
      ? {
          ...body,
          schema: resolvedSchema,
        }
      : {
          ...body,
          schema: resolvedSchema,
          schema_version: resolvedSchema.version,
        };
    const { schema, components, schema_version, ...otherBody } = normalizedBody;
    const flattenedNodes = flattenComponentTree(resolvedSchema.components);
    const rootIds = resolvedSchema.components.map((item) => item.id);
    let id = 0;
    const queryRunner = this.dataSource.createQueryRunner();

    async function insertComponents(pageId: number) {
      if (flattenedNodes.length) {
        await queryRunner.manager.insert(
          Component,
          flattenedNodes.map((component) => ({
            node_id: component.id,
            parent_node_id: component.parentId ?? null,
            type: component.type,
            options: component.props ?? {},
            styles: component.styles as Record<string, any> | undefined,
            slot: component.slot ?? null,
            name: component.name,
            meta: component.meta as Record<string, any> | undefined,
            page_id: pageId,
            account_id: user.id,
          })),
        );
      }

      await queryRunner.manager.update(Page, pageId, {
        components: rootIds,
      });
    }

    async function updatePage(existingPage: Page) {
      await queryRunner.manager.update(Page, existingPage.id, {
        ...otherBody,
        components: [],
        schema_version: schema?.version ?? schema_version ?? 2,
      });

      for (const component of existingPage.components) {
        await queryRunner.manager.delete(Component, {
          page_id: existingPage.id,
          node_id: component,
        });
      }

      await queryRunner.manager.delete(Component, {
        page_id: existingPage.id,
      });

      const componentDatas = await queryRunner.manager.findBy(ComponentData, {
        page_id: existingPage.id,
      });
      for (const componentData of componentDatas) {
        await queryRunner.manager.delete(ComponentData, componentData.id);
      }

      await insertComponents(existingPage.id);
    }

    async function createPage() {
      const createdPage = await queryRunner.manager.insert(Page, {
        ...otherBody,
        account_id: user.id,
        components: [],
        schema_version: schema?.version ?? schema_version ?? 2,
      });
      const pageId = createdPage.identifiers[0].id;
      id = pageId;
      await insertComponents(pageId);
    }

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const existingPages = await queryRunner.manager.findBy(Page, {
        account_id: user.id,
      });

      if (existingPages.length > 0) {
        id = existingPages[0].id;
        await updatePage(existingPages[0]);
      } else {
        await createPage();
      }

      const lastVersion = await queryRunner.manager.findOne(PageVersion, {
        where: { page_id: id },
        order: { version: 'DESC' },
      });
      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

      await queryRunner.manager.insert(PageVersion, {
        page_id: id,
        account_id: user.id,
        version: nextVersion,
        desc: `Version ${nextVersion}`,
        schema_data: normalizedBody as any,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`发布失败: ${String(err)}`);
    } finally {
      await queryRunner.release();
    }

    return {
      msg: '发布成功',
      data: id,
    };
  }

  async updateReleaseConfig(
    pageId: number,
    config: UpdateReleaseConfigRequest,
    user: TCurrentUser,
  ) {
    const page = await this.ensurePageOwner(pageId, user);
    const expireAt = this.resolveExpireAt(config.expire_at ?? null);

    await this.pageRepository.update(page.id, {
      visibility: config.visibility,
      expire_at: expireAt,
    });

    return this.buildReleaseData({
      ...page,
      visibility: config.visibility,
      expire_at: expireAt,
    });
  }

  async getPublicPageList(limit: number = 12) {
    const rows = await this.pageRepository
      .createQueryBuilder('page')
      .leftJoin(User, 'owner', 'owner.id = page.account_id')
      .where('page.visibility = :visibility', { visibility: 'public' })
      .andWhere('(page.expire_at IS NULL OR page.expire_at > NOW())')
      .select([
        'page.id AS id',
        'page.page_name AS page_name',
        'page.desc AS page_desc',
        'owner.username AS owner_name',
        'owner.head_img AS owner_head_img',
      ])
      .orderBy('page.id', 'DESC')
      .take(limit)
      .getRawMany<{
        id: number;
        page_name: string;
        page_desc: string;
        owner_name: string;
        owner_head_img: string | null;
      }>();

    const pageIds = rows.map((row) => Number(row.id));
    if (!pageIds.length) {
      return [];
    }

    const versionStats = await this.pageVersionRepository
      .createQueryBuilder('version')
      .select('version.page_id', 'page_id')
      .addSelect('COUNT(*)', 'version_count')
      .addSelect('MAX(version.version)', 'latest_version')
      .addSelect('MAX(version.created_at)', 'latest_published_at')
      .where('version.page_id IN (:...pageIds)', { pageIds })
      .groupBy('version.page_id')
      .getRawMany<{
        page_id: number;
        version_count: string;
        latest_version: string;
        latest_published_at: string;
      }>();

    const versionStatMap = new Map(
      versionStats.map((item) => [Number(item.page_id), item]),
    );

    return rows.map((row) => {
      const stats = versionStatMap.get(Number(row.id));

      return {
        id: Number(row.id),
        page_name: row.page_name,
        desc: row.page_desc,
        owner_name: row.owner_name,
        owner_head_img: row.owner_head_img,
        version_count: Number(stats?.version_count ?? 0),
        latest_version: Number(stats?.latest_version ?? 0),
        latest_published_at: stats?.latest_published_at ?? null,
      };
    });
  }

  async getPageVersions(pageId: number, user: TCurrentUser) {
    await this.ensurePageOwner(pageId, user);
    return await this.pageVersionRepository.find({
      where: { page_id: pageId },
      order: { created_at: 'DESC' },
      select: ['id', 'page_id', 'account_id', 'version', 'desc', 'created_at'],
    });
  }

  async getPageVersionDetail(
    pageId: number,
    versionId: string,
    user: TCurrentUser,
  ) {
    await this.ensurePageOwner(pageId, user);
    const version = await this.pageVersionRepository.findOne({
      where: { page_id: pageId, id: versionId },
    });
    if (!version) {
      throw new BadRequestException('版本不存在');
    }
    return version;
  }

  async getReleaseData(id: number | null, user?: TCurrentUser) {
    if (id == null) {
      return null;
    }

    const page = user
      ? await this.pageRepository.findOneBy({
          id,
        })
      : await this.pageRepository.findOneBy({ id });
    if (!page) return null;
    this.assertPageAccessible(page, user);

    return this.buildReleaseData(page);
  }

  async getMyReleaseData(user: TCurrentUser) {
    const page = await this.pageRepository.findOneBy({
      account_id: Number(user.id),
    });
    if (!page) return null;

    return this.buildReleaseData(page);
  }
}
