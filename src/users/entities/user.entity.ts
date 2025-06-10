import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Role } from '../enums/role.enum';
import { Salary } from '../../payroll/entities/salary.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Overtime } from '../../payroll/entities/overtime.entity';
import { Reimbursement } from '../../payroll/entities/reimbursement.entity';
import { Payslip } from '../../payroll/entities/payslip.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.Employee })
  role: Role;

  @OneToOne(() => Salary, (salary) => salary.user, { cascade: true })
  salary: Salary;

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances: Attendance[];

  @OneToMany(() => Overtime, (overtime) => overtime.user)
  overtimes: Overtime[];

  @OneToMany(() => Reimbursement, (reimbursement) => reimbursement.user)
  reimbursements: Reimbursement[];

  @OneToMany(() => Payslip, (payslip) => payslip.user)
  payslips: Payslip[];
}
