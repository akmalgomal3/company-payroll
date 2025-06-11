import { Test, TestingModule } from '@nestjs/testing';
import { EmployeePayrollController } from './employee-payroll.controller';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubmitOvertimeDto } from './dto/submit-overtime.dto';
import { SubmitReimbursementDto } from './dto/submit-reimbursement.dto';
import { Overtime } from './entities/overtime.entity';
import { Reimbursement } from './entities/reimbursement.entity';
import { Payslip } from './entities/payslip.entity';

describe('EmployeePayrollController', () => {
  let controller: EmployeePayrollController;
  let service: PayrollService;

  const mockEmployeeUser = { userId: 'employee-uuid', role: 'employee' };
  const mockPayrollService = {
    submitOvertime: jest.fn(),
    submitReimbursement: jest.fn(),
    getEmployeePayslip: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeePayrollController],
      providers: [{ provide: PayrollService, useValue: mockPayrollService }],
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

  it('should call submitOvertime on service with correct arguments', async () => {
    const dto: SubmitOvertimeDto = {
      date: new Date(),
      hours: 2,
      description: 'Test OT',
    };
    const mockIp = '127.0.0.1';
    jest.spyOn(service, 'submitOvertime').mockResolvedValue(new Overtime());

    await controller.submitOvertime(mockEmployeeUser, dto, mockIp);

    expect(service.submitOvertime).toHaveBeenCalledWith(
      mockEmployeeUser.userId,
      dto,
      mockIp,
    );
  });

  it('should call submitReimbursement on service with correct arguments', async () => {
    const dto: SubmitReimbursementDto = {
      date: new Date(),
      amount: 50000,
      description: 'Test Reimb',
    };
    const mockIp = '127.0.0.1';
    jest
      .spyOn(service, 'submitReimbursement')
      .mockResolvedValue(new Reimbursement());

    await controller.submitReimbursement(mockEmployeeUser, dto, mockIp);

    expect(service.submitReimbursement).toHaveBeenCalledWith(
      mockEmployeeUser.userId,
      dto,
      mockIp,
    );
  });

  it('should call getMyPayslip on service with correct arguments', async () => {
    const periodId = 'some-period-uuid';
    jest.spyOn(service, 'getEmployeePayslip').mockResolvedValue(new Payslip());

    await controller.getMyPayslip(mockEmployeeUser, periodId);

    expect(service.getEmployeePayslip).toHaveBeenCalledWith(
      mockEmployeeUser.userId,
      periodId,
    );
  });
});
