import { BadRequestException } from '@nestjs/common';
import {
  buildComponentTree,
  flattenComponentTree,
  type ComponentNode,
  type IPageSchema,
} from '@codigo/schema';
import type { DataSource, Repository } from 'typeorm';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { Component, Page } from 'src/modules/flow/entity/low-code.entity';
import { PageVersion } from 'src/modules/flow/entity/page-version.entity';

export class PageWorkspaceSchema {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pageRepository: Repository<Page>,
    private readonly componentRepository: Repository<Component>,
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  async loadPageSchema(pageId: number): Promise<IPageSchema> {
    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page) {
      throw new BadRequestException('page_not_found');
    }

    const components = await this.componentRepository.find({
      where: { page_id: Number(pageId) },
      order: { id: 'ASC' },
    });
    const schemaFromDb: IPageSchema = {
      version: page.schema_version ?? 1,
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
        page.components ?? [],
      ),
      pages: undefined,
      activePageId: undefined,
    };

    const latestVersion = await this.pageVersionRepository.findOne({
      where: { page_id: Number(pageId) },
      order: { version: 'DESC' },
    });
    const schemaFromVersion = (latestVersion?.schema_data as any)?.schema as
      | IPageSchema
      | undefined;

    if (!schemaFromVersion) {
      return schemaFromDb;
    }

    return {
      version: schemaFromVersion.version ?? schemaFromDb.version,
      components:
        schemaFromVersion.components?.length
          ? schemaFromVersion.components
          : schemaFromDb.components,
      pages: schemaFromVersion.pages,
      activePageId: schemaFromVersion.activePageId,
    };
  }

  async syncSchemaTextToDatabase(pageId: number, schemaText: string, user: TCurrentUser) {
    let schema: IPageSchema | null = null;
    try {
      schema = JSON.parse(schemaText) as IPageSchema;
    } catch {
      throw new BadRequestException('schema_invalid_json');
    }

    if (!schema || typeof schema !== 'object') {
      throw new BadRequestException('schema_invalid');
    }

    if (!Array.isArray(schema.components)) {
      throw new BadRequestException('schema_components_missing');
    }

    const page = await this.pageRepository.findOneBy({ id: pageId });
    if (!page) {
      throw new BadRequestException('page_not_found');
    }

    const flattened = flattenComponentTree(schema.components as ComponentNode[]);
    const rootIds = (schema.components as ComponentNode[]).map((item) => item.id);

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.delete(Component, { page_id: pageId });

      if (flattened.length) {
        await queryRunner.manager.insert(
          Component,
          flattened.map((component) => ({
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
        schema_version: schema.version ?? page.schema_version ?? 1,
      });

      const lastVersion = await queryRunner.manager.findOne(PageVersion, {
        where: { page_id: pageId },
        order: { version: 'DESC' },
      });
      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;
      const schemaData: PageVersion['schema_data'] = {
        schema,
        schema_version: schema.version ?? page.schema_version ?? 1,
        source: 'webide',
      };

      await queryRunner.manager.insert(PageVersion, {
        page_id: pageId,
        account_id: user.id,
        version: nextVersion,
        desc: `WebIDE Sync ${nextVersion}`,
        schema_data: schemaData,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
