import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  TemplateListItem,
  TemplateListQuery,
  UpsertTemplateRequest,
} from '@codigo/schema';
import { Repository } from 'typeorm';
import { Template } from 'src/modules/template/entity/template.entity';
import { DEFAULT_TEMPLATE_PRESETS } from 'src/modules/template/data/default-templates';
import {
  applyPreset,
  asTemplateDetail,
  asTemplateListItem,
} from 'src/modules/template/utils/template.mapper';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  private readonly defaultTemplateVersions: Record<string, number> = {
    'admin-console-standard': 3,
    'admin-console-basic': 2,
  };

  async ensureDefaults() {
    for (const preset of DEFAULT_TEMPLATE_PRESETS) {
      const existing = await this.templateRepository.findOne({
        where: { key: preset.key },
      });
      const targetVersion = this.defaultTemplateVersions[preset.key] ?? 1;

      if (existing) {
        if ((existing.version ?? 1) >= targetVersion) continue;
        applyPreset(existing, preset);
        existing.cover_url = null;
        existing.status = 'published';
        existing.version = targetVersion;
        await this.templateRepository.save(existing);
        continue;
      }

      const entity = new Template();
      applyPreset(entity, preset);
      entity.cover_url = null;
      entity.status = 'published';
      entity.version = targetVersion;
      await this.templateRepository.save(entity);
    }
  }

  async getList(query: TemplateListQuery): Promise<TemplateListItem[]> {
    const qb = this.templateRepository.createQueryBuilder('t');

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.where('t.name LIKE :q OR t.`key` LIKE :q OR t.desc LIKE :q', { q });
    }
    if (query.pageCategory) {
      qb.andWhere('t.page_category = :pageCategory', {
        pageCategory: query.pageCategory,
      });
    }
    if (query.layoutMode) {
      qb.andWhere('t.layout_mode = :layoutMode', { layoutMode: query.layoutMode });
    }
    if (query.deviceType) {
      qb.andWhere('t.device_type = :deviceType', { deviceType: query.deviceType });
    }

    qb.orderBy('t.updated_at', 'DESC');

    const templates = await qb.getMany();
    return templates.map(asTemplateListItem);
  }

  async getDetailById(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }
    return asTemplateDetail(template);
  }

  async getDetailByKey(key: string) {
    const template = await this.templateRepository.findOne({ where: { key } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }
    return this.getDetailById(template.id);
  }

  async createTemplate(body: UpsertTemplateRequest) {
    const key = body.preset?.key;
    if (!key) {
      throw new BadRequestException('模板 key 不能为空');
    }
    const existing = await this.templateRepository.findOne({ where: { key } });
    if (existing) {
      throw new BadRequestException('模板 key 已存在');
    }

    const entity = new Template();
    applyPreset(entity, body.preset);
    entity.cover_url = body.coverUrl ?? null;
    entity.status = body.status ?? 'draft';
    entity.version = 1;
    const saved = await this.templateRepository.save(entity);
    return this.getDetailById(saved.id);
  }

  async updateTemplate(id: number, body: UpsertTemplateRequest) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (body.preset?.key && body.preset.key !== template.key) {
      const keyExists = await this.templateRepository.findOne({
        where: { key: body.preset.key },
      });
      if (keyExists) {
        throw new BadRequestException('模板 key 已存在');
      }
    }

    applyPreset(template, body.preset);
    template.cover_url = body.coverUrl ?? null;
    if (body.status) {
      template.status = body.status;
    }
    template.version = (template.version ?? 1) + 1;

    await this.templateRepository.save(template);
    return this.getDetailById(id);
  }

  async deleteTemplate(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }
    await this.templateRepository.delete({ id });
    return { msg: '删除成功' };
  }
}
