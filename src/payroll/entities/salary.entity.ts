import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('salaries')
export class Salary extends BaseEntity {
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @OneToOne(() => User, (user) => user.salary)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
