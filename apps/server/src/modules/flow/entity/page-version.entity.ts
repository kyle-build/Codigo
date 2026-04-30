import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  type ValueTransformer,
} from 'typeorm';
import type { IPageVersion } from '@codigo/schema';

const jsonLongTextTransformer: ValueTransformer = {
  to(value: Record<string, any> | null | undefined) {
    return JSON.stringify(value ?? {});
  },
  from(value: string | Record<string, any> | null) {
    if (!value) {
      return {};
    }
    if (typeof value === 'string') {
      return JSON.parse(value) as Record<string, any>;
    }
    return value;
  },
};

@Entity({ name: 'page_version' })
export class PageVersion implements IPageVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column()
  page_id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  version: number = 1;

  @Column()
  desc: string = '';

  @Column({ type: 'longtext', transformer: jsonLongTextTransformer })
  schema_data: Record<string, any> = {};

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
