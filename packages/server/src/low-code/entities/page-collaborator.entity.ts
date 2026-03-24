import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import type { PermissionRole } from '@codigo/schema';

@Entity({ name: 'page_collaborator' })
export class PageCollaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column()
  page_id: number = 0;

  @Column()
  user_id: number = 0;

  @Column()
  role: PermissionRole = 'viewer';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
