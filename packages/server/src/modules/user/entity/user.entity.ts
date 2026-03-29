import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { AdminPermission, GlobalRole } from '@codigo/schema';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  username: string = '';

  @Column({ nullable: true })
  head_img: string = '';

  @Column()
  phone: string = '';

  @Column()
  password: string = '';

  @Column()
  open_id: string = '';

  @Column({ default: 'USER' })
  global_role: GlobalRole = 'USER';

  @Column({ type: 'simple-json', nullable: true })
  admin_permissions: AdminPermission[] | null = null;

  @Column({ default: 'active' })
  status: 'active' | 'frozen' = 'active';
}
