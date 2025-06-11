import { Test, TestingModule } from '@nestjs/testing';
import { EmployeePayrollController } from './employee-payroll.controller';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubmitOvertimeDto } from './dto/submit-overtime.dto';
import { Payslip } from './entities/payslip.entity';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Salary } from './entities/salary.entity';

describe('EmployeePayrollController', () => {
  let controller: EmployeePayrollController;
  let service: PayrollService;

  const mockEmployeeUser = { userId: 'employee-uuid', role: 'employee' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeePayrollController],
      providers: [
        PayrollService,
        { provide: getRepositoryToken(PayrollPeriod), useValue: {} },
        { provide: getRepositoryToken(Payslip), useValue: {} },
        { provide: getRepositoryToken(Overtime), useValue: {} },
        { provide: getRepositoryToken(Reimbursement), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Attendance), useValue: {} },
        { provide: getRepositoryToken(Salary), useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EmployeePayrollController>(
      EmployeePayrollController,
    );
    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call submitOvertime on service', async () => {
    const dto: SubmitOvertimeDto = {
      date: new Date(),
      hours: 2,
      description: 'Test Overtime',
    };
    const spy = jest
      .spyOn(service, 'submitOvertime')
      .mockResolvedValue(new Overtime());
    await controller.submitOvertime(mockEmployeeUser, dto);
    expect(spy).toHaveBeenCalledWith(mockEmployeeUser.userId, dto);
  });

  it('should call getMyPayslip on service', async () => {
    const periodId = 'some-period-uuid';
    const spy = jest
      .spyOn(service, 'getEmployeePayslip')
      .mockResolvedValue(new Payslip());
    await controller.getMyPayslip(mockEmployeeUser, periodId);
    expect(spy).toHaveBeenCalledWith(mockEmployeeUser.userId, periodId);
  });
});
