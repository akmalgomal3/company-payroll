import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../shared/entities/base.entity';

@Entity('attendances')
export class Attendance extends BaseEntity {
  @ManyToOne(() => User, (user) => user.attendances)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamp with time zone' })
  checkInTime: Date;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;
}
