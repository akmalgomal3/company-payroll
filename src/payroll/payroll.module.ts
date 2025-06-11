import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { AdminPayrollController } from './admin-payroll.controller';
import { EmployeePayrollController } from './employee-payroll.controller';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { Payslip } from './entities/payslip.entity';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { Salary } from './entities/salary.entity';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollPeriod,
      Payslip,
      Overtime,
      Reimbursement,
      Salary,
      User,
      Attendance,
    ]),
    AuditModule,
  ],
  controllers: [AdminPayrollController, EmployeePayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
