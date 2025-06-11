import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;
}
