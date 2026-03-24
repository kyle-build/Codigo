import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { GlobalRole } from '@codigo/schema';

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

  @Column({ default: 'active' })
  status: 'active' | 'frozen' = 'active';
}
