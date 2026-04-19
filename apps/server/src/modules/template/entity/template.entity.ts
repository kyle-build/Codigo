import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type {
  PageCategory,
  PageLayoutMode,
  TemplateDeviceType,
  TemplatePreset,
} from '@codigo/schema';

const templatePresetTransformer = {
  /**
   * Persists large template payloads as LONGTEXT instead of MySQL TEXT-backed simple-json.
   */
  to(value: TemplatePreset | null | undefined) {
    return JSON.stringify(value ?? {});
  },
  from(value: string | TemplatePreset | null): TemplatePreset {
    if (!value) return {} as TemplatePreset;
    if (typeof value !== 'string') return value as TemplatePreset;
    return JSON.parse(value) as TemplatePreset;
  },
};

@Entity({ name: 'template' })
export class Template {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ unique: true })
  key: string = '';

  @Column()
  name: string = '';

  @Column({ type: 'text' })
  desc: string = '';

  @Column({ type: 'simple-json' })
  tags: string[] = [];

  @Column()
  page_title: string = '';

  @Column({ type: 'varchar', length: 20 })
  page_category: PageCategory = 'admin';

  @Column({ type: 'varchar', length: 20 })
  layout_mode: PageLayoutMode = 'absolute';

  @Column({ type: 'varchar', length: 20 })
  device_type: TemplateDeviceType = 'pc';

  @Column({ type: 'int' })
  canvas_width: number = 1280;

  @Column({ type: 'int' })
  canvas_height: number = 900;

  @Column()
  active_page_path: string = '/';

  @Column({ type: 'int', default: 0 })
  pages_count: number = 0;

  @Column({ type: 'varchar', nullable: true })
  cover_url: string | null = null;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: 'draft' | 'published' | 'archived' = 'published';

  @Column({ type: 'int', default: 1 })
  version: number = 1;

  @Column({ type: 'longtext', transformer: templatePresetTransformer })
  preset: TemplatePreset = {} as TemplatePreset;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
