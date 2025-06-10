import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Payslip } from './payslip.entity';

@Entity('payroll_periods')
export class PayrollPeriod extends BaseEntity {
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: false })
  isProcessed: boolean;

  @OneToMany(() => Payslip, (payslip) => payslip.payrollPeriod)
  payslips: Payslip[];
}
