import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PayrollPeriod } from './payroll-period.entity';

@Entity('payslips')
export class Payslip extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PayrollPeriod)
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  proratedSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  reimbursementTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  takeHomePay: number;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;
}
