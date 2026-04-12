// low-code.entity.ts
import type { IComponent, IComponentData, ILowCode } from '@codigo/schema';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { TComponentTypes } from '@codigo/schema';

@Entity({ name: 'page' })
export class Page implements ILowCode {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  account_id: number = 0;

  @Column()
  page_name: string = '';

  @Column({ type: 'simple-array' })
  components: string[] = [];

  @Column({ default: 1 })
  schema_version: number = 1;

  @Column()
  tdk: string = '';

  @Column()
  desc: string = '';

  @Column({ type: 'varchar', length: 20, default: 'admin' })
  pageCategory = 'admin' as const;

  @Column({ type: 'varchar', length: 20, default: 'absolute' })
  layoutMode = 'absolute' as const;

  @Column({ type: 'varchar', length: 20, default: 'pc' })
  deviceType: 'mobile' | 'pc' = 'pc';

  @Column({ default: 1280 })
  canvasWidth: number = 1280;

  @Column({ default: 900 })
  canvasHeight: number = 900;

  @Column({ default: false })
  lockEditing: boolean = false;
}

@Entity({ name: 'component' })
export class Component implements IComponent {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ type: 'varchar', length: 50 })
  type: TComponentTypes = 'titleText';

  @Column()
  page_id: number = 0;

  @Column()
  account_id: number = 0;

  @Column({ type: 'simple-json' })
  options: Record<string, any> = {};

  @Column()
  node_id: string = '';

  @Column({ type: 'varchar', nullable: true })
  parent_node_id: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  slot: string | null = null;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'simple-json', nullable: true })
  styles?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  meta?: Record<string, any>;
}

@Entity({ name: 'component_data' })
export class ComponentData implements IComponentData {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  page_id: number = 0;

  @Column()
  user: string = '';

  @Column({ type: 'simple-json' })
  props: {
    id: number;
    value: string | string[];
  }[] = [];
}
