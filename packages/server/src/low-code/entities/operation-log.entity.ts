import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'operation_log' })
export class OperationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column()
  page_id: number = 0;

  @Column()
  actor_id: number = 0;

  @Column()
  event: string = '';

  @Column()
  target: string = '';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
