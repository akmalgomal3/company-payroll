import { Test, TestingModule } from '@nestjs/testing';
import { AdminPayrollController } from './admin-payroll.controller';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { Payslip } from './entities/payslip.entity';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Salary } from './entities/salary.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';

describe('AdminPayrollController', () => {
  let controller: AdminPayrollController;
  let service: PayrollService;

  const mockAdminUser = { userId: 'admin-uuid', role: 'admin' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPayrollController],
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

    controller = module.get<AdminPayrollController>(AdminPayrollController);
    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createPayrollPeriod on service', async () => {
    const dto: CreatePayrollPeriodDto = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    const spy = jest
      .spyOn(service, 'createPayrollPeriod')
      .mockResolvedValue(new PayrollPeriod());
    await controller.createPayrollPeriod(mockAdminUser, dto);
    expect(spy).toHaveBeenCalledWith(dto, mockAdminUser.userId);
  });

  it('should call runPayroll on service', async () => {
    const periodId = 'some-period-uuid';
    const spy = jest.spyOn(service, 'runPayroll').mockResolvedValue(undefined);
    await controller.runPayroll(mockAdminUser, periodId);
    expect(spy).toHaveBeenCalledWith(periodId, mockAdminUser.userId);
  });

  it('should call getPayrollSummary on service', async () => {
    const periodId = 'some-period-uuid';
    const spy = jest.spyOn(service, 'getPayrollSummary').mockResolvedValue({});
    await controller.getPayrollSummary(periodId);
    expect(spy).toHaveBeenCalledWith(periodId);
  });
});
